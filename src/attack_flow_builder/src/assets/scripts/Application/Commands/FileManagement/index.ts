import Configuration from "@/assets/configuration/app.configuration";
import { Device } from "@/assets/scripts/Browser";
import { DoNothing } from "../index.commands";
import { AppCommand } from "../index.commands";
import { stripExtension } from "@OpenChart/Utilities";
import { StixToAttackFlowConverter } from "@/assets/scripts/StixToAttackFlow";
import { TreeContourLayoutEngine, DiagramObjectViewFactory, DiagramViewFile } from "@OpenChart/DiagramView";
import { buildDirectProviderDiagramFile } from "@/assets/scripts/Application/DirectProviderFlow";
import {
    ClearFileRecoveryBank,
    ImportFile,
    LoadFile,
    PrepareEditorWithFile,
    PublishDiagramFileToDevice,
    RemoveFileFromRecoveryBank,
    SaveDiagramFileToDevice,
    SaveDiagramImageToDevice,
    SaveSelectionImageToDevice
} from "./index.commands";
import type { StixBundle } from "@/assets/scripts/StixToAttackFlow";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { DiagramLayoutEngine, DiagramViewExport } from "@OpenChart/DiagramView";
import type { DiagramViewEditor } from "@/assets/scripts/OpenChart/DiagramEditor";
import type { StructuredExtractionResult } from "@/assets/scripts/Application/StructuredExtraction";


///////////////////////////////////////////////////////////////////////////////
//  1. Open Files  ////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

const autoLayoutEngine : DiagramLayoutEngine = new TreeContourLayoutEngine();

/**
 * Loads an empty diagram file into the application.
 * @param context
 *  The application's context.
 * @returns
 *  A command that represents the action.
 */
export async function loadNewFile(
    context: ApplicationStore
): Promise<LoadFile> {
    // Construct file
    const file = new DiagramViewFile(await getObjectFactory(context));
    // Return command
    return new LoadFile(context, file);
}

function isValidLayout(layoutObject: unknown): boolean {
    return typeof layoutObject === "object" && layoutObject !== null &&
        !Array.isArray(layoutObject) && Object.keys(layoutObject).length > 0;
}

function isValidCamera(cameraObject: unknown): boolean {
    const isObject = typeof cameraObject === "object" && cameraObject !== null && !Array.isArray(cameraObject);
    let validFields = false;
    if (isObject) {
        const fields = ["x", "y", "k"];
        validFields = fields.every((f) => Object.prototype.hasOwnProperty.call(cameraObject, f));
    }
    return isObject && validFields;
}

/**
 * Loads a diagram file export into the application.
 * @param context
 *  The application's context.
 * @param file
 *  The file export.
 * @param name
 *  The file's name.
 * @returns
 *  A command that represents the action.
 */
export async function loadExistingFile(
    context: ApplicationStore, file: string, name?: string
): Promise<LoadFile> {
    if (isStixBundleText(file)) {
        return loadExistingStixFile(context, file, name);
    }

    let jsonFile = JSON.parse(file) as DiagramViewExport;
    // Preprocess file
    if (context.activeFilePreprocessor) {
        jsonFile = context.activeFilePreprocessor.process(jsonFile);
    }
    // Construct factory
    const factory = await getObjectFactory(context, jsonFile.schema);

    const generatedAutoLayout = (jsonFile as { generated_layout?: unknown }).generated_layout === "auto";
    if (generatedAutoLayout) {
        // Explicitly clear generated layout to let auto layout engine take over.
        jsonFile.layout = undefined;
    }

    // Construct file
    const viewFile = new DiagramViewFile(factory, jsonFile);
    // Run layout
    if (generatedAutoLayout || !isValidLayout(jsonFile.layout)) {
        viewFile.runLayout(autoLayoutEngine);
    }
    //viewFile.compactActionAssetStacks();
    if (generatedAutoLayout || !isValidCamera(jsonFile.camera)) {
        viewFile.centerAndZoomCamera();
    }
    // Return command
    return new LoadFile(context, viewFile, name);
}

/**
 * Loads a diagram file, from the file system, into the application.
 * @param context
 *  The application's context.
 * @returns
 *  A command that represents the action.
 */
export async function loadFileFromFileSystem(
    context: ApplicationStore
): Promise<AppCommand> {
    const file = await Device.openTextFileDialog(Configuration.file_type_extension);
    if (file) {
        const filename = stripExtension(file.filename);
        return loadExistingFile(context, file.contents as string, filename);
    } else {
        return new DoNothing();
    }
}

/**
 * Loads a diagram file, from a remote url, into the application.
 * @param context
 *  The application's context.
 * @param url
 *  The remote url.
 * @returns
 *  A command that represents the action.
 */
export async function loadFileFromUrl(
    context: ApplicationStore, url: string
): Promise<LoadFile> {
    const path = new URL(url).pathname.split(/\//g);
    // Parse filename
    let filename = path[path.length - 1];
    if (filename) {
        filename = stripExtension(decodeURI(filename));
    } else {
        filename = "Untitled File";
    }
    const file = await (await fetch(url)).text();
    return isStixBundleText(file)
        ? loadExistingStixFile(context, file, filename)
        : loadExistingFile(context, file, filename);
}

/**
 * Loads a STIX file into the application.
 * @param context
 *  The application's context.
 * @param file
 *  The STIX file.
 * @param name
 *  The file's name.
 * @returns
 *  A command that represents the action.
 */
export async function loadExistingStixFile(
    context: ApplicationStore, file: string, name?: string
): Promise<LoadFile> {
    const stixBundle = JSON.parse(file) as StixBundle;
    // Construct factory
    const factory = await getObjectFactory(context);
    // Translate STIX
    const jsonFile = new StixToAttackFlowConverter(factory).convert(stixBundle);
    // Construct file
    const viewFile = new DiagramViewFile(factory, jsonFile);
    viewFile.runLayout(autoLayoutEngine);
    // Return command
    return new LoadFile(context, viewFile, name);
}

/**
 * Loads a stix file, from the file system, into the application.
 * @param context
 *  The application's context.
 * @returns
 *  A command that represents the action.
 */
export async function loadStixFileFromFileSystem(
    context: ApplicationStore
): Promise<AppCommand> {
    const file = await Device.openTextFileDialog("json");
    if (file) {
        const filename = stripExtension(file.filename);
        return loadExistingStixFile(context, file.contents as string, filename);
    } else {
        return new DoNothing();
    }
}

/**
 * Returns the requested object factory.
 * @param context
 *  The application's context.
 * @param id
 *  The requested schema.
 *  (Default: The Primary Application Schema)
 * @returns
 */
async function getObjectFactory(
    context: ApplicationStore, id?: string
): Promise<DiagramObjectViewFactory> {
    // Resolve theme
    const themeId = context.settings.view.diagram.theme;
    const theme = await context.themeRegistry.getTheme(themeId);
    // Resolve schema
    const schema = Configuration.schema;
    if (id && id !== schema.id) {
        throw new Error(`Unsupported schema: '${id}'`);
    }
    // Construct factory
    return new DiagramObjectViewFactory(schema, theme);
}


///////////////////////////////////////////////////////////////////////////////
//  2. Import Files  //////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Imports a diagram file into an existing editor.
 * @param context
 *  The application context.
 * @param editor
 *  The editor to import into.
 * @param file
 *  The file to import.
 * @returns
 *  A command that represents the action.
 */
export async function importExistingFile(
    context: ApplicationStore, editor: DiagramViewEditor, file: string
): Promise<AppCommand> {
    if (isStixBundleText(file)) {
        return importExistingStixFile(context, editor, file);
    }

    // Parse file
    let jsonFile = JSON.parse(file) as DiagramViewExport;
    // Preprocess file
    if (context.activeFilePreprocessor) {
        jsonFile = context.activeFilePreprocessor.process(jsonFile);
    }
    // Construct factory
    const factory = await getObjectFactory(context, jsonFile.schema);
    // Construct file
    const viewFile = new DiagramViewFile(factory, jsonFile);
    // Run layout
    if (!isValidLayout(jsonFile.layout)) {
        viewFile.runLayout(autoLayoutEngine);
    }
    if (!isValidCamera(jsonFile.camera)) {
        viewFile.centerAndZoomCamera();
    }
    // Import file
    return new ImportFile(context, editor, viewFile);
}

/**
 * Imports a diagram file, from the file system, into the application.
 * @param context
 *  The application context.
 * @param file
 *  The file to import.
 */
export async function importFileFromFilesystem(
    context: ApplicationStore, editor: DiagramViewEditor
): Promise<AppCommand> {
    const file = await Device.openTextFileDialog(Configuration.file_type_extension);
    if (file) {
        return importExistingFile(context, editor, file.contents as string);
    } else {
        return new DoNothing();
    }
}

/**
 * Imports a STIX file into an existing editor.
 * @param context
 *  The application context.
 * @param editor
 *  The editor to import into.
 * @param file
 *  The file to import.
 * @returns
 *  A command that represents the action.
 */
export async function importExistingStixFile(
    context: ApplicationStore, editor: DiagramViewEditor, file: string
): Promise<AppCommand> {
    const stixBundle = JSON.parse(file) as StixBundle;
    // Construct factory
    const factory = await getObjectFactory(context);
    factory.theme = editor.file.factory.theme;
    // Translate STIX
    const jsonFile = new StixToAttackFlowConverter(factory).convert(stixBundle);
    // Construct file
    const viewFile = new DiagramViewFile(factory, jsonFile);
    viewFile.runLayout(autoLayoutEngine);
    // Return command
    return new ImportFile(context, editor, viewFile);
}

/**
 * Imports a STIX file, from the file system, into the application.
 * @param context
 *  The application context.
 * @param editor
 *  The editor to import into.
 * @returns
 *  A command that represents the action.
 */
export async function importStixFileFromFilesystem(
    context: ApplicationStore, editor: DiagramViewEditor
) {
    const file = await Device.openTextFileDialog("json");
    if (file) {
        return importExistingStixFile(context, editor, file.contents as string);
    } else {
        return new DoNothing();
    }
}


function isStixBundleText(file: string): boolean {
    try {
        const parsed = JSON.parse(file) as { type?: unknown };
        return parsed.type === "bundle";
    } catch {
        return false;
    }
}


///////////////////////////////////////////////////////////////////////////////
//  3. Prepare Editor with File  //////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Prepares the editor with an empty file.
 * @param context
 *  The application context.
 * @returns
 *  A command that represents the action.
 */
export async function prepareEditorFromNewFile(
    context: ApplicationStore
): Promise<PrepareEditorWithFile> {
    return new PrepareEditorWithFile(context, await loadNewFile(context));
}

/**
 * Prepares the editor with an existing file.
 * @param context
 *  The application context.
 * @param file
 *  The file export.
 * @param name
 *  The file's name.
 * @returns
 *  A command that represents the action.
 */
export async function prepareEditorFromExistingFile(
    context: ApplicationStore, file: string, name?: string
): Promise<PrepareEditorWithFile> {
    return new PrepareEditorWithFile(context, await loadExistingFile(context, file, name));
}

/**
 * Prepares the editor with an existing file from the file system.
 * @param context
 *  The application context.
 * @returns
 *  A command that represents the action.
 */
export async function prepareEditorFromFileSystem(
    context: ApplicationStore
): Promise<AppCommand> {
    const cmd = await loadFileFromFileSystem(context);
    if (cmd instanceof LoadFile) {
        return new PrepareEditorWithFile(context, cmd);
    } else {
        return cmd;
    }
}

/**
 * Prepares the editor with an existing STIX file.
 * @param context
 *  The application context.
 * @param file
 *  The STIX file.
 * @returns
 *  A command that represents the action.
 */
export async function prepareEditorFromExistingStixFile(
    context: ApplicationStore, file: string
): Promise<PrepareEditorWithFile> {
    return new PrepareEditorWithFile(context, await loadExistingStixFile(context, file));
}

/**
 * Prepares the editor with an existing STIX file from the file system.
 * @param context
 *  The application context.
 * @returns
 *  A command that represents the action.
 */
export async function prepareEditorFromStixFileSystem(
    context: ApplicationStore
): Promise<AppCommand> {
    const cmd = await loadStixFileFromFileSystem(context);
    if (cmd instanceof LoadFile) {
        return new PrepareEditorWithFile(context, cmd);
    } else {
        return cmd;
    }
}

/**
 * Prepares the editor with an existing file from a remote url.
 * @param context
 *  The application context.
 * @param url
 *  The remote url.
 * @returns
 *  A command that represents the action.
 */
export async function prepareEditorFromUrl(
    context: ApplicationStore, url: string
): Promise<PrepareEditorWithFile> {
    return new PrepareEditorWithFile(context, await loadFileFromUrl(context, url));
}

/**
 * Prepares the editor with a validated direct-provider generated flow.
 * @param context
 *  The application context.
 * @param extraction
 *  The validated structured extraction payload.
 * @returns
 *  A command that represents the action.
 */
export async function prepareEditorFromValidatedStructuredExtraction(
    context: ApplicationStore,
    extraction: StructuredExtractionResult
): Promise<PrepareEditorWithFile> {
    const file = await buildDirectProviderDiagramFile(context, extraction);
    const name = extraction.attack_flow.name.trim() || "Generated Attack Flow";
    const exportFile = {
        ...file.toExport(),
        layout: {},
        camera: undefined
    };
    return new PrepareEditorWithFile(context, await loadExistingFile(context, JSON.stringify(exportFile), name));
}


///////////////////////////////////////////////////////////////////////////////
//  4. Save / Export Files  ///////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Saves a diagram file to the user's file system.
 * @param context
 *  The application's context.
 * @returns
 *  A command that represents the action.
 */
export function saveActiveFileToDevice(
    context: ApplicationStore
): SaveDiagramFileToDevice {
    return new SaveDiagramFileToDevice(context, context.activeEditor);
}

/**
 * Publishes a diagram file to the user's file system.
 * @param context
 *  The application's context.
 * @returns
 *  A command that represents the action.
 */
export function publishActiveFileToDevice(
    context: ApplicationStore
) {
    return new PublishDiagramFileToDevice(context, context.activeEditor);
}

/**
 * Saves a diagram file to the user's file system.
 * @param context
 *  The application context.
 * @returns
 *  A command that represents the action.
 */
export function saveDiagramImageToDevice(
    context: ApplicationStore
) {
    return new SaveDiagramImageToDevice(context, context.activeEditor);
}

/**
 * Saves a diagram's selection as an image to the user's file system.
 * @param context
 *  The application context.
 * @returns
 *  A command that represents the action.
 */
export function saveSelectionImageToDevice(
    context: ApplicationStore
) {
    return new SaveSelectionImageToDevice(context, context.activeEditor);
}


///////////////////////////////////////////////////////////////////////////////
//  5. File Recovery Bank  ////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Removes a file from the application's file recovery bank.
 * @param context
 *  The application context.
 * @param id
 *  The file's id.
 * @returns
 *  A command that represents the action.
 */
export function removeFileFromRecoveryBank(
    context: ApplicationStore, id: string
): RemoveFileFromRecoveryBank {
    return new RemoveFileFromRecoveryBank(context, id);
}

/**
 * Clears the application's file recovery bank.
 * @param context
 *  The application context.
 * @returns
 *  A command that represents the action.
 */
export function clearFileRecoveryBank(
    context: ApplicationStore
): ClearFileRecoveryBank {
    return new ClearFileRecoveryBank(context);
}

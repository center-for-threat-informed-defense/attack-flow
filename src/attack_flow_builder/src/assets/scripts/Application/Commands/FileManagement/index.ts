import Configuration from "@/assets/configuration/app.configuration";
import { Device } from "@/assets/scripts/Browser";
import { DoNothing } from "../index.commands";
import { DiagramObjectViewFactory, DiagramViewFile } from "@OpenChart/DiagramView";
import { ClearFileRecoveryBank, LoadFile, PrepareEditorWithFile, RemoveFileFromRecoveryBank, SaveDiagramFileToDevice } from "./index.commands";
import type { AppCommand } from "../index.commands";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { DiagramViewExport } from "@OpenChart/DiagramView";
import { StixToFlow } from "@/assets/scripts/StixToFlow/StixToFlow";
import type { StixBundle } from "@/assets/scripts/StixToFlow/StixBundle";


///////////////////////////////////////////////////////////////////////////////
//  1. Open / Import Files  ///////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


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
    // Get theme
    const themeId = context.settings.view.diagram.theme;
    const theme = await context.themeRegistry.getTheme(themeId);
    // Construct factory
    const schema = Configuration.schema;
    const factory = new DiagramObjectViewFactory(schema, theme);
    // Construct file
    const file = new DiagramViewFile(factory);
    // Return command
    return new LoadFile(context, file);
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
    const jsonFile = JSON.parse(file) as DiagramViewExport;
    // Resolve theme
    const themeId = context.settings.view.diagram.theme;
    const theme = await context.themeRegistry.getTheme(jsonFile.theme ?? themeId);
    // Resolve schema
    const schema = Configuration.schema;
    if(jsonFile.schema !== schema.id) {
        throw new Error(`Unsupported schema: '${jsonFile.schema}'`);
    }
    // Construct factory
    const factory = new DiagramObjectViewFactory(schema, theme);
    // Construct file
    const viewFile = new DiagramViewFile(factory, jsonFile);
    // Run layout
    if(!jsonFile.layout) {
        // TODO: Run automated layout
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
    if(file) {
        return loadExistingFile(context, file.contents as string, file.filename);
    } else {
        return new DoNothing();
    }
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
    // Resolve theme
    const themeId = context.settings.view.diagram.theme;
    const theme = await context.themeRegistry.getTheme(themeId);
    // Resolve schema
    const schema = Configuration.schema;
    // Construct factory
    const factory = new DiagramObjectViewFactory(schema, theme);
    // Construct stix
    const canvas = StixToFlow.toFlow(stixBundle, factory);
    const viewFile = new DiagramViewFile(factory, canvas);
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
    if(file) {
        return loadExistingStixFile(context, file.contents as string, file.filename);
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
    const filename = path[path.length - 1].match(/.*(?=\.[^\.]*$)/) ?? ["untitled_file"];
    return loadExistingFile(context, await (await fetch(url)).text(), filename[0]);
}


///////////////////////////////////////////////////////////////////////////////
//  2. Prepare Editor with File  //////////////////////////////////////////////
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
    if(cmd instanceof LoadFile) {
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
    if(cmd instanceof LoadFile) {
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


///////////////////////////////////////////////////////////////////////////////
//  3. Save / Export Files  ///////////////////////////////////////////////////
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


///////////////////////////////////////////////////////////////////////////////
//  4. File Recovery Bank  ////////////////////////////////////////////////////
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
    return new ClearFileRecoveryBank(context)
}

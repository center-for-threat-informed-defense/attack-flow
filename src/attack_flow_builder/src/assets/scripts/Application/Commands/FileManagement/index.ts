import Configuration from "@/assets/configuration/app.configuration";
import { Device } from "@/assets/scripts/Browser";
import { DiagramObjectViewFactory, DiagramViewFile } from "@OpenChart/DiagramView";
import { ClearFileRecoveryBank, LoadFile, SaveDiagramFileToDevice } from "./index.commands";
import { DoNothing } from "../index.commands";
import type { AppCommand } from "../index.commands";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { DiagramViewExport } from "@OpenChart/DiagramView";
import type { StixBundle } from "@/assets/scripts/StixToFlow/StixToFlow";


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
export async function loadSTIXFile(
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
    // Construct file
    const viewFile = new DiagramViewFile(factory, undefined, stixBundle);
    // Return command
    return new LoadFile(context, viewFile, name);
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
 * Imports a diagram file export into the active editor.
 * @param context
 *  The application's context.
 * @returns
 *  A command that represents the action.
 */
// export async function importExistingFile(
//     context: ApplicationStore, file: string
// ): Promise<ImportFile> {
//     // Deserialize file
//     const json = context.fileSerializer.deserialize(file);
//     // Return command
//     return new ImportFile(context, json);
// }

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
    const file = await Device.openTextFileDialog(Configuration.file_type_extension, "json");
    if(file) {
        if (file.filename.endsWith(".json")) {
            return loadSTIXFile(context, file.contents as string, file.filename);
        }
        return loadExistingFile(context, file.contents as string, file.filename);
    } else {
        return new DoNothing();
    }
}

/**
 * Imports diagram files, from the file system, into the active editor.
 * @param context
 *  The application's context.
 * @returns
 *  A command that represents the action.
 */
// export async function importFileFromFileSystem(
//     context: ApplicationStore
// ): Promise<ImportFile> {
//     const files = await Browser.openTextFileDialog([Configuration.file_type_extension], true);
//     // Deserialize files
//     const json = new Array<MappingFileImport>(files.length);
//     for(let i = 0; i < json.length; i++) {
//         json[i] = context.fileSerializer.deserialize(files[i].contents as string);
//     }
//     // Merge files
//     const file = context.fileAuthority.mergeMappingFileImports(json);
//     // Return command
//     return new ImportFile(context, file);
// }

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

/**
 * Imports a diagram file, from a remote url, into the active editor.
 * @param context
 *  The application's context.
 * @param url
 *  The remote url.
 * @returns
 *  A command that represents the action.
 */
// export async function importFileFromUrl(
//     context: ApplicationStore, url: string
// ): Promise<ImportFile> {
//     return importExistingFile(context, await (await fetch(url)).text());
// }


///////////////////////////////////////////////////////////////////////////////
//  2. Save / Export Files  ///////////////////////////////////////////////////
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
//  3. File Recovery Bank  ////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


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

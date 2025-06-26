import { 
    CopySelectedChildrenToClipboard,
    CutSelectedChildrenToClipboard,
    PasteFileFromClipboard,
    SetTheme,
    StartRecommender,
    StopRecommender,
    ZoomCamera
} from "./index.commands";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { DiagramObjectView } from "@OpenChart/DiagramView";
import type { DiagramViewEditor } from "@OpenChart/DiagramEditor";


///////////////////////////////////////////////////////////////////////////////
//  1. Camera  ////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Zooms an editor interface's camera in or out.
 * @param editor
 *  The editor.
 * @param delta
 *  The camera's change in zoom.
 * @returns
 *  A command that represents the action.
 */
export function zoomCamera(
    editor: DiagramViewEditor, delta: number
): ZoomCamera {
    return new ZoomCamera(editor, delta);
}

/**
 * Resets an editor interface's camera to 100% zoom.
 * @param editor
 *  The editor.
 * @returns
 *  A command that represents the action.
 */
export function resetCamera(
    editor: DiagramViewEditor
): ZoomCamera {
    return new ZoomCamera(editor, 1 - editor.file.camera.k);
}


///////////////////////////////////////////////////////////////////////////////
//  2. Recommender  ///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Starts the application's object recommender.
 * @param context
 *  The application context.
 * @param object
 *  The recommender's active target.
 * @returns
 *  A command that represents the action.
 */
export function startRecommender(
    context: ApplicationStore, object: DiagramObjectView
) {
    return new StartRecommender(context, object);
}

/**
 * Stops the application's object recommender.
 * @param context
 *  The application context.
 * @returns
 *  A command that represents the action.
 */
export function stopRecommender(
    context: ApplicationStore
) {
    return new StopRecommender(context);
}


///////////////////////////////////////////////////////////////////////////////
//  3. Theming  ///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Sets the active editor's theme.
 * @param context
 *  The application context.
 * @param theme
 *  The theme.
 * @returns
 *  A command that represents the action.
 */
export function setTheme(
    context: ApplicationStore, theme: string
) {
    return new SetTheme(context, theme);
}


///////////////////////////////////////////////////////////////////////////////
//  4. Clipboard  /////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Copies the active editor's selected children to the device's clipboard.
 * @param context
 *  The application context.
 * @returns
 *  A command that represents the action.
 */
export function copyActiveSelectionToClipboard(
    context: ApplicationStore
) {
    return new CopySelectedChildrenToClipboard(context, context.activeEditor);
}

/**
 * Pastes the device's clipboard into the specified editor.
 * @param context
 *  The application context.
 * @returns
 *  A command that represents the action.
 */
export function pasteFileFromClipboard(
    context: ApplicationStore
) {
    return new PasteFileFromClipboard(context, context.activeEditor);
}

/**
 * Cuts the active editor's selected children to the device's clipboard.
 * @param context
 *  The application context.
 * @returns
 *  A command that represents the action.
 */
export function cutActiveSelectionToClipboard(
    context: ApplicationStore
) {
    return new CutSelectedChildrenToClipboard(context, context.activeEditor);
}

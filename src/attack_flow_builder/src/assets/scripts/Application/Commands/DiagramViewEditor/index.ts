import { SetTheme, StartRecommender, StopRecommender, ZoomCamera } from "./index.commands";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { DiagramObjectView } from "@OpenChart/DiagramView";
import type { DiagramViewEditor } from "@OpenChart/DiagramEditor";

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

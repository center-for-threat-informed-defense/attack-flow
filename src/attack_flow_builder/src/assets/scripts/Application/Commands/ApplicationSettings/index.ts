import { 
    EnableAnimations,
    EnableDebugInfo,
    EnableImageExportBackground,
    EnableShadows,
    LoadSettings
} from "./index.commands";
import type { AppSettings } from "@/assets/scripts/Application";
import type { ApplicationStore } from "@/stores/ApplicationStore";

/**
 * Loads the application's settings.
 * @param context
 *  The application context.
 * @param settings
 *  The application's settings.
 * @returns
 *  A command that represents the action.
 */
export function loadSettings(
    context: ApplicationStore, settings: AppSettings
): LoadSettings {
    return new LoadSettings(context, settings);
}

/**
 * Toggles the application's animations.
 * @param context
 *  The application context.
 * @param value
 *  Whether to enable or disable the application's animations.
 * @returns
 *  A command that represents the action.
 */
export function enableAnimations(
    context: ApplicationStore, value: boolean
): EnableAnimations {
    return new EnableAnimations(context, value);
}

/**
 * Toggles the application's shadows.
 * @param context
 *  The application context.
 * @param value
 *  Whether to enable or disable the application's shadows.
 * @returns
 *  A command that represents the action.
 */
export function enableShadows(
    context: ApplicationStore, value: boolean
): EnableShadows {
    return new EnableShadows(context, value);
}

/**
 * Toggles the application's debug display.
 * @param context
 *  The application context.
 * @param value
 *  Whether to enable or disable the application's debug display.
 * @returns
 *  A command that represents the action.
 */
export function enableDebugInfo(
    context: ApplicationStore, value: boolean
): EnableDebugInfo {
    return new EnableDebugInfo(context, value);
}

/**
 * Toggles the application's image export background.
 * @param context
 *  The application context.
 * @param value
 *  Whether to enable or disable the background during image export.
 * @returns
 *  A command that represents the action.
 */
export function enableImageExportBackground(
    context: ApplicationStore, value: boolean
) {
    return new EnableImageExportBackground(context, value);
}

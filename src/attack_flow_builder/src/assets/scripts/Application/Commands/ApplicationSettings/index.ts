import { LoadSettings } from "./index.commands";
import type { AppSettings } from "@/assets/scripts/Application";
import type { ApplicationStore } from "@/stores/ApplicationStore";

/**
 * Loads the application's settings.
 * @param context
 *  The application's context.
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

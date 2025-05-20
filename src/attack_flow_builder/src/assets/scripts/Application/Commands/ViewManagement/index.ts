import {
    HideSplashMenu,
    OpenHyperlink,
    ShowSplashMenu,
    SwitchToFullscreen
} from "./index.commands";
import type { ApplicationStore } from "@/stores/ApplicationStore";

/**
 * Opens an external hyperlink.
 * @param url
 *  The hyperlink's url.
 * @returns
 *  A command that represents the action.
 */
export function openHyperlink(url: string): OpenHyperlink {
    return new OpenHyperlink(url);
}

/**
 * Switches the application to fullscreen mode.
 * @returns
 *  A command that represents the action.
 */
export function switchToFullscreen(): SwitchToFullscreen {
    return new SwitchToFullscreen();
}

/**
 * Display the splash menu.
 * @param ctx
 *  The application context.
 * @returns
 *  A command that represents the action.
 */
export function showSplashMenu(ctx: ApplicationStore): ShowSplashMenu {
    return new ShowSplashMenu(ctx);
}

/**
 * Hide the splash menu.
 * @param ctx
 *  The application context.
 * @returns
 *  A command that represents the action.
 */
export function hideSplashMenu(ctx: ApplicationStore): HideSplashMenu {
    return new HideSplashMenu(ctx);
}

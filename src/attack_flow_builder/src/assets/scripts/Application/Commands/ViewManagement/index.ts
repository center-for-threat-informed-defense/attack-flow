import {
    OpenHyperlink,
    SwitchToFullscreen
} from "./index.commands";

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

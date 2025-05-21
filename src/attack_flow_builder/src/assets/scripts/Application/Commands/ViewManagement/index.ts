import {
    HideSearchMenu,
    HideSplashMenu,
    OpenHyperlink,
    RunSearch,
    ShowSearchMenu,
    ShowSplashMenu,
    SwitchToFullscreen,
    ToNextSearchResult,
    ToPreviousSearchResult
} from "./index.commands";
import type { OpenChartFinder } from "@/assets/scripts/OpenChartFinder";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { DiagramViewEditor } from "@OpenChart/DiagramEditor";


///////////////////////////////////////////////////////////////////////////////
//  1. Search  ////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Display the search menu.
 * @param ctx
 *  The application context.
 * @returns
 *  A command that represents the action.
 */
export function showSearchMenu(ctx: ApplicationStore): ShowSplashMenu {
    return new ShowSearchMenu(ctx);
}

/**
 * Hide the search menu.
 * @param ctx
 *  The application context.
 * @returns
 *  A command that represents the action.
 */
export function hideSearchMenu(ctx: ApplicationStore): HideSplashMenu {
    return new HideSearchMenu(ctx);
}

/**
 * Runs a search on an editor.
 * @param finder
 *  The finder to operate on.
 * @param editor
 *  The editor to search.
 * @param query
 *  The search query.
 * @returns
 *  A command that represents the action.
 */
export function runSearch(
    finder: OpenChartFinder, editor: DiagramViewEditor, query: string
) {
    return new RunSearch(finder, editor, query);
}

/**
 * Advances the finder to the next search result.
 * @param finder
 *  The finder to operate on.
 * @returns
 *  A command that represents the action.
 */
export function toNextSearchResult(
    finder: OpenChartFinder
) {
    return new ToNextSearchResult(finder);
}


/**
 * Advances the finder to the previous search result.
 * @param finder
 *  The finder to operate on.
 * @returns
 *  A command that represents the action.
 */
export function toPreviousSearchResult(
    finder: OpenChartFinder
) {
    return new ToPreviousSearchResult(finder);
}


///////////////////////////////////////////////////////////////////////////////
//  2. Splash Menu  ///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Display the splash menu.
 * @param ctx
 *  The application context.
 * @returns
 *  A command that represents the action.
 */
export function showSplashMenu(
    ctx: ApplicationStore
): ShowSplashMenu {
    return new ShowSplashMenu(ctx);
}

/**
 * Hide the splash menu.
 * @param ctx
 *  The application context.
 * @returns
 *  A command that represents the action.
 */
export function hideSplashMenu(
    ctx: ApplicationStore
): HideSplashMenu {
    return new HideSplashMenu(ctx);
}


///////////////////////////////////////////////////////////////////////////////
//  3. Miscellaneous  /////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


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

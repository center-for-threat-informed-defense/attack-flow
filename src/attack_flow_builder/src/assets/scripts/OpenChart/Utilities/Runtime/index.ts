import { JavaScriptEngine } from "./JavaScriptEngine";

export * from "./JavaScriptEngine";

/**
 * Returns the runtime's JavaScript engine.
 * @remarks
 *  Currently, there is no full-proof way to determine the runtime's JavaScript
 *  engine. Although, we can make an educated guess by cross-referencing the
 *  browser's rendering engine with its most common JavaScript engine.
 *
 *  References:
 *   - {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Browser_detection_using_the_user_agent#rendering_engine}
 *   - {@link https://en.wikipedia.org/wiki/List_of_ECMAScript_engines}
 *
 * @returns
 *  The runtime's JavaScript engine.
 */
export function getJavaScriptEngine(): JavaScriptEngine {
    if (typeof navigator === "undefined") {
        // Assume node outside of the browser
        return JavaScriptEngine.V8;
    }
    // Chrome
    if (navigator.userAgent.search(/Chrome\/.*/) !== -1) {
        return JavaScriptEngine.V8;
    }
    // Firefox
    else if (navigator.userAgent.search(/Gecko\/.*/) !== -1) {
        return JavaScriptEngine.SpiderMonkey;
    }
    // Safari
    else if (navigator.userAgent.search(/AppleWebKit\/.*/) !== -1) {
        return JavaScriptEngine.JavaScriptCore;
    }
    // Opera (Presto)
    else if (navigator.userAgent.search(/Opera\/.*/) !== -1) {
        return JavaScriptEngine.Carakan;
    }
    // Opera (Blink)
    else if (navigator.userAgent.search(/OPR\/.*/) !== -1) {
        return JavaScriptEngine.V8;
    }
    // Microsoft Edge (Legacy)
    else if (navigator.userAgent.search(/Edge\/.*/) !== -1) {
        return JavaScriptEngine.Chakra;
    }
    // Misc
    else {
        return JavaScriptEngine.Unknown;
    }
}

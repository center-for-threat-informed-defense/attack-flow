import { NodeFontStore } from "./NodeFontStore";
import { BrowserFontStore } from "./BrowserFontStore";
import type { FontStore } from "./FontStore";

export * from "./Font";
export * from "./FontStore";
export * from "./FontDescriptor";
export * from "./TextMeasurements";

export const GlobalFontStore: FontStore = (function() {
    if (typeof document === "undefined") {
        return new NodeFontStore();
    } else {
        return new BrowserFontStore();
    }
})();

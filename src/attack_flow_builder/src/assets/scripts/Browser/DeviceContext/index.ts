import { NodeContext } from "./NodeContext";
import { BrowserContext } from "./BrowserContext";
import type { DeviceContext } from "./DeviceContext";

export * from "./OperatingSystems";

export const Device: DeviceContext = (function() {
    if (typeof document === "undefined") {
        return new NodeContext();
    } else {
        return new BrowserContext();
    }
})();

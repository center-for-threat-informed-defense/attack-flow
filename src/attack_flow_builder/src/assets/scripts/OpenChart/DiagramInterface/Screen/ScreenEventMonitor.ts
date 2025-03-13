import { EventEmitter } from "@OpenChart/Utilities";

class ScreenEventMonitor extends EventEmitter<{
    "dppx-change" : (dpr: number) => void;
}> {

    /**
     * Creates a new {@link ScreenEventMonitor}.
     */
    constructor() {
        super();
        if (typeof document !== "undefined") {
            this.listenForPixelRatioChange();
        }
    }

    /**
     * Listens for changes in the device's current pixel ratio.
     */
    private listenForPixelRatioChange() {
        window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
            .addEventListener("change", () => {
                this.emit("dppx-change", window.devicePixelRatio);
                this.listenForPixelRatioChange();
            }, { once: true });
    }

}

export const Screen = new ScreenEventMonitor();

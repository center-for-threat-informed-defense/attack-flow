export class DisplaySettings {

    /**
     * Whether to show or hide grid markers.
     */
    public showGrid: boolean;

    /**
     * Whether to show or hide shadows.
     */
    public showShadows: boolean;

    /**
     * Whether to show or hide debug information.
     */
    public showDebug: boolean;

    /**
     * The scale level shadow's disable at.
     */
    public disableShadowsAt: number;

    /**
     * Creates a new {@link DiagramDisplaySettings}.
     */
    constructor() {
        this.showGrid = true;
        this.showShadows = true;
        this.showDebug = false;
        this.disableShadowsAt = 0;
    }

}

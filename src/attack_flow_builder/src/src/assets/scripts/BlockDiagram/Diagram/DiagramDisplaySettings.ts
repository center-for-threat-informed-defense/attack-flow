export class DiagramDisplaySettings {

    /**
     * If the grid should be displayed or not.
     */
    public showGrid: boolean;

    /**
     * If shadow's should be displayed or not.
     */
    public showShadows: boolean;
    
    /**
     * If debug information should be displayed or not.
     */
    public showDebug: boolean;

    /**
     * The diagram's supersampling anti-aliasing (SSAA) level.
     */
    public ssaaScale: number;

    /**
     * Sets the scale level shadows disable at.
     */
    public shadowsDisableAt: number;

    /**
     * Creates a new {@link DiagramDisplaySettings}.
     */
    constructor() {
        this.showGrid = true;
        this.showShadows = true;
        this.showDebug = false;
        this.ssaaScale = 1;
        this.shadowsDisableAt = 0;
    }

}

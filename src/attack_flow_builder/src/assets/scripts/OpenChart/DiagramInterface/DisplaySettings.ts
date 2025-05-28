import type { RenderSettings } from "@OpenChart/DiagramView";

export class DisplaySettings implements RenderSettings {

    /**
     * Whether shadows were requested by the interface or not.
     */
    public requestShadows: boolean;

    /**
     * The scale level shadow's are disabled at.
     */
    public disableShadowsAt: number;

    /**
     * Whether animations are enabled or disabled.
     */
    public animationsEnabled: boolean;

    /**
     * Whether debug information is enabled or disabled.
     */
    public debugInfoEnabled: boolean;


    /**
     * Whether shadows are enabled or disabled. (Internal)
     */
    private _shadowsEnabled: boolean;

    /**
     * Whether shadows are enabled or disabled.
     */
    public get shadowsEnabled(): boolean {
        return this._shadowsEnabled;
    }


    /**
     * Creates a new {@link DiagramDisplaySettings}.
     */
    constructor() {
        this.requestShadows = true;
        this.disableShadowsAt = 0;
        this._shadowsEnabled = true;
        this.animationsEnabled = true;
        this.debugInfoEnabled = false;
    }


    /**
     * Updates render settings based on the current transform.
     * @param transform
     *  The context's current transform.
     * @returns
     *  The {@link DisplaySettings}.
     */
    public update(transform: d3.ZoomTransform): DisplaySettings {
        // Update render settings
        this._shadowsEnabled = this.requestShadows && this.disableShadowsAt <= transform.k;
        // Return
        return this;
    }

}

export class ViewportRegion {

    /**
     * The viewport's minimum x coordinate.
     */
    public xMin: number

    /**
     * The viewport's minimum y coordinate.
     */
    public yMin: number

    /**
     * The viewport's maximum x coordinate.
     */
    public xMax: number

    /**
     * The viewport's maximum y coordinate.
     */
    public yMax: number;

    /**
     * The viewport's scale.
     */
    public scale: number;

    /**
     * Creates a new {@link ViewportRegion}.
     */
    constructor() {
        this.xMin = 0;
        this.yMin = 0;
        this.xMax = 0;
        this.yMax = 0;
        this.scale = 1;
    }

}

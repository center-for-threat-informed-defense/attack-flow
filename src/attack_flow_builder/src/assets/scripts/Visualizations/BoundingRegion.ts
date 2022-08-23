export class BoundingRegion {

    /**
     * The bounding region's minimum x coordinate.
     */
    public xMin: number

    /**
     * The bounding region's minimum y coordinate.
     */
    public yMin: number

    /**
     * The bounding region's center x coordinate.
     */
    public xMid: number;

    /**
     * The bounding region's center y coordinate.
     */
    public yMid: number;

    /**
     * The bounding region's maximum x coordinate.
     */
    public xMax: number

    /**
     * The bounding region's maximum y coordinate.
     */
    public yMax: number;

    /**
     * Creates a new BoundingRegion.
     */
    constructor() {
        this.xMin = 0;
        this.yMin = 0;
        this.xMid = 0;
        this.yMid = 0;
        this.xMax = 0;
        this.yMax = 0;
    }

}

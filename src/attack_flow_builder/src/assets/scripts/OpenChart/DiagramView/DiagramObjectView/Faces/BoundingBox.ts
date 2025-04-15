export class BoundingBox {

    /**
     * The bounding region's x coordinate.
     * @remarks
     *  In most cases, this is the bounding region's central coordinate.
     *  However, **this is not guaranteed**. Different faces may choose to
     *  position this coordinate differently.
     * 
     *  If the central coordinate is needed, use `xMid` instead.
     */
    public x: number;

    /**
     * The bounding region's y coordinate.
     * @remarks
     *  In most cases, this is the bounding region's central coordinate.
     *  However, **this is not guaranteed**. Different faces may choose to
     *  position this coordinate differently.
     * 
     *  If the central coordinate is needed, use `yMid` instead.
     */
    public y: number;

    /**
     * The bounding region's minimum x coordinate.
     */
    public xMin: number;

    /**
     * The bounding region's minimum y coordinate.
     */
    public yMin: number;

    /**
     * The bounding region's maximum x coordinate.
     */
    public xMax: number;

    /**
     * The bounding region's maximum y coordinate.
     */
    public yMax: number;


    /**
     * The bounding region's central x coordinate.
     */
    public get xMid(): number {
        return (this.xMin + this.xMax) / 2
    }

    /**
     * The bounding region's central y coordinate.
     */
    public get yMid(): number {
        return (this.yMin + this.yMax) / 2
    }

    /**
     * The bounding region's width.
     */
    public get width(): number {
        return this.xMax - this.xMin;
    }

    /**
     * The bounding region's height.
     */
    public get height(): number {
        return this.yMax - this.yMin;
    }

    /**
     * The bounding region's vertices.
     */
    public get vertices(): number[] {
        return [
            this.xMin, this.yMin,
            this.xMax, this.yMin,
            this.xMax, this.yMax,
            this.xMin, this.yMax
        ]
    }


    /**
     * Creates a new {@link BoundingBox}.
     * @param xMin
     *  The bounding box's minimum x-axis coordinate.
     *  (Default: 0)
     * @param yMin
     *  The bounding box's minimum y-axis coordinate.
     *  (Default: 0)
     * @param xMax
     *  The bounding box's maximum x-axis coordinate.
     *  (Default: 0)
     * @param yMax
     *  The bounding box's maximum y-axis coordinate.
     *  (Default: 0)
     */
    constructor(
        xMin: number = 0,
        yMin: number = 0,
        xMax: number = 0,
        yMax: number = 0
    ) {
        this.x = 0;
        this.y = 0;
        this.xMin = xMin;
        this.yMin = yMin;
        this.xMax = xMax;
        this.yMax = yMax;
    }


    /**
     * Tests if the bounding box overlaps the specified region.
     * @param region
     *  The region's bounding box.
     * @returns
     *  True if they overlap, false otherwise.
     */
    public overlaps(region: BoundingBox): boolean {
        return this.xMin <= region.xMax && region.xMin <= this.xMax
            && this.yMin <= region.yMax && region.yMin <= this.yMax;
    }

    /**
     * Tests if the bounding region is inside the specified region.
     * @param region 
     */
    public inside(region: BoundingBox): boolean {
        return region.xMin <= this.xMin && this.xMax <= region.xMax
            && region.yMin <= this.yMin && this.yMax <= region.yMax;
    }

    /**
     * Tests if the bounding box contains the specified coordinate.
     * @param x
     *  The x coordinate.
     * @param y
     *  The y coordinate.
     * @returns
     *  True if the bounding box contains the point, false otherwise.
     */
    public contains(x: number, y: number): boolean {
        return this.xMin <= x && x <= this.xMax
            && this.yMin <= y && y <= this.yMax;
    }

}

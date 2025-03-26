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
     * Creates a new {@link BoundingBox}.
     */
    constructor() {
        this.x = 0;
        this.y = 0;
        this.xMin = 0;
        this.yMin = 0;
        this.xMax = 0;
        this.yMax = 0;
    }

}

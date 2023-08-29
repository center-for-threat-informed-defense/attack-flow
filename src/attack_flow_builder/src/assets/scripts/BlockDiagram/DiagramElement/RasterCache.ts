///////////////////////////////////////////////////////////////////////////////
//  1. RasterCache  ///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export class RasterCache {

    /**
     * The raster cache's internal scale.
     */
    private _scale: number;

    /**
     * The internal raster cache.
     */
    private _cache: Map<string, Raster>;


    /**
     * Creates a new {@link RasterCache}.
     */
    constructor() {
        this._scale = window.devicePixelRatio;
        this._cache = new Map();
    }


    /**
     * Creates a new {@link Raster}.
     * @param id
     *  The id of the raster.
     * @param w
     *  The width of the raster.
     * @param h
     *  The height of the raster.
     * @param p
     *  The amount of padding to add to the raster.
     *  (Default: 0)
     */
    public createRaster(id: string, w: number, h: number, p: number = 0): Raster {
        // Create raster
        let raster = new Raster(w, h, p, this._scale);
        // Register raster
        this._cache.set(id, raster);
        // Return raster
        return raster;
    }

    /**
     * Draws a raster to the context.
     * @param context
     *  The context to draw to.
     * @param id
     *  The id of the raster.
     * @param x
     *  The x-axis coordinate on the destination context.
     * @param y
     *  The y-axis coordinate on the destination context.
     * @returns 
     *  True if the raster was drawn, false if no raster with that id exists.
     */
    public drawRaster(context: CanvasRenderingContext2D, id: string, x: number, y: number): boolean {
        let r = this._cache.get(id);
        if (r) {
            context.drawImage(r.canvas, x - r.cx, y - r.cy, r.w, r.h);
            return true;
        }
        return false;
    }

    /**
     * Dumps the raster cache and updates its scale.
     * @param scale
     *  The new scale value.
     */
    public setScale(scale: number) {
        this._scale = scale * window.devicePixelRatio;
        this._cache.clear();
    }

    /**
     * Returns the cache's current scale.
     * @returns
     *  The cache's current scale.
     */
    public getScale(): number {
        return this._scale / window.devicePixelRatio;
    }

}


///////////////////////////////////////////////////////////////////////////////
//  2. Raster  ////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export class Raster {

    /**
     * The raster's canvas.
     */
    public readonly canvas: HTMLCanvasElement;

    /**
     * The raster's context.
     */
    public readonly context: CanvasRenderingContext2D;

    /**
     * The raster's center on the x-axis.
     */
    public readonly cx: number;

    /**
     * The raster's center on the y-axis.
     */
    public readonly cy: number;

    /**
     * The raster's full width.
     */
    public readonly w: number;

    /**
     * The raster's full height.
     */
    public readonly h: number;

    /**
     * The raster's padding.
     */
    public readonly p: number;


    /**
     * The raster's fill style.
     */
    public set fillStyle(value: string) {
        this.context.fillStyle = value;
    }

    /**
     * The raster's font.
     */
    public set font(value: string) {
        this.context.font = value;
    }

    /**
     * The raster's line width.
     */
    public set lineWidth(value: number) {
        this.context.lineWidth = value;
    }

    /**
     * The raster's stroke style.
     */
    public set strokeStyle(value: string) {
        this.context.strokeStyle = value;
    }

    /**
     * The raster's text baseline.
     */
    public set textBaseline(value: CanvasTextBaseline) {
        this.context.textBaseline = value;
    }


    /**
     * Creates a new {@link Raster}.
     * @param w
     *  The width of the raster.
     * @param h
     *  The height of the raster.
     * @param p
     *  The raster's padding.
     * @param k
     *  The scale of the raster.
     */
    constructor(w: number, h: number, p: number, k: number) {
        let tp = p << 1;
        // Prepare canvas
        this.canvas = document.createElement("canvas");
        this.canvas.width = Math.round((w + tp) * k);
        this.canvas.height = Math.round((h + tp) * k);
        // Prepare context
        this.context = this.canvas.getContext("2d")!;
        this.context.setTransform(k, 0, 0, k, 0, 0);
        // Calculate dimensions
        this.h = h + tp;
        this.w = w + tp;
        this.cx = Math.round(this.w / 2);
        this.cy = Math.round(this.h / 2);
        this.p = p;
    }


    /**
     * Starts a new path.
     */
    public beginPath() {
        this.context.beginPath();
    }

    /**
     * Attempts to add a straight line from the current point to the start of
     * the current sub-path. If the shape has already been closed or has only
     * one point, this function does nothing.
     */
    public closePath() {
        this.context.closePath();
    }

    /**
     * Begins a new sub-path at the point specified
     * @param x
     *  The x-axis coordinate. 
     * @param y
     *  The y-axis coordinate.
     */
    public moveTo(x: number, y: number) {
        this.context.moveTo(this.p + x, this.p + y);
    }

    /**
     * Adds a straight line to the current sub-path by connecting the
     * sub-path's last point to the specified coordinates.
     * @param x
     *  The x-axis coordinate.
     * @param y
     *  The y-axis coordinate.
     */
    public lineTo(x: number, y: number) {
        this.context.lineTo(this.p + x, this.p + y);
    }

    /**
     * Outlines the current or given path with the current stroke style.
     */
    public stroke() {
        this.context.stroke();
    }

    /**
     * Fills the current or given path with the current fillStyle.
     */
    public fill() {
        this.context.fill();
    }

    /**
     * Draws a text string at the specified coordinates, filling the string's
     * characters with the current fillStyle.
     * @param text
     *  The text string.
     * @param x
     *  The x-axis coordinate.
     * @param y
     *  The y-axis coordinate.
     */
    public fillText(text: string, x: number, y: number) {
        this.context.fillText(text, x, y);
    }

    /**
     * Draws a rectangular path to the context.
     * @param x
     *  The top-left x coordinate.
     * @param y
     *  The top-left y coordinate.
     * @param w
     *  The width of the rectangle.
     * @param h
     *  The height of the rectangle.
     * @param r
     *  The rectangle's border radius.
     * @param s
     *  The rectangle's stroke width.
     *  (Default: 1)
     */
    public drawRect(
        x: number, y: number,
        w: number, h: number,
        r: number, s?: number
    ): void;

    /**
     * Draws a rectangular path to the context.
     * @param x
     *  The top-left x coordinate.
     * @param y
     *  The top-left y coordinate.
     * @param w
     *  The width of the rectangle.
     * @param h
     *  The height of the rectangle.
     * @param r
     *  An object which defines the border radius of each corner. If a corner
     *  is not specified, it is assumed to be 0.
     * @param s
     *  The rectangle's stroke width.
     *  (Default: 1)
     */
    public drawRect(
        x: number, y: number,
        w: number, h: number,
        r: BorderRadius,
        s?: number
    ): void;
    
    public drawRect(
        x: number, y: number,
        w: number, h: number,
        r: BorderRadius | number,
        s: number = 1
    ) {
        // Account for padding & stroke width
        x += this.p + (s / 2);
        y += this.p + (s / 2);
        w -= s;
        h -= s;
        // Parse radius
        if (typeof r === "number") {
            r = { tl: r, tr: r, br: r, bl: r }
        } else {
            r = { tl: 0, tr: 0, br: 0, bl: 0, ...r };
        }
        // Draw rectangular path
        let ctx = this.context;
        ctx.beginPath();
        ctx.moveTo(x + r.tl!, y);
        ctx.lineTo(x + w - r.tr!, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr!);
        ctx.lineTo(x + w, y + h - r.br!);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r.br!, y + h);
        ctx.lineTo(x + r.bl!, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl!);
        ctx.lineTo(x, y + r.tl!);
        ctx.quadraticCurveTo(x, y, x + r.tl!, y);
        ctx.closePath();
    }
  
}


///////////////////////////////////////////////////////////////////////////////
//  3. Raster Types  //////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export type BorderRadius = {
    
    /**
     * Top left radius.
     */
    tl?: number,

    /**
     * Top right radius.
     */
    tr?: number,

    /**
     * Bottom right radius.
     */
    br?: number,

    /**
     * Bottom left radius.
     */
    bl?: number

}

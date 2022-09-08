import { PageModel } from "../DiagramModelTypes";
import { RasterCache } from "../Diagram/RasterCache";
import { ViewportRegion } from "../Diagram";

export class PageImage {

    /**
     * The page.
     */
    private _page: PageModel;

    /**
     * The image's padding.
     */
    private _padding: number;

    /**
     * If the grid should be displayed or not.
     */
    private _showGrid: boolean;

    /**
     * If shadow's should be displayed or not.
     */
    private _showShadows: boolean;
     
    /**
     * If debug information should be displayed or not.
     */
    private _showDebug: boolean;


    /**
     * Creates a new {@link PageImage}.
     * @param page
     *  The page to image.
     * @param padding
     *  The image's padding.
     * @param grid
     *  If the grid should be displayed or not.
     *  (Default: true)
     * @param shadows
     *  If shadow's should be displayed or not.
     *  (Default: true)
     * @param debug
     *  If debug information should be displayed or not.
     *  (Default: false)
     */
    constructor(
        page: PageModel,
        padding: number = 30,
        grid: boolean = true,
        shadows: boolean = true,
        debug: boolean = false
    ) {
        this._page = page;
        this._padding = padding;
        this._showGrid = grid;
        this._showShadows = shadows;
        this._showDebug = debug;
    }


    /**
     * Returns an image of the page.
     * @returns
     *  The generated image.
     */
    public capture(): HTMLCanvasElement;

    /**
     * Returns an image of the specified page objects.
     * @param ids
     *  A list of object ids.
     * @returns
     *  The generated image.
     */
    public capture(ids: string[]): HTMLCanvasElement;
    public capture(ids?: string[]): HTMLCanvasElement {
        
        // Calculate region
        let xMin, yMin, xMax, yMax;
        if(ids?.length) {
            xMin = Infinity;
            yMin = Infinity;
            xMax = -Infinity;
            yMax = -Infinity;
            for(let id of ids) {
                let obj = this._page.lookup(id);
                if(!obj) {
                    throw new Error(`'${ id }' does not exist.`);
                }
                xMin = Math.min(xMin, obj.boundingBox.xMin);
                yMin = Math.min(yMin, obj.boundingBox.yMin);
                xMax = Math.max(xMax, obj.boundingBox.xMax);
                yMax = Math.max(yMax, obj.boundingBox.yMax);
            }
        } else {
            xMin = this._page.boundingBox.xMin;
            yMin = this._page.boundingBox.yMin;
            xMax = this._page.boundingBox.xMax;
            yMax = this._page.boundingBox.yMax;
        }
        
        // Create view
        let cache = new RasterCache();
        let view = this._page.createView(cache);
        view.updateView();
        
        // Configure canvas
        let can = document.createElement("canvas");
        can.width  = Math.round(xMax - xMin) + (this._padding * 2);
        can.height = Math.round(yMax - yMin) + (this._padding * 2);
        
        // Configure context
        let ctx = can.getContext("2d")!;
        ctx.setTransform(
            1, 0, 0, 1, 
            -xMin + this._padding,
            -yMin + this._padding
        );

        // Configure viewport
        let viewport = new ViewportRegion();
        viewport.xMin = xMin - this._padding;
        viewport.yMin = yMin - this._padding;
        viewport.xMax = xMax + this._padding;
        viewport.yMax = yMax + this._padding;

        // Render image
        view.renderPageSurfaceTo(ctx, viewport, this._showGrid);
        if(this._showShadows) {
            view.renderTo(ctx, viewport);
        } else {
            view.renderTo(ctx, viewport, 0, 0);
        }
        if(this._showDebug) {
            view.renderDebugTo(ctx, viewport);
        }

        // Return image
        return can;

    }

}

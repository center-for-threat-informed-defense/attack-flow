import { DiagramObjectModel, PageModel } from "./DiagramModelTypes";
import { RasterCache } from "./DiagramElement/RasterCache";
import { ViewportRegion } from "./DiagramElement";
import { Hover, Select } from "./Attributes";

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
     * @param showGrid
     *  If the grid should be displayed or not.
     *  (Default: true)
     * @param showShadows
     *  If shadow's should be displayed or not.
     *  (Default: true)
     * @param showDebug
     *  If debug information should be displayed or not.
     *  (Default: false)
     */
    constructor(
        page: PageModel,
        padding: number = 30,
        showGrid: boolean = true,
        showShadows: boolean = true,
        showDebug: boolean = false
    ) {
        this._page = page;
        this._padding = padding;
        this._showGrid = showGrid;
        this._showShadows = showShadows;
        this._showDebug = showDebug;
    }


    /**
     * Returns an image of the page.
     * @returns
     *  The generated image.
     */
    public capture(): HTMLCanvasElement;

    /**
     * Returns an image of the page focused on a region of objects.
     * @param objs
     *  The objects that define the region.
     * @returns
     *  The generated image.
     */
    public capture(objs?: DiagramObjectModel[]): HTMLCanvasElement;
    public capture(objs?: DiagramObjectModel[]): HTMLCanvasElement {
        
        // Calculate region
        let xMin, yMin, xMax, yMax;
        if(objs?.length) {
            xMin = Infinity;
            yMin = Infinity;
            xMax = -Infinity;
            yMax = -Infinity;
            for(let obj of objs) {
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

        // Cache and clear visual attributes
        let attrCache = new Map<DiagramObjectModel, number>();
        let attrObjs = this._page.getSubtree(
            o => o.isHoveredOrSelected()
        );
        for(let obj of attrObjs) {
            attrCache.set(obj, obj.attrs);
            obj.setSelect(Select.False);
            obj.setHover(Hover.Off);
        }

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

        // Restore visual attributes
        for(let [obj, attrs] of attrCache) {
            obj.attrs = attrs;
        }

        // Return image
        return can;

    }

}

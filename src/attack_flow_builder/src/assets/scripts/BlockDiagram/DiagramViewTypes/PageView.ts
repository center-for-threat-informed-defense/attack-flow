import { RasterCache } from "../DiagramElement/RasterCache";
import { ViewportRegion } from "../DiagramElement";
import { PageModel } from "../DiagramModelTypes";
import { 
    DiagramObjectView,
    DiagramRootView
} from ".";

export class PageView extends DiagramRootView {
    
    /**
     * The underlying model.
     */
    public override el: PageModel;    
    
    /**
     * The page's grid pattern.
     */
    private _gridPattern: CanvasPattern;

    /**
     * The page's current selection.
     */
    public get selects(): DiagramObjectView[] {
        return [...this.getSubtree(o => o.el.isSelected())];
    }


    /**
     * Creates a new {@link PageView}.
     * @param el
     *  The underlying model.
     * @param rasterCache
     *  The view's raster cache.
     */
    constructor(el: PageModel, rasterCache: RasterCache) {
        super(el, rasterCache);
        this.el = el;
        // Create grid pattern
        let { 
            grid_color: gc, background_color: bc
        } = this.el.style;
        this._gridPattern = this.createGridPattern(
            ...this.el.grid, bc, gc
        );
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Render  ////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Renders the page surface to a context.
     * @param grid
     *  [true]
     *   Show the grid.
     *  [false]
     *   Hide the grid.
     */
    public renderPageSurfaceTo(ctx: CanvasRenderingContext2D, vr: ViewportRegion, grid: boolean) {
        // Draw page
        ctx.fillStyle = grid ? this._gridPattern : this.el.style.background_color;
        ctx.fillRect(
            vr.xMin,  vr.yMin,
            vr.xMax - vr.xMin,
            vr.yMax - vr.yMin
        );
    }

    /**
     * Renders the object to a context.
     * @param ctx
     *  The context to render to.
     * @param vr
     *  The context's viewport.
     * @param dsx
     *  The drop shadow's x-offset.
     *  (Default: The page's styled x-offset)
     * @param dsy
     *  The drop shadow's y-offset.
     *  (Default: The page's styled y-offset)
     * @param attrs
     *  If specified, these attributes will override the object's underlying
     *  attributes.
     */
    public override renderTo(
        ctx: CanvasRenderingContext2D, vr: ViewportRegion,
        dsx: number = this.el.style.drop_shadow.offset[0], 
        dsy: number = this.el.style.drop_shadow.offset[1],
        attrs?: number
    ) { 
        // Configure drop shadow
        ctx.shadowColor = this.el.style.drop_shadow.color;
        // Draw contents
        super.renderTo(ctx, vr, dsx * vr.scale, dsy * vr.scale);
    }

    /**
     * Generates a grid canvas pattern.
     * @param gridX
     *  The grid size on the x-axis.
     * @param gridY
     *  The grid size on the y-axis.
     * @param fillColor
     *  The background color.
     * @param strokeColor
     *  The line color.
     * @returns
     *  The grid canvas pattern centered on the origin.
     */
    private createGridPattern(gridX: number, gridY: number, fillColor: string, strokeColor: string): CanvasPattern {
        let can = document.createElement("canvas");
        let ctx = can.getContext("2d", { alpha: false })!;
        can.width = gridX;
        can.height = gridY;
        ctx.fillStyle = fillColor;
        ctx.lineWidth = 2;
        ctx.strokeStyle = strokeColor;
        ctx.fillRect(0, 0, gridX, gridY);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, gridY);
        ctx.lineTo(gridX, gridY);
        ctx.stroke();
        let ptr = ctx.createPattern(can, "repeat")!;
        ptr.setTransform(new DOMMatrix().translate(0, 1));
        return ptr;
    }

}

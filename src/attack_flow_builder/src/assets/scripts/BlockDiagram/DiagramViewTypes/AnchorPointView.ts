import { RasterCache } from "../DiagramElement/RasterCache";
import { ViewportRegion } from "../DiagramElement";
import { AnchorPointModel } from "../DiagramModelTypes";
import { DiagramAnchorView } from ".";

export class AnchorPointView extends DiagramAnchorView {

    /**
     * The underlying model.
     */
    public override el: AnchorPointModel;


    /**
     * Creates a new {@link AnchorPointView}.
     * @param el
     *  The underlying model.
     * @param rasterCache
     *  The view's raster cache.
     */
    constructor(el: AnchorPointModel, rasterCache: RasterCache) {
        super(el, rasterCache);
        this.el = el;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Render  ////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Renders the object to a context.
     * @param ctx
     *  The context to render to.
     * @param vr
     *  The context's viewport.
     * @param dsx
     *  The drop shadow's x-offset.
     *  (Default: 0)
     * @param dsy
     *  The drop shadow's y-offset.
     *  (Default: 0)
     * @param attrs
     *  If specified, these attributes will override the object's underlying
     *  attributes.
     */
    public override renderTo(
        ctx: CanvasRenderingContext2D, vr: ViewportRegion,
        dsx: number = 0, dsy: number = 0, attrs?: number
    ) { 
        // Only visible when hovered
        if(!this.el.isHovered(attrs))
            return;
        ctx.fillStyle = this.el.style.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.el.radius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
    }

}

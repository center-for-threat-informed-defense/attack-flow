import { RasterCache } from "../RasterCache";
import { BoundingRegion } from "../../BoundingRegion";
import { AnchorPointModel } from "../ModelTypes/AnchorPointModel";
import { DiagramObjectView } from "./BaseTypes/DiagramObjectView";

export class AnchorPointView extends DiagramObjectView {

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


    /**
     * Renders the object to a context.
     * @param context
     *  The context to render to.
     * @param viewport
     *  The context's viewport.
     * @param state
     *  If specified, this set of state attributes will override the object's
     *  underlying state attributes.
     */
    public override renderTo(context: CanvasRenderingContext2D, viewport: BoundingRegion, state?: number): void {
        // context.fillStyle = this._color;
        // context.arc(this.x, this.y, 10, 0, 2 * Math.PI);
        // context.fill();
    }

}

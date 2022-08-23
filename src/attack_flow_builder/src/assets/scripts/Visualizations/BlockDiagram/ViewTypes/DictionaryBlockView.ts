import { RasterCache } from "../RasterCache";
import { BoundingRegion } from "../../BoundingRegion";
import { DiagramObjectView } from "./BaseTypes/DiagramObjectView";
import { DictionaryBlockModel } from "../ModelTypes/DictionaryBlockModel";

export class DictionaryBlockView extends DiagramObjectView {
    
    /**
     * The underlying model.
     */
    public override el: DictionaryBlockModel;


    /**
     * Creates a new {@link DictionaryBlockView}.
     * @param el
     *  The underlying model.
     * @param rasterCache
     *  The view's raster cache.
     */
    constructor(el: DictionaryBlockModel, rasterCache: RasterCache) {
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
        context.fillStyle = this.el.isSelected() ? "#00ff00" : this.el.color;
        context.beginPath();
        context.arc(this.x, this.y, 10, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
    }

}

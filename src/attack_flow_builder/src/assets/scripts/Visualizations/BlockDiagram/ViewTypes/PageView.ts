import { PageModel } from "../ModelTypes/PageModel";
import { RasterCache } from "../RasterCache";
import { DiagramRootView } from "./BaseTypes/DiagramRootView";

export class PageView extends DiagramRootView {
    
    /**
     * The underlying model.
     */
    public override el: PageModel;    
    

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
    }

}

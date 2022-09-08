import { RasterCache } from "../Diagram/RasterCache";
import { DictionaryLineModel } from "../DiagramModelTypes";
import { DiagramLineView } from ".";

export abstract class DictionaryLineView extends DiagramLineView {
    
    /**
     * The underlying model.
     */
    public override el: DictionaryLineModel;


    /**
     * Creates a new {@link DictionaryLineView}.
     * @param el
     *  The underlying model.
     * @param rasterCache
     *  The view's raster cache.
     */
    constructor(el: DictionaryLineModel, rasterCache: RasterCache) {
        super(el, rasterCache);
        this.el = el;
    }

}

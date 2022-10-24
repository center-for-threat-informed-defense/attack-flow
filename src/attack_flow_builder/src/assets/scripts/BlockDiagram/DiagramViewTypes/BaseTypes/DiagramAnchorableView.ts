import { RasterCache } from "../../DiagramElement/RasterCache";
import { DiagramAnchorableModel } from "../../DiagramModelTypes"
import { 
    DiagramAnchorView,
    DiagramObjectView
} from "./BaseViews";

export abstract class DiagramAnchorableView extends DiagramObjectView {

    /**
     * The underlying model.
     */
    public override el: DiagramAnchorableModel;

    /**
     * The anchorable's anchor.
     */
    public anchor: DiagramAnchorView | undefined;


    /**
     * Creates a new {@link DiagramAnchorableView}.
     * @param el
     *  The underlying model.
     * @param rasterCache
     *  The view's raster cache.
     */
    constructor(el: DiagramAnchorableModel, rasterCache: RasterCache) {
        super(el, rasterCache);
        this.el = el;
    }

}

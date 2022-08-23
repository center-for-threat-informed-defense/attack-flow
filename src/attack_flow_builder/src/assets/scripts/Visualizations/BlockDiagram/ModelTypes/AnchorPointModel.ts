import { RasterCache } from "../RasterCache";
import { DiagramFactory } from "../DiagramFactory/DiagramFactory";
import { AnchorPointView } from "../ViewTypes/AnchorPointView";
import { DiagramAnchorModel } from "./BaseTypes/DiagramAnchorModel";
import { DiagramObjectModel } from "./BaseTypes/DiagramObjectModel";
import { DiagramAnchorExport } from "../DiagramFactory/DiagramExportTypes";
import { AnchorPointTemplate } from "../DiagramFactory/DiagramSchemaTypes";

export class AnchorPointModel extends DiagramAnchorModel {
    
    /**
     * Creates a new {@link AnchorPointModel}.
     * @param factory
     *  The object's diagram factory.
     * @param template
     *  The object's template.
     * @param parent
     *  The object's parent.
     * @param values
     *  A serialized {@link AnchorPointModel}.
     */
    constructor(
        factory: DiagramFactory,
        template: AnchorPointTemplate,
        parent?: DiagramObjectModel,
        values?: DiagramAnchorExport
    ) {
        super(factory, template, 0, parent, values);
    }


    /**
     * Returns this object wrapped inside a view object.
     *  @param cache
     *   The view's raster cache.
     *  @returns
     *   This object wrapped inside a view object.
     */
    public override createView(cache: RasterCache): AnchorPointView {
        return new AnchorPointView(this, cache);
    }
    
}

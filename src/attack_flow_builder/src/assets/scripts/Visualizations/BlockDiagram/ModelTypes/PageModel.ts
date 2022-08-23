import { PageView } from "../ViewTypes/PageView";
import { PageExport } from "../DiagramFactory/DiagramExportTypes";
import { RasterCache } from "../RasterCache";
import { Coordinate3d } from "../../Coordinate";
import { DiagramFactory } from "../DiagramFactory/DiagramFactory";
import { DiagramRootModel } from "./BaseTypes/DiagramRootModel";
import { PageTemplate, TemplateType } from "../DiagramFactory/DiagramSchemaTypes";

export class PageModel extends DiagramRootModel {

    /**
     * The page's current camera position.
     */
    public camera: Coordinate3d;


    /**
     * Creates a new {@link PageModel}.
     * @param factory
     *  The object's diagram factory.
     * @param template
     *  The object's template.
     * @param values
     *  A serialized {@link PageModel}.
     */
    constructor(
        factory: DiagramFactory,
        template: PageTemplate,
        values?: PageExport
    ) {
        super(factory, template, values);
        this.camera = values?.camera ?? { x: 0, y: 0, z: 0 }
    }


    /**
     * Returns this object wrapped inside a view object.
     *  @param cache
     *   The view's raster cache.
     *  @returns
     *   This object wrapped inside a view object.
     */
    public override createView(cache: RasterCache): PageView {
        return new PageView(this, cache);
    }

    /**
     * Serializes the {@link PageModel} for export.
     * @returns
     *  The serialized {@link PageModel} object.
     */
    public override serialize(): PageExport {
        return {
            ...super.serialize(),
            camera: this.camera
        }
    }

    /**
     * Returns a dummy {@link PageModel} not associated with any document.
     * @returns
     *  A dummy {@link PageModel}.
     */
    public static createDummy() {
        return new this(
            DiagramFactory.createDummy(),
            { name: "", type: TemplateType.Page }
        );
    }

}

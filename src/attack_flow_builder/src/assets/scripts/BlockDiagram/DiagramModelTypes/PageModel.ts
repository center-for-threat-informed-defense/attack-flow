import { RasterCache } from "../Diagram/RasterCache";
import { PageView } from "../DiagramViewTypes";
import {
    DiagramRootModel,
    LayoutUpdateReason
} from "./BaseTypes/BaseModels"
import {
    DiagramFactory,
    PageValues,
    PageStyle,
    PageTemplate,
    TemplateType,
    PageExport,
    SemanticRole
} from "../DiagramFactory";

export class PageModel extends DiagramRootModel {

    /**
     * The template the object was configured with.
     */
    public override readonly template: PageTemplate;

    /**
     * The page's camera location.
     */
    public location: CameraLocation;
    
    /**
     * The page's grid size.
     */
    public readonly grid: [number, number];
    
    /**
     * The page's style.
     */
    public readonly style: PageStyle;


    /**
     * Creates a new {@link PageModel}.
     * @param factory
     *  The page's diagram factory.
     * @param template
     *  The page's template.
     * @param values
     *  The page's values.
     */
    constructor(
        factory: DiagramFactory,
        template: PageTemplate,
        values?: PageValues
    ) {
        super(factory, template, values);
        // Template configuration
        this.setSemanticRole(template.role);
        this.template = template;
        this.grid = template.grid;
        this.style = template.style;
        // Value configuration
        this.location = values?.location ?? { 
            type: LocationType.Point,
            x: 0,
            y: 0,
            k: 1
        };
        // Update layout
        this.updateLayout(LayoutUpdateReason.ObjectInit);
    }


    /**
     * Returns a dummy {@link PageModel} not associated with any document.
     * @returns
     *  A dummy {@link PageModel}.
     */
    public static createDummy(): PageModel {
        return new this(
            DiagramFactory.createDummy(),
            { 
                id: "",
                name: "",
                type: TemplateType.Page, 
                role: SemanticRole.None,
                grid: [10, 10],
                style: { 
                    grid_color: "#1d1d1d",
                    background_color: "#141414",
                    drop_shadow: {
                        color: "rgba(0,0,0,.4)",
                        offset: [3, 3]
                    }
                }
            }
        );
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Layout & View  /////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


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


    ///////////////////////////////////////////////////////////////////////////
    //  2. Content  ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Exports the {@link PageModel}.
     * @returns
     *  The {@link PageExport}.
     */
    public override toExport(): PageExport {
        return {
            ...super.toExport(),
            location: this.location
        }
    }

}


///////////////////////////////////////////////////////////////////////////////
//  Camera Types  /////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export type CameraLocation
    = CameraPointLocation
    | CameraRegionLocation

export enum LocationType {
    Point  = 0,
    Region = 1
}

export type CameraPointLocation = { 
    
    /**
     * The location's definition type.
     */
    type: LocationType.Point

    /**
     * The x-axis coordinate.
     */
    x: number,
    
    /**
     * The y-axis coordinate.
     */
    y: number,
    
    /**
     * The scale.
     */
    k: number

};

export type CameraRegionLocation = {

    /**
     * The location's definition type.
     */
    type: LocationType.Region,

    /**
     * The x-axis coordinate.
     */
    x: number,

    /**
     * The y-axis coordinate.
     */
    y: number,

    /**
     * The width of the focus region.
     */
    w: number,

    /**
     * The height of the focus region.
     */
    h: number

}

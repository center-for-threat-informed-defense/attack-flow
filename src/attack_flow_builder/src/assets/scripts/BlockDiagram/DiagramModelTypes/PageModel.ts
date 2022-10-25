import { RasterCache } from "../DiagramElement/RasterCache";
import { PageView } from "../DiagramViewTypes";
import {
    DiagramRootModel,
    LayoutUpdateReason
} from "./BaseTypes/BaseModels"
import {
    DiagramFactory,
    PageStyle,
    PageTemplate,
    TemplateType,
    SemanticRole,
    DiagramObjectValues
} from "../DiagramFactory";

export class PageModel extends DiagramRootModel {

    /**
     * The template the object was configured with.
     */
    public override readonly template: PageTemplate;
    
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
        values?: DiagramObjectValues
    ) {
        super(factory, template, values);
        // Template configuration
        this.setSemanticRole(template.role);
        this.template = template;
        this.grid = template.grid;
        this.style = template.style;
        // Update layout
        this.updateLayout(LayoutUpdateReason.Initialization);
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

}

import { RasterCache } from "../Diagram/RasterCache";
import { DictionaryLineView } from "../DiagramViewTypes";
import { DiagramLineModel } from ".";
import {
    DiagramFactory,
    DictionaryLineValues,
    DictionaryLineTemplate,
    DictionaryLineExport
} from "../DiagramFactory";

export abstract class DictionaryLineModel extends DiagramLineModel {

     /**
      * The line's fields.
      */
    public readonly fields: Map<string, any>;


    /**
     * Creates a new {@link DictionaryLineModel}.
     * @param factory
     *  The line's diagram factory.
     * @param template
     *  The line's template.
     * @param values
     *  The line's values.
     */
    constructor(
        factory: DiagramFactory, 
        template: DictionaryLineTemplate, 
        values?: DictionaryLineValues
    ) {
        super(factory, template, values);
        // Template configuration
        this.fields = new Map();
        for(let id in template.fields) {
            this.fields.set(id, template.fields[id].value);
        }
        // Value configuration
        if(values?.fields) {
            for(let id in template.fields) {
                if(id in values.fields) {
                    this.fields.set(id, values.fields[id])
                }
            }
        }
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
    public abstract override createView(cache: RasterCache): DictionaryLineView;


    ///////////////////////////////////////////////////////////////////////////
    //  2. Content  ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Exports the {@link DictionaryLineModel}.
     * @returns
     *  The {@link DictionaryLineExport}.
     */
    public override toExport(): DictionaryLineExport {
        return {
            ...super.toExport(),
            fields: Object.fromEntries(this.fields.entries())
        }
    }

    /**
     * Exports the {@link DictionaryLineModel}'s semantic data.
     * @returns
     *  The {@link DictionaryLineModel}'s semantic data.
     */
     public override toSemanticExport(): { [key: string]: any } {
        return Object.fromEntries(this.fields.entries());
    }

}

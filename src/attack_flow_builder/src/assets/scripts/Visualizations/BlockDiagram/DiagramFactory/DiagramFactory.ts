import { PageModel } from "../ModelTypes/PageModel";
import { AnchorPointModel } from "../ModelTypes/AnchorPointModel";
import { BuiltinTemplates } from "./BuiltinTemplates";
import { DiagramFactoryError } from "./DiagramFactoryError";
import { DictionaryBlockModel } from "../ModelTypes/DictionaryBlockModel";
import { DiagramObjectModel } from "../ModelTypes/BaseTypes/DiagramObjectModel";
import { BlockDiagramSchema, Template, TemplateType } from "./DiagramSchemaTypes";
import { DiagramObjectExport } from "./DiagramExportTypes";

export class DiagramFactory {

    /**
     * The diagram factory's internal schema.
     */
    private _schema: BlockDiagramSchema;

    /**
     * The diagram factory's list of templates.
     */
    private _templates: Map<string, Template>


    /**
     * Creates a new {@link DiagramFactory}.
     * @param schema
     *  The diagram factory's internal schema.
     * @throws { DiagramFactoryError }
     *  If two or more templates share the same name.
     */
    constructor(schema: BlockDiagramSchema) {
        this._schema = schema;
        this._templates = new Map();
        // Register schema templates
        for(let template of [...BuiltinTemplates, ...this._schema.templates]) {
            if(this._templates.has(template.name)) {
                throw new DiagramFactoryError(
                    `Template '${ template.name }' can only be defined once.`
                );
            }
            this._templates.set(template.name, template);
        }
    }


    /**
     * Returns all block and line templates.
     * @returns 
     *  All block and line templates.
     */
    public getBlocksAndLineTemplates(): Template[] {
        // TODO: Need to filter only block and line types
        return [...this._templates.values()]
    }

    /**
     * Returns a template from the factory.
     * @param template
     *  The name of the template.
     * @returns
     *  The template. `undefined` if the template couldn't be found.
     */
    public getTemplate(template: string): Template | undefined {
        return this._templates.get(template);
    }

    /**
     * Returns the diagram factory's internal schema.
     * @returns
     *  diagram factory's internal schema.
     */
    public getSchema(): BlockDiagramSchema {
        return this._schema;
    }

    /**
     * Instantiates a diagram object.
     * @param template
     *  The name of the object's template.
     * @param parent
     *  The object's parent.
     * @returns
     *  The newly created diagram object.
     * @throws { DiagramFactoryError }
     *  If no template with the specified name exists.
     */
    public createObject(template: string, parent?: DiagramObjectModel): DiagramObjectModel;
    
    /**
     * Instantiates a diagram object.
     * @param object
     *  A serialized diagram object.
     * @param parent
     *  The object's parent.
     * @returns
     *  The newly created diagram object.
     * @throws { DiagramFactoryError }
     *  If the object specifies a template that doesn't exist.
     */
    public createObject(object: DiagramObjectExport, parent?: DiagramObjectModel): DiagramObjectModel;
    public createObject(param1: DiagramObjectExport | string, parent?: DiagramObjectModel): DiagramObjectModel {
        let name, vals: any;
        if(param1 instanceof Object) {
            name = param1.template,
            vals = param1
        } else {
            name = param1;
        }
        // Resolve template
        let temp = this._templates.get(name);
        if(!temp) {
            throw new DiagramFactoryError(
                `Template '${ name }' does not exist.`
            );
        }
        // Create diagram object
        switch(temp.type) {
            case TemplateType.Page:
                return new PageModel(this, temp, vals);
            case TemplateType.AnchorPoint:
                return new AnchorPointModel(this, temp, parent, vals);
            case TemplateType.DictionaryBlock:
                return new DictionaryBlockModel(this, temp, parent, vals);
            default:
                throw new Error("Don't know that type.")
        }
    }
 
    /**
     * Returns a dummy {@link DiagramFactory}.
     * @returns 
     *  A dummy {@link DiagramFactory}.
     */
    public static createDummy(): DiagramFactory {
        return new this({ page_template: "", templates: [] });
    }

}

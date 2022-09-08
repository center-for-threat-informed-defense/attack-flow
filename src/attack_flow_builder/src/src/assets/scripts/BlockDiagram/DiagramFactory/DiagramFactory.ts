import { 
    Font,
    FontDescriptor,
    GlobalFontStore
} from "../Utilities";
import { 
    AnchorPointModel,
    DiagramAnchorModel,
    DiagramObjectModel,
    DictionaryBlockModel,
    LineEndingPointModel,
    LineHandlePointModel,
    LineHorizontalElbowModel,
    LineVerticalElbowModel,
    PageModel
} from "../DiagramModelTypes";
import { 
    BlockDiagramSchema,
    BuiltinTemplates,
    DiagramFactoryError,
    DiagramObjectValues,
    SerializedTemplate,
    Template,
    TemplateType,
} from ".";

export class DiagramFactory {

    /**
     * The diagram's schema.
     */
    public readonly schema: BlockDiagramSchema;

    /**
     * The diagram factory's list of templates.
     */
    public readonly templates: Map<string, Template>


    /**
     * Creates a new {@link DiagramFactory}.
     * @param pageTemplate
     *  The schema's page template.
     * @param templates
     *  THe diagram factory's list of templates.
     */
    private constructor(schema: BlockDiagramSchema, templates: Map<string, Template>) {
        this.schema = schema;
        this.templates = templates;
    }


    /**
     * Returns a dummy {@link DiagramFactory}.
     * @returns 
     *  A dummy {@link DiagramFactory}.
     */
    public static createDummy(): DiagramFactory {
        return new this({ page_template: "", templates: [] }, new Map());
    }

    /**
     * Creates a new {@link DiagramFactory}.
     * @param schema
     *  The diagram factory's internal schema.
     * @throws { DiagramFactoryError }
     *  If two or more templates share the same name.
     * @throws { Error }
     *  If any of the schema's fonts failed to load.
     */
    public static async create(schema: BlockDiagramSchema) {
        
        // Clone schema
        let copy = structuredClone(schema);

        // Validate unique ids
        let ids = new Set();
        for(let template of copy.templates) {
            if(ids.has(template.id)){
                throw new DiagramFactoryError(
                    `Template '${ template.id }' can only be defined once.`
                );
            }
            ids.add(template.id);
        }

        // Register schema templates
        let templates = new Map<string, SerializedTemplate>();
        for(let template of [...BuiltinTemplates, ...copy.templates]) {
            templates.set(template.id, template);
        }

        // Load font descriptors
        let fonts: FontDescriptor[] = [];
        for(let template of templates.values()) {
            fonts = fonts.concat(
                this.getFontDescriptorsFromTemplate(template)
            );
        }
        await GlobalFontStore.loadFonts(fonts);
        
        // Swap font descriptors for fonts
        for(let template of templates.values()) {
            this.swapFontDescriptorsWithFonts(template);
        }
        
        // Return new diagram factory 
        return new this(
            schema,
            templates as Map<string, Template>
        );
    
    }

    
    ///////////////////////////////////////////////////////////////////////////
    //  1. Templates  /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    

    /**
     * Returns a template from the factory.
     * @param template
     *  The template's id.
     * @returns
     *  The template. `undefined` if no template with that id exists.
     */
    public getTemplate(template: string): Template | undefined {
        return this.templates.get(template);
    }

    /**
     * Returns all block templates.
     * @returns 
     *  All block templates.
     */
    public getBlockTemplates(): Template[] {
        let templates = [];
        for(let template of this.templates.values()) {
            switch(template.type) {
                case TemplateType.DictionaryBlock:
                    templates.push(template);
                    break;
                
            }
        }
        return templates;
    }

    /**
     * Returns all line templates.
     * @returns 
     *  All line templates.
     */
    public getLineTemplates(): Template[] {
        let templates = [];
        for(let template of this.templates.values()) {
            switch(template.type) {
                case TemplateType.LineVerticalElbow:
                case TemplateType.LineHorizontalElbow:
                    templates.push(template);
                    break;
            }
        }
        return templates;
    }

    
    ///////////////////////////////////////////////////////////////////////////
    //  2. Object Creation  ///////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Instantiates a diagram object.
     * @param template
     *  The name of the object's template.
     * @returns
     *  The newly created diagram object.
     * @throws { DiagramFactoryError }
     *  If no template with the specified name exists.
     */
    public createObject(template: string): DiagramObjectModel;
    
    /**
     * Instantiates a diagram object.
     * @param object
     *  The object's values.
     * @returns
     *  The newly created diagram object.
     * @throws { DiagramFactoryError }
     *  If `object` specifies a template that doesn't exist.
     */
    public createObject(object: DiagramObjectValues): DiagramObjectModel;
    public createObject(param1: DiagramObjectValues | string): DiagramObjectModel {
        let name, vals: any;
        if(param1 instanceof Object) {
            name = param1.template,
            vals = param1
        } else {
            name = param1;
        }
        // Resolve template
        let temp = this.templates.get(name);
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
                return new AnchorPointModel(this, temp, vals);
            case TemplateType.DictionaryBlock:
                return new DictionaryBlockModel(this, temp, vals);
            case TemplateType.LineEndingPoint:
                return new LineEndingPointModel(this, temp, vals);
            case TemplateType.LineHandlePoint:
                return new LineHandlePointModel(this, temp, vals);
            case TemplateType.LineVerticalElbow:
                return new LineVerticalElbowModel(this, temp, vals);
            case TemplateType.LineHorizontalElbow:
                return new LineHorizontalElbowModel(this, temp, vals);
            default:
                throw new DiagramFactoryError(
                    `Unknown template type: '${ temp.type }'.`
                );
        }
    }

    /**
     * Clones one or more diagram objects.
     * @param objects
     *  The object(s) to clone.
     * @returns
     *  The cloned objects.
     */
    public cloneObjects(...objects: DiagramObjectModel[]): DiagramObjectModel[] {
        // Clone objects
        let clones = new Map<string, DiagramObjectModel>();
        let anchors = new Map<DiagramAnchorModel, string[]>();
        let objs = objects.map(o => this.cloneObject(o, clones, anchors));
        // Link clones
        for(let [anchor, links] of anchors) {
            for(let link of links) {
                let obj = clones.get(link);
                if(obj) {
                    anchor.addChild(obj);
                }
            }
        }
        // Return clones
        return objs;
    }

    /**
     * Clones a single object. Supports `cloneObjects()`.
     * @param object
     *  The object to clone.
     * @param clones
     *  The clone index. This maps objects to their clones.
     * @param anchors
     *  The anchor index. The maps anchor clones to their original children.
     * @returns
     *  The cloned object.
     */
    private cloneObject(
        object: DiagramObjectModel,
        clones: Map<string, DiagramObjectModel>,
        anchors: Map<DiagramAnchorModel, string[]>
    ): DiagramObjectModel {
        // Clone anchor
        if(object instanceof DiagramAnchorModel) {
            let clone = this.createObject({
                ...object.toExport(),
                id: (crypto as any).randomUUID(),
                children: []
            }) as DiagramAnchorModel;
            clones.set(object.id, clone);
            anchors.set(clone, object.children.map(o => o.id));
            return clone;
        };
        // Clone children
        let children = [];
        for(let obj of object.children) {
            children.push(this.cloneObject(obj, clones, anchors));
        }
        // Clone object
        let clone = this.createObject({
            ...object.toExport(),
            id: (crypto as any).randomUUID(),
            children
        });
        clones.set(object.id, clone);
        return clone;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  3. Font Management  ///////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns all {@link FontDescriptor} defined by a template.
     * @returns
     *  All {@link FontDescriptor} defined by a template.
     */
    private static getFontDescriptorsFromTemplate(template: SerializedTemplate): FontDescriptor[] {
        switch(template.type) {
            case TemplateType.DictionaryBlock:
                let { style } = template;
                return [
                    style.head.title.font,
                    style.head.subtitle.font,
                    style.body.field_name.font,
                    style.body.field_value.font
                ]
            default:
                return [];
        }
    }

    /**
     * Swaps all {@link FontDescriptor} defined by a template with 
     * {@link Font} objects.
     * @param template
     *  The template to modify.
     */
    private static swapFontDescriptorsWithFonts(template: SerializedTemplate) {
        let font = GlobalFontStore.getFont.bind(GlobalFontStore);
        switch(template.type) {
            case TemplateType.DictionaryBlock:
                let { head: h, body: b } = template.style as any;
                h.title.font = font(h.title.font);
                h.subtitle.font = font(h.subtitle.font);
                b.field_name.font = font(b.field_name.font);
                b.field_value.font = font(b.field_value.font);
                break;
            default:
                break;
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  4. Serialization  /////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns the diagram factory's internal schema.
     * @returns
     *  The diagram factory's internal schema.
     */
    public getSchema(): BlockDiagramSchema {
        // Compile templates
        let templates: SerializedTemplate[] = []
        for(let template of this.templates.values()) {
            let cloneTemplate = JSON.stringify(template, 
                (_: string, obj: any) => obj instanceof Font ? obj.descriptor : obj
            );
            templates.push(JSON.parse(cloneTemplate));
        }
        // Return schema
        return {
            page_template: this.schema.page_template,
            templates: templates
        }
    }

}

import { Crypto } from "../Utilities/Crypto";
import {
    Font,
    GlobalFontStore,
    type FontDescriptor,
    type IFont
} from "../Utilities";
import {
    AnchorPointModel,
    BranchBlockModel,
    DiagramAnchorableModel,
    DiagramAnchorModel,
    DiagramObjectModel,
    DictionaryBlockModel,
    LineEndingPointModel,
    LineHandlePointModel,
    LineHorizontalElbowModel,
    LineVerticalElbowModel,
    TextBlockModel,
    PageModel
} from "../DiagramModelTypes";
import {
    BuiltinTemplates,
    DiagramFactoryError,
    TemplateType
} from ".";
import type {
    BlockDiagramSchema,
    DiagramObjectValues,
    SerializedTemplate,
    SubstituteType,
    Template
} from ".";
import { LineRightAngleHorizontalModel } from "../DiagramModelTypes/LineRightAngleHorizontalModel";
import { LineRightAngleVerticalModel } from "../DiagramModelTypes/LineRightAngleVerticalModel";
import { LineStraightModel } from "../DiagramModelTypes/LineStraightModel";

export class DiagramFactory {

    /**
     * The diagram's schema.
     */
    public readonly schema: BlockDiagramSchema;

    /**
     * The diagram factory's list of templates.
     */
    public readonly templates: Map<string, Template>;

    /**
     * The diagram factory's namespace.
     */
    private readonly _namespace: Namespace;


    /**
     * Creates a new {@link DiagramFactory}.
     * @param schema
     *  The diagram's schema.
     * @param templates
     *  The diagram factory's list of templates.
     * @param namespace
     *  The diagram factory's namespace.
     */
    private constructor(schema: BlockDiagramSchema, templates: Map<string, Template>, namespace: Namespace) {
        this.schema = schema;
        this.templates = templates;
        this._namespace = namespace;
    }


    /**
     * Returns a dummy {@link DiagramFactory}.
     * @returns
     *  A dummy {@link DiagramFactory}.
     */
    public static createDummy(): DiagramFactory {
        return new this(
            { page_template: "", templates: [] },
            new Map(),
            new Map([["@", new Map()]])
        );
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
        const copy = structuredClone(schema);

        // Validate unique ids
        const ids = new Set();
        for (const template of copy.templates) {
            if (ids.has(template.id)) {
                throw new DiagramFactoryError(
                    `Template '${template.id}' can only be defined once.`
                );
            }
            ids.add(template.id);
        }

        // Register schema templates
        const templates = new Map<string, SerializedTemplate>();
        for (const template of [...BuiltinTemplates, ...copy.templates]) {
            templates.set(template.id, template);
        }

        // Build namespace
        const namespace: Namespace = new Map([["@", new Map()]]);
        for (const value of templates.values()) {
            if (value.namespace === undefined) {
                continue;
            }
            const path = ["@", ...value.namespace.split(".")];
            let i = 0;
            let ns = namespace;
            for (; i < path.length - 1; i++) {
                if (!ns.has(path[i])) {
                    ns.set(path[i], new Map());
                }
                ns = ns.get(path[i])! as Namespace;
            }
            if (!ns.has(path[i])) {
                ns.set(path[i], value.id);
            } else {
                throw new DiagramFactoryError(
                    `Namespace '${path.join(".")}' is already defined.`
                );
            }
        }

        // Load font descriptors
        let fonts: FontDescriptor[] = [];
        for (const template of templates.values()) {
            fonts = fonts.concat(
                this.getFontDescriptorsFromTemplate(template)
            );
        }
        await GlobalFontStore.loadFonts(fonts, 4000);

        // Swap font descriptors for fonts
        for (const template of templates.values()) {
            this.swapFontDescriptorsWithFonts(template);
        }

        // Return new diagram factory
        return new this(
            schema,
            templates as Map<string, Template>,
            namespace
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
     * Returns the factory's namespace.
     * @return
     *  The factory's namespace.
     */
    public getNamespace(): Namespace {
        return this._namespace;
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
        let name: string, vals: DiagramObjectValues | undefined = undefined;
        if (param1 instanceof Object) {
            name = param1.template;
            vals = param1;
        } else {
            name = param1;
        }
        // Resolve template
        const temp = this.templates.get(name);
        if (!temp) {
            throw new DiagramFactoryError(
                `Template '${name}' does not exist.`
            );
        }
        // Create diagram object
        switch (temp.type) {
            case TemplateType.Page:
                return new PageModel(this, temp, vals);
            case TemplateType.AnchorPoint:
                return new AnchorPointModel(this, temp, vals);
            case TemplateType.BranchBlock:
                return new BranchBlockModel(this, temp, vals);
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
            case TemplateType.LineRightAngleHorizontal:
                return new LineRightAngleHorizontalModel(this, temp, vals);
            case TemplateType.LineRightAngleVertical:
                return new LineRightAngleVerticalModel(this, temp, vals);
            case TemplateType.LineStraight:
                return new LineStraightModel(this, temp, vals);
            case TemplateType.TextBlock:
                return new TextBlockModel(this, temp, vals);
            default:
                throw new DiagramFactoryError(
                    `Unknown template type: '${temp}'.`
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
        const clones = new Map<string, DiagramObjectModel>();
        const anchors = new Map<DiagramAnchorModel, string[]>();
        const objs = objects.map(o => this.cloneObject(o, clones, anchors));
        // Link clones
        for (const [anchor, links] of anchors) {
            for (const link of links) {
                const obj = clones.get(link) as DiagramAnchorableModel;
                if (obj) {
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
        if (object instanceof DiagramAnchorModel) {
            const clone = this.createObject({
                ...object.toExport(),
                id: Crypto.randomUUID(),
                children: []
            }) as DiagramAnchorModel;
            clones.set(object.id, clone);
            anchors.set(clone, object.children.map(o => o.id));
            return clone;
        }
        // Clone children
        const children = [];
        for (const obj of object.children) {
            children.push(this.cloneObject(obj, clones, anchors));
        }
        // Clone object
        const clone = this.createObject({
            ...object.toExport(),
            id: Crypto.randomUUID(),
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
        let descriptors: FontDescriptor[] = [];
        switch (template.type) {
            case TemplateType.BranchBlock:
                const { style: s1 } = template;
                descriptors.push(
                    s1.branch.font
                );
            case TemplateType.DictionaryBlock:
                const { style: s2 } = template;
                descriptors = descriptors.concat([
                    s2.head.one_title.title.font,
                    s2.head.two_title.title.font,
                    s2.head.two_title.subtitle.font,
                    s2.body.field_name.font,
                    s2.body.field_value.font
                ]);
                break;
            case TemplateType.TextBlock:
                const { style: s3 } = template;
                descriptors.push(
                    s3.text.font
                );
                break;
            default:
                break;
        }
        return descriptors;
    }

    /**
     * Swaps all {@link FontDescriptor} defined by a template with
     * {@link IFont} objects.
     * @param template
     *  The template to modify.
     */
    private static swapFontDescriptorsWithFonts(template: SerializedTemplate) {
        const font = GlobalFontStore.getFont.bind(GlobalFontStore);
        switch (template.type) {
            case TemplateType.BranchBlock:
                const { branch: br } = template.style;
                (br.font as unknown as IFont) = font(br.font);
            case TemplateType.DictionaryBlock:
                const { head: h, body: b } = template.style;
                const _h = h as unknown as SubstituteType<typeof h, FontDescriptor, IFont>;
                const _b = b as unknown as SubstituteType<typeof b, FontDescriptor, IFont>;
                _h.one_title.title.font = font(h.one_title.title.font);
                _h.two_title.title.font = font(h.two_title.title.font);
                _h.two_title.subtitle.font = font(h.two_title.subtitle.font);
                _b.field_name.font = font(b.field_name.font);
                _b.field_value.font = font(b.field_value.font);
                break;
            case TemplateType.TextBlock:
                const { text: t } = template.style;
                (t.font as unknown as IFont) = font(t.font);
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
        const templates: SerializedTemplate[] = [];
        for (const template of this.templates.values()) {
            const cloneTemplate = JSON.stringify(template,
                (_: string, obj: unknown) => obj instanceof Font ? obj.descriptor : obj
            );
            templates.push(JSON.parse(cloneTemplate));
        }
        // Return schema
        return {
            page_template: this.schema.page_template,
            templates: templates
        };
    }

}

export type Namespace = Map<string, Namespace | string>;

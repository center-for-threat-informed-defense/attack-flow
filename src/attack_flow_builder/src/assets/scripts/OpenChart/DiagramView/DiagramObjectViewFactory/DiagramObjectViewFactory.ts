import { FaceType } from "./FaceType";
import {
    DiagramObjectFactory, DiagramObjectType,
    SemanticRole, SemanticRoleMask, traversePostfix
} from "@OpenChart/DiagramModel";
import {
    AnchorPoint, AnchorView, BlockView, BranchBlock,
    CanvasView, DictionaryBlock, DotGridCanvas, GroupFace, GroupView,
    HandlePoint, HandleView, HorizontalElbowLine, LatchPoint,
    LatchView, LineGridCanvas, LineView, TextBlock,
    VerticalElbowLine
} from "../DiagramObjectView";
import type { FaceDesign } from "./FaceDesign";
import type { TypeToTemplate } from "./TypeToTemplate";
import type { DiagramObjectView } from "../DiagramObjectView";
import type {
    Constructor, DiagramObjectTemplate,
    DiagramSchemaConfiguration, JsonEntries
} from "@OpenChart/DiagramModel";
import type { DiagramTheme } from "./DiagramTheme";

export class DiagramObjectViewFactory extends DiagramObjectFactory {

    /**
     * The factory's theme.
     */
    public theme: DiagramTheme;


    /**
     * Creates a new {@link DiagramViewFactory}.
     * @param schema
     *  The factory's schema.
     * @param theme
     *  The factory's theme.
     */
    constructor(schema: DiagramSchemaConfiguration, theme: DiagramTheme) {
        super(schema);
        this.theme = theme;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Object Creation  ///////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Creates a new {@link DiagramObjectView}.
     * @param name
     *  The template's name.
     * @param type
     *  The expected {@link DiagramObjectView} sub-type.
     *  (Default: `DiagramObjectView`)
     * @returns
     *  The {@link DiagramObjectView}.
     */
    public override createNewDiagramObject<T extends DiagramObjectView>(
        name: string,
        type?: Constructor<T>
    ): T;

    /**
     * Creates a new {@link DiagramObjectView}.
     * @param template
     *  The template.
     * @param type
     *  The expected {@link DiagramObjectView} sub-type.
     *  (Default: `DiagramObjectView`)
     * @returns
     *  The {@link DiagramObjectView}.
     */
    public override createNewDiagramObject<T extends DiagramObjectView>(
        template: DiagramObjectTemplate | string,
        type?: Constructor<T>
    ): T {
        return super.createNewDiagramObject(template, type);
    }

    /**
     * Configures a new {@link DiagramObjectView}.
     * @remarks
     *  This function only constructs the object directly defined by the
     *  template. This function does not generate or attach implied children.
     *  For example, generating a text block results in an anchor-less
     *  {@link BlockView}.
     * @param template
     *  The template.
     * @param type
     *  The expected {@link DiagramObjectView} sub-type.
     *  (Default: `DiagramObjectView`)
     */
    public createBaseDiagramObject<T extends DiagramObjectView>(
        template: DiagramObjectTemplate,
        type?: Constructor<T>
    ): T;

    /**
     * Configures a new {@link DiagramObjectView}.
     * @remarks
     *  This function only constructs the object directly defined by the
     *  template. This function does not generate or attach implied children.
     *  For example, generating a text block results in an anchor-less
     *  {@link BlockView}.
     * @param name
     *  The template's name.
     * @param instance
     *  The object's instance id.
     *  (Default: Randomly Generated UUID).
     * @param values
     *  The object's property values.
     * @param type
     *  The expected {@link DiagramObjectView} sub-type.
     *  (Default: `DiagramObjectView`)
     */
    public createBaseDiagramObject<T extends DiagramObjectView>(
        name: string,
        instance?: string,
        values?: JsonEntries,
        type?: Constructor<T>
    ): T;

    /**
     * Configures a new {@link DiagramObjectView}.
     * @remarks
     *  This function only constructs the object directly defined by the
     *  template. This function does not generate or attach implied children.
     *  For example, generating a text block results in an anchor-less
     *  {@link BlockView}.
     * @param template
     *  The template.
     * @param instance
     *  The object's instance id.
     *  (Default: Randomly Generated UUID).
     * @param values
     *  The object's property values.
     * @param type
     *  The expected {@link DiagramObjectView} sub-type.
     *  (Default: `DiagramObjectView`)
     */
    public createBaseDiagramObject<T extends DiagramObjectView>(
        template: DiagramObjectTemplate | string,
        instance?: string,
        values?: JsonEntries,
        type?: Constructor<T>
    ): T;

    /**
     * Configures a new {@link DiagramObjectView}.
     * @remarks
     *  This base definition is intended for child classes.
     */
    public createBaseDiagramObject<T extends DiagramObjectView>(
        name: DiagramObjectTemplate | string,
        param1?: Constructor<T> | string,
        param2?: JsonEntries,
        param3?: Constructor<T>
    ): T;

    public createBaseDiagramObject<T extends DiagramObjectView>(
        name: DiagramObjectTemplate | string,
        param1?: Constructor<T> | string,
        param2?: JsonEntries,
        param3?: Constructor<T>
    ): T {
        return super.createBaseDiagramObject(name, param1, param2, param3);
    }

    /**
     * Creates a new {@link DiagramObjectView} from a template.
     * @param template
     *  The {@link DiagramObjectTemplate}.
     * @returns
     *  The {@link DiagramObjectView}.
     */
    protected override createNewDiagramObjectFromTemplate(
        template: DiagramObjectTemplate
    ): DiagramObjectView {
        // Resolve design
        const design = this.resolveDesign(template.name);
        // Create object
        let object;
        switch (design.type) {

            case FaceType.DictionaryBlock:
            case FaceType.BranchBlock:
            case FaceType.TextBlock:
                // Assert template
                this.assertTemplateMatchesFace(template, design.type);
                // Create object
                object = this.createBaseDiagramObject(template, BlockView);
                // Attach anchors
                const { anchors } = template;
                for (const position in anchors) {
                    const anchor = this.createNewDiagramObject(anchors[position], AnchorView);
                    object.addAnchor(position, anchor);
                }
                return object;

            case FaceType.HorizontalElbowLine:
            case FaceType.VerticalElbowLine:
                // Assert template
                this.assertTemplateMatchesFace(template, design.type);
                // Create object
                object = this.createBaseDiagramObject(template, LineView);
                // Create latches
                const latch = template.latch_template;
                object.source = this.createNewDiagramObject(latch.source, LatchView);
                object.target = this.createNewDiagramObject(latch.target, LatchView);
                // Create handles, if necessary
                if (object.face instanceof HorizontalElbowLine) {
                    // Attach handle
                    const handle = template.handle_template;
                    object.addHandle(this.createNewDiagramObject(handle, HandleView));
                }
                break;

            default:
                this.assertTemplateMatchesFace(template, design.type);
                object = this.createBaseDiagramObject(template);

        }
        return object;
    }

    /**
     * Configures a new {@link DiagramObjectView} from a template.
     * @param template
     *  The {@link DiagramObjectTemplate}.
     * @param instance
     *  The object's instance id.
     * @param values
     *  The object's property values.
     * @returns
     *  The {@link DiagramObjectView}.
     */
    protected override createBaseDiagramObjectFromTemplate(
        template: DiagramObjectTemplate,
        instance: string,
        values?: JsonEntries
    ): DiagramObjectView {
        const grid = this.theme.grid;
        const scale = this.theme.scale;
        // Create properties
        const props = this.createRootProperty(template.properties ?? {}, values);
        // Resolve design
        const design = this.resolveDesign(template.name);
        // Define attributes
        let attrs = 0;
        attrs |= template.role ?? SemanticRole.None;
        attrs |= ~SemanticRoleMask & (design.attributes ?? 0);
        // Create object
        let face;
        switch (design.type) {
            case FaceType.AnchorPoint:
                face = new AnchorPoint(design.style);
                return new AnchorView(template.name, instance, attrs, props, face);
            case FaceType.BranchBlock:
                face = new BranchBlock(design.style);
                return new BlockView(template.name, instance, attrs, props, face);
            case FaceType.DictionaryBlock:
                face = new DictionaryBlock(design.style, grid, scale);
                return new BlockView(template.name, instance, attrs, props, face);
            case FaceType.TextBlock:
                face = new TextBlock(design.style);
                return new BlockView(template.name, instance, attrs, props, face);
            case FaceType.HandlePoint:
                face = new HandlePoint(design.style);
                return new HandleView(template.name, instance, attrs, props, face);
            case FaceType.LatchPoint:
                face = new LatchPoint(design.style);
                return new LatchView(template.name, instance, attrs, props, face);
            case FaceType.HorizontalElbowLine:
                face = new HorizontalElbowLine(design.style, grid);
                return new LineView(template.name, instance, attrs, props, face);
            case FaceType.VerticalElbowLine:
                face = new VerticalElbowLine(design.style, grid);
                return new LineView(template.name, instance, attrs, props, face);
            case FaceType.Group:
                face = new GroupFace();
                return new GroupView(template.name, instance, attrs, props, face);
            case FaceType.LineGridCanvas:
                face = new LineGridCanvas(design.style, grid, scale);
                return new CanvasView(template.name, instance, attrs, props, grid, face);
            case FaceType.DotGridCanvas:
                face = new DotGridCanvas(design.style, grid, scale);
                return new CanvasView(template.name, instance, attrs, props, grid, face);
        }
    }

    /**
     * Resolves a template's design.
     * @param template
     *  The template's name.
     * @returns
     *  The template's design.
     */
    private resolveDesign(template: string): FaceDesign {
        if (template in this.theme.designs) {
            return this.theme.designs[template];
        } else {
            throw new Error(`Template '${template}' has no design.`);
        }
    }

    /**
     * Asserts that a design's face matches its template.
     * @param template
     *  The face's {@link DiagramObjectTemplate}.
     * @param face
     *  The face's type.
     */
    private assertTemplateMatchesFace<T extends keyof TypeToTemplate>(
        template: DiagramObjectTemplate,
        face: T
    ): asserts template is TypeToTemplate[T]  {
        const type = template.type;
        switch (face) {
            case FaceType.AnchorPoint:
                if (type === DiagramObjectType.Anchor) {
                    return;
                }
            case FaceType.BranchBlock:
            case FaceType.DictionaryBlock:
            case FaceType.TextBlock:
                if (type === DiagramObjectType.Block) {
                    return;
                }
            case FaceType.HandlePoint:
                if (type === DiagramObjectType.Handle) {
                    return;
                }
            case FaceType.HorizontalElbowLine:
            case FaceType.VerticalElbowLine:
                if (type === DiagramObjectType.Line) {
                    return;
                }
            case FaceType.LatchPoint:
                if (type === DiagramObjectType.Latch) {
                    return;
                }
            case FaceType.Group:
                if (type === DiagramObjectType.Group) {
                    return;
                }
            case FaceType.LineGridCanvas:
            case FaceType.DotGridCanvas:
                if (type === DiagramObjectType.Canvas) {
                    return;
                }
        }
        throw new Error(`'${face}' face incompatible with '${type}' object type.`);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Object Restyling  //////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Restyles a set of {@link DiagramObjectView} according to the schema.
     * @param diagram
     *  The diagram objects.
     */
    public restyleDiagramObject(
        objects: DiagramObjectView[]
    ): void {
        const grid = this.theme.grid;
        const scale = this.theme.scale;
        // Restyle objects
        for (const object of traversePostfix(objects)) {
            // Resolve design
            const design = this.resolveDesign(object.id);
            // Cache relative position
            const x = object.x;
            const y = object.y;
            // Set face
            let face;
            switch (design.type) {
                case FaceType.AnchorPoint:
                    face = new AnchorPoint(design.style);
                    object.replaceFace(face);
                    break;
                case FaceType.BranchBlock:
                    face = new BranchBlock(design.style);
                    object.replaceFace(face);
                    break;
                case FaceType.DictionaryBlock:
                    face = new DictionaryBlock(design.style, grid, scale);
                    object.replaceFace(face);
                    break;
                case FaceType.TextBlock:
                    face = new TextBlock(design.style);
                    object.replaceFace(face);
                    break;
                case FaceType.HandlePoint:
                    face = new HandlePoint(design.style);
                    object.replaceFace(face);
                    break;
                case FaceType.LatchPoint:
                    face = new LatchPoint(design.style);
                    object.replaceFace(face);
                    break;
                case FaceType.HorizontalElbowLine:
                    face = new HorizontalElbowLine(design.style, grid);
                    object.replaceFace(face);
                    break;
                case FaceType.VerticalElbowLine:
                    face = new VerticalElbowLine(design.style, grid);
                    object.replaceFace(face);
                    break;
                case FaceType.Group:
                    face = new GroupFace();
                    object.replaceFace(face);
                    break;
                case FaceType.LineGridCanvas:
                    face = new LineGridCanvas(design.style, grid, scale);
                    object.replaceFace(face);
                    break;
                case FaceType.DotGridCanvas:
                    face = new DotGridCanvas(design.style, grid, scale);
                    object.replaceFace(face);
                    break;
            }
            // Apply position
            object.face.moveTo(x, y);
        }
    }

}

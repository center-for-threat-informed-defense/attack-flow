import { Crypto } from "../../Utilities";
import { SemanticRole } from "../SemanticAnalysis";
import { PropertyType } from "./PropertyDescriptor";
import { DiagramObjectType } from "./DiagramObjectType";
import {
    Anchor, Block, Canvas, DateProperty, DictionaryProperty,
    EnumProperty, FloatProperty, Group, Handle, IntProperty,
    Latch, Line, ListProperty, Property, RootProperty,
    StringProperty
} from "../DiagramObject";
import type {
    DiagramObject, JsonEntries, JsonType
} from "../DiagramObject";
import type {
    AtomicPropertyDescriptors, CanvasTemplate, Constructor, DiagramObjectTemplate,
    DiagramSchemaConfiguration, DictionaryPropertyDescriptor,
    ListPropertyDescriptor, PropertyDescriptor, RootPropertyDescriptor
} from ".";

export class DiagramObjectFactory {

    /**
     * The factory schema's id.
     */
    public readonly id: string;

    /**
     * The factory's canvas template.
     */
    public readonly canvas: CanvasTemplate;

    /**
     * The factory's templates.
     */
    public readonly templates: ReadonlyMap<string, DiagramObjectTemplate>;


    /**
     * Creates a new {@link DiagramObjectFactory}.
     * @param schema
     *  The factory's schema.
     */
    constructor(schema: DiagramSchemaConfiguration) {
        this.id = schema.id;
        this.canvas = schema.canvas;
        this.templates = new Map(
            [schema.canvas, ...schema.templates].map(o => [o.name, o])
        );
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Object Creation  ///////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Creates a new {@link DiagramObject}.
     * @param name
     *  The template's name.
     * @param type
     *  The expected {@link DiagramObject} sub-type.
     *  (Default: `DiagramObject`)
     * @returns
     *  The {@link DiagramObject}.
     */
    public createNewDiagramObject<T extends DiagramObject>(
        name: string,
        type?: Constructor<T>
    ): T;

    /**
     * Creates a new {@link DiagramObject}.
     * @param template
     *  The template.
     * @param type
     *  The expected {@link DiagramObject} sub-type.
     *  (Default: `DiagramObject`)
     * @returns
     *  The {@link DiagramObject}.
     */
    public createNewDiagramObject<T extends DiagramObject>(
        template: DiagramObjectTemplate | string,
        type?: Constructor<T>
    ): T;
    public createNewDiagramObject<T extends DiagramObject>(
        param1: DiagramObjectTemplate | string,
        type?: Constructor<T>
    ): T {
        // Create object
        let template: DiagramObjectTemplate | string;
        if (typeof param1 === "string") {
            template = this.resolveTemplate(param1);
        } else {
            template = param1;
        }
        const object = this.createNewDiagramObjectFromTemplate(template);
        // Assert type
        if (!type || object instanceof type) {
            return object as T;
        } else {
            throw new Error(`Expected '${name}' to be a ${type.name}.`);
        }
    }

    /**
     * Configures a new {@link DiagramObject}.
     * @remarks
     *  This function only constructs the object directly defined by the
     *  template. This function does not generate or attach implied children.
     *  For example, generating a generic block results in an anchor-less
     *  {@link GenericBlock}.
     * @param template
     *  The template.
     * @param type
     *  The expected {@link DiagramObject} sub-type.
     *  (Default: `DiagramObject`)
     */
    public createBaseDiagramObject<T extends DiagramObject>(
        template: DiagramObjectTemplate,
        type?: Constructor<T>
    ): T;

    /**
     * Configures a new {@link DiagramObject}.
     * @remarks
     *  This function only constructs the object directly defined by the
     *  template. This function does not generate or attach implied children.
     *  For example, generating a generic block results in an anchor-less
     *  {@link GenericBlock}.
     * @param name
     *  The template's name.
     * @param instance
     *  The object's instance id.
     *  (Default: Randomly Generated UUID).
     * @param values
     *  The object's property values.
     * @param type
     *  The expected {@link DiagramObject} sub-type.
     *  (Default: `DiagramObject`)
     */
    public createBaseDiagramObject<T extends DiagramObject>(
        name: string,
        instance?: string,
        values?: JsonEntries,
        type?: Constructor<T>
    ): T;

    /**
     * Configures a new {@link DiagramObject}.
     * @remarks
     *  This function only constructs the object directly defined by the
     *  template. This function does not generate or attach implied children.
     *  For example, generating a generic block results in an anchor-less
     *  {@link GenericBlock}.
     * @param template
     *  The template.
     * @param instance
     *  The object's instance id.
     *  (Default: Randomly Generated UUID).
     * @param values
     *  The object's property values.
     * @param type
     *  The expected {@link DiagramObject} sub-type.
     *  (Default: `DiagramObject`)
     */
    public createBaseDiagramObject<T extends DiagramObject>(
        template: DiagramObjectTemplate,
        instance?: string,
        values?: JsonEntries,
        type?: Constructor<T>
    ): T;

    /**
     * Configures a new {@link DiagramObject}.
     * @remarks
     *  This base definition is intended for child classes.
     */
    public createBaseDiagramObject<T extends DiagramObject>(
        name: DiagramObjectTemplate | string,
        param1?: Constructor<T> | string,
        param2?: JsonEntries,
        param3?: Constructor<T>
    ): T;

    public createBaseDiagramObject<T extends DiagramObject>(
        name: DiagramObjectTemplate | string,
        param1?: Constructor<T> | string,
        param2?: JsonEntries,
        param3?: Constructor<T>
    ): T {
        // Parse parameters
        let instance, type;
        if (typeof param1 === "string") {
            instance = param1;
            type = param3;
        } else {
            instance = Crypto.randomUUID();
            type = param1;
        }
        const values = param2;
        // Create object
        const template = typeof name === "string" ? this.resolveTemplate(name) : name;
        const object = this.createBaseDiagramObjectFromTemplate(template, instance, values);
        // Assert type
        if (!type || object instanceof type) {
            return object as T;
        } else {
            throw new Error(`Expected '${name}' to be a ${type.name}.`);
        }
    }

    /**
     * Creates a new {@link DiagramObject} from a template.
     * @param template
     *  The {@link DiagramObjectTemplate}.
     * @returns
     *  The {@link DiagramObject}.
     */
    protected createNewDiagramObjectFromTemplate(
        template: DiagramObjectTemplate
    ): DiagramObject {
        let object;
        switch (template.type) {

            case DiagramObjectType.Block:
                object = this.createBaseDiagramObject(template, Block);
                // Attach anchors
                const { anchors } = template;
                for (const position in anchors) {
                    const anchor = this.createNewDiagramObject(anchors[position], Anchor);
                    object.addAnchor(position, anchor);
                }
                return object;

            case DiagramObjectType.Line:
                object = this.createBaseDiagramObject(template, Line);
                // Attach latches
                const { source, target } = template.latch_template;
                object.source = this.createNewDiagramObject(source, Latch);
                object.target = this.createNewDiagramObject(target, Latch);
                break;

            default:
                object = this.createBaseDiagramObject(template);

        }
        return object;
    }

    /**
     * Configures a new {@link DiagramObject} from a template.
     * @param template
     *  The {@link DiagramObjectTemplate}.
     * @param instance
     *  The object's instance id.
     * @param values
     *  The object's property values.
     * @returns
     *  The {@link DiagramObject}.
     */
    protected createBaseDiagramObjectFromTemplate(
        template: DiagramObjectTemplate,
        instance: string,
        values?: JsonEntries
    ): DiagramObject {
        // Create properties
        const props = this.createRootProperty(template.properties ?? {}, values);
        // Define attributes
        const attrs = template.role ?? SemanticRole.None;
        // Create object
        switch (template.type) {
            case DiagramObjectType.Anchor:
                return new Anchor(template.name, instance, attrs, props);
            case DiagramObjectType.Block:
                return new Block(template.name, instance, attrs, props);
            case DiagramObjectType.Handle:
                return new Handle(template.name, instance, attrs, props);
            case DiagramObjectType.Latch:
                return new Latch(template.name, instance, attrs, props);
            case DiagramObjectType.Line:
                return new Line(template.name, instance, attrs, props);
            case DiagramObjectType.Group:
                return new Group(template.name, instance, attrs, props);
            case DiagramObjectType.Canvas:
                return new Canvas(template.name, instance, attrs, props);
        }
    }

    /**
     * Creates a {@link RootProperty}.
     * @param descriptor
     *  The property descriptor.
     * @param value
     *  The property's value.
     * @returns
     *  The property.
     */
    protected createRootProperty(
        descriptor: RootPropertyDescriptor,
        values?: JsonEntries
    ): RootProperty {
        const map = new Map(values);
        // Create property
        const property = new RootProperty();
        // Create sub-properties
        for (const [id, desc] of Object.entries(descriptor)) {
            property.addProperty(this.createProperty(id, desc, map.get(id)), id);
        }
        return property;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Property Creation  /////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Creates a {@link Property} from a {@link PropertyDescriptor}.
     * @param id
     *  The property's id.
     * @param descriptor
     *  The property descriptor.
     * @param value
     *  The property's value.
     * @returns
     *  The property.
     */
    public createProperty(
        id: string,
        descriptor: PropertyDescriptor,
        value?: JsonEntries | JsonType
    ): Property {
        switch (descriptor.type) {
            case PropertyType.Dictionary:
                if (!Array.isArray(value)) {
                    throw new Error(`Invalid JSON entries: '${value}'.`);
                }
                return this.createDictionaryProperty(id, descriptor, value);
            case PropertyType.List:
                if (!Array.isArray(value)) {
                    throw new Error(`Invalid JSON entries: '${value}'.`);
                }
                return this.createListProperty(id, descriptor, value);
            case PropertyType.String:
            case PropertyType.Int:
            case PropertyType.Float:
            case PropertyType.Date:
            case PropertyType.Enum:
                if (Array.isArray(value)) {
                    throw new Error(`Invalid JSON primitive: '${value}'.`);
                }
                return this.createAtomicProperty(id, descriptor, value);
        }
    }

    /**
     * Creates a {@link DictionaryProperty}.
     * @param id
     *  The property's id.
     * @param descriptor
     *  The property descriptor.
     * @param value
     *  The property's value.
     * @returns
     *  The dictionary property.
     */
    private createDictionaryProperty(
        id: string,
        descriptor: DictionaryPropertyDescriptor,
        values?: JsonEntries
    ): DictionaryProperty {
        const map = new Map(values);
        // Create property
        const property = new DictionaryProperty(id);
        // Create sub-properties
        for (const [id, desc] of Object.entries(descriptor.form)) {
            property.addProperty(this.createProperty(id, desc, map.get(id)), id);
        }
        return property;
    }

    /**
     * Creates a {@link ListProperty}.
     * @param id
     *  The property's id.
     * @param descriptor
     *  The property descriptor.
     * @param value
     *  The property's value.
     * @returns
     *  The list property.
     */
    private createListProperty(
        id: string,
        descriptor: ListPropertyDescriptor,
        values?: JsonEntries
    ): ListProperty {
        // Resolve value
        if (values === undefined) {
            values = descriptor.default;
        }
        // Create property
        const property = new ListProperty(id);
        // Create values
        const desc = descriptor.form;
        for (const [id, value] of values ?? []) {
            property.addProperty(this.createProperty(id, desc, value), id);
        }
        return property;
    }

    /**
     * Creates an atomic property.
     * @param id
     *  The property's id.
     * @param descriptor
     *  The property descriptor.
     * @param value
     *  The property's value.
     * @returns
     *  The atomic property.
     */
    private createAtomicProperty(
        id: string,
        descriptor: AtomicPropertyDescriptors,
        value?: JsonType
    ) {
        // Resolve value
        if (value === undefined) {
            value = descriptor.default;
        }
        // Create property
        let min, max, suggestions, options;
        switch (descriptor.type) {
            case PropertyType.Int:
                min = descriptor.min ?? -Infinity;
                max = descriptor.max ?? Infinity;
                return new IntProperty(id, min, max, value);
            case PropertyType.Float:
                min = descriptor.min ?? -Infinity;
                max = descriptor.max ?? Infinity;
                return new FloatProperty(id, min, max, value);
            case PropertyType.String:
                suggestions = descriptor.suggestions ?? [];
                return new StringProperty(id, suggestions, value);
            case PropertyType.Date:
                return new DateProperty(id, value);
            case PropertyType.Enum:
                options = this.createListProperty(`${id}.options`, descriptor.options);
                return new EnumProperty(id, options, value);
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  3. Template Resolution  ///////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Resolves a template.
     * @param id
     *  The template's id.
     */
    public resolveTemplate(id: string): DiagramObjectTemplate {
        const template = this.templates.get(id);
        if (!template) {
            throw new Error(`Cannot resolve template: '${id}'.`);
        }
        return template;
    }

}

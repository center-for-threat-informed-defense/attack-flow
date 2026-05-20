import { EditorDirective } from "../../EditorDirectives";
import { SynchronousEditorCommand } from "../SynchronousEditorCommand";
import type { DirectiveIssuer } from "../../EditorDirectives";
import { ListProperty, Property, StringProperty } from "@OpenChart/DiagramModel";
import type { JsonValue } from "@OpenChart/DiagramModel";

/**
 * A property whose runtime shape exposes child properties in a Map.
 */
type PropertyMapValue = Property & { value: Map<string, Property> };

/**
 * A property whose runtime shape supports direct value assignment.
 */
type SettableProperty = Property & {
    setValue(value: JsonValue, update?: boolean): void;
};

/**
 * Tests whether a property exposes a Map-backed child-property collection.
 * @param property
 *  The property to inspect.
 * @returns
 *  True when the property has a `value` Map of child properties.
 */
function hasPropertyMapValue(property: Property): property is PropertyMapValue {
    return "value" in property && property.value instanceof Map;
}

/**
 * Tests whether a property supports direct value assignment.
 * @param property
 *  The property to inspect.
 * @returns
 *  True when the property exposes a callable `setValue()` method.
 */
function isSettableProperty(property: Property): property is SettableProperty {
    return "setValue" in property && typeof property.setValue === "function";
}

export class CreateSubproperty extends SynchronousEditorCommand {

    /**
     * The property.
     */
    public readonly property: ListProperty;

    /**
     * The subproperty.
     */
    private readonly subproperty: Property;


    /**
     * Creates a new subproperty and adds it to a {@link ListProperty}.
     * @param property
     *  The {@link ListProperty}.
     */
    constructor(property: ListProperty) {
        super();
        this.property = property;
        this.subproperty = property.createListItem();
        this.autoPopulateGeneratedFields(this.subproperty);
    }

    /**
     * Populates any descendant fields marked for automatic generation.
     * @param property
     *  The property to inspect.
     */
    private autoPopulateGeneratedFields(property: Property): void {
        if (hasPropertyMapValue(property)) {
            for (const childProperty of property.value.values()) {
                this.autoPopulateGeneratedFields(childProperty);
            }
            return;
        }

        if (property instanceof StringProperty && property.autoGenerate && isSettableProperty(property)) {
            property.setValue(crypto.randomUUID());
        }
    }

    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public execute(issueDirective: DirectiveIssuer = () => {}): void {
        this.property.addProperty(this.subproperty, this.subproperty.id);
        issueDirective(EditorDirective.Record | EditorDirective.Autosave);
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public undo(issueDirective: DirectiveIssuer = () => {}): void {
        this.property.removeProperty(this.subproperty.id);
        issueDirective(EditorDirective.Autosave);
    }

}

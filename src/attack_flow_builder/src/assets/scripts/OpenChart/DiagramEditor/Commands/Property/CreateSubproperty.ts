import { EditorCommand } from "../EditorCommand";
import { EditorDirective } from "../EditorDirective";
import type { DirectiveIssuer } from "../DirectiveIssuer";
import type { ListProperty, Property } from "@OpenChart/DiagramModel";

export class CreateSubproperty extends EditorCommand {

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
    }


    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public async execute(issueDirective: DirectiveIssuer = () => {}): Promise<void> {
        this.property.addProperty(this.subproperty, this.subproperty.id);
        issueDirective(EditorDirective.Record | EditorDirective.Autosave);
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public async undo(issueDirective: DirectiveIssuer = () => {}): Promise<void> {
        this.property.removeProperty(this.subproperty.id);
        issueDirective(EditorDirective.Autosave);
    }

}


import { EditorDirective } from "../../EditorDirectives";
import { SynchronousEditorCommand } from "../SynchronousEditorCommand";
import type { DirectiveIssuer } from "../../EditorDirectives";
import type { ListProperty, Property } from "@OpenChart/DiagramModel";

export class DeleteSubproperty extends SynchronousEditorCommand {

    /**
     * The property.
     */
    public readonly property: ListProperty;

    /**
     * The subproperty.
     */
    private readonly subproperty: Property;

    /**
     * The subproperty's location in the collection.
     */
    private readonly index: number;


    /**
     * Deletes a subproperty from a {@link ListProperty}.
     * @param property
     *  The {@link ListProperty}.
     * @param id
     *  The subproperty's id.
     */
    constructor(property: ListProperty, id: string) {
        super();
        const subproperty = property.value.get(id);
        if (!subproperty) {
            throw new Error(`Subproperty '${id}' does not exist.`);
        }
        this.index = property.indexOf(id);
        this.property = property;
        this.subproperty = subproperty;
    }


    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public execute(issueDirective: DirectiveIssuer = () => {}): void {
        this.property.removeProperty(this.subproperty.id);
        issueDirective(EditorDirective.Record | EditorDirective.Autosave);
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public undo(issueDirective: DirectiveIssuer = () => {}): void {
        this.property.addProperty(this.subproperty, this.subproperty.id, this.index);
        issueDirective(EditorDirective.Autosave);
    }

}


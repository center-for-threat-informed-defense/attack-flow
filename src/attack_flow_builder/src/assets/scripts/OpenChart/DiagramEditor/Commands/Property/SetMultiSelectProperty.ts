import { EditorDirective } from "../../EditorDirectives";
import { SynchronousEditorCommand } from "../SynchronousEditorCommand";
import type { MultiSelectProperty } from "@OpenChart/DiagramModel";
import type { DirectiveIssuer } from "../../EditorDirectives";

export class SetMultiSelectProperty extends SynchronousEditorCommand {

    /**
     * The property.
     */
    public readonly property: MultiSelectProperty;

    /**
     * The property's next selected values.
     */
    public readonly nextValues: string[];

    /**
     * The property's previous selected values.
     */
    private readonly prevValues: string[];

    /**
     * Sets the selection of a MultiSelectProperty.
     * @param property The MultiSelectProperty.
     * @param values The new selected ids.
     */
    constructor(property: MultiSelectProperty, values: string[]) {
        super();
        this.property = property;
        this.nextValues = [...values];
        this.prevValues = [...property.values];
    }

    /**
     * Executes the editor command.
     */
    public execute(issueDirective: DirectiveIssuer = () => {}): void {
        this.property.setSelections(this.nextValues);
        issueDirective(EditorDirective.Record | EditorDirective.Autosave);
    }

    /**
     * Undoes the editor command.
     */
    public undo(issueDirective: DirectiveIssuer = () => {}): void {
        this.property.setSelections(this.prevValues);
        issueDirective(EditorDirective.Autosave);
    }
}

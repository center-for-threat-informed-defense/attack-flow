import { EditorDirective } from "../../EditorDirectives";
import { SynchronousEditorCommand } from "../SynchronousEditorCommand";
import type { StringProperty } from "@OpenChart/DiagramModel";
import type { DirectiveIssuer } from "../../EditorDirectives";

export class SetStringProperty extends SynchronousEditorCommand {

    /**
     * The property.
     */
    public readonly property: StringProperty;

    /**
     * The property's next value.
     */
    public readonly nextValue: string | null;

    /**
     * The property's previous value.
     */
    private readonly prevValue: string | null;


    /**
     * Sets the value of a {@link StringProperty}.
     * @param property
     *  The {@link StringProperty}.
     * @param value
     *  The {@link StringProperty}'s new value.
     */
    constructor(property: StringProperty, value: string | null) {
        super();
        this.property = property;
        this.nextValue = value;
        this.prevValue = property.toJson();
    }


    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public execute(issueDirective: DirectiveIssuer = () => {}): void {
        this.property.setValue(this.nextValue);
        issueDirective(EditorDirective.Record | EditorDirective.Autosave);
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public undo(issueDirective: DirectiveIssuer = () => {}): void {
        this.property.setValue(this.prevValue);
        issueDirective(EditorDirective.Autosave);
    }

}

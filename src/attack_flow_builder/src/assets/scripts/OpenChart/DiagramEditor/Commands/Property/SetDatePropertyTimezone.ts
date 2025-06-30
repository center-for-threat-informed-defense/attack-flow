import { EditorDirective } from "../../EditorDirectives";
import { SynchronousEditorCommand } from "../SynchronousEditorCommand";
import type { DateProperty } from "@OpenChart/DiagramModel";
import type { DirectiveIssuer } from "../../EditorDirectives";

export class SetDatePropertyTimezone extends SynchronousEditorCommand {

    /**
     * The property.
     */
    public readonly property: DateProperty;

    /**
     * The property's next value.
     */
    public readonly nextValue: string | null;

    /**
     * The property's previous value.
     */
    private readonly prevValue: string | null;


    /**
     * Sets the timezone value of a {@link DateProperty}.
     * @param property
     *  The {@link DateProperty}.
     * @param value
     *  The {@link DateProperty}'s new timezone value.
     */
    constructor(property: DateProperty, value: string | null) {
        super();
        this.property = property;
        this.prevValue = property.timezone.value;
        this.nextValue = value;
    }


    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public execute(issueDirective: DirectiveIssuer = () => {}): void {
        this.property.setTimezone(this.nextValue);
        issueDirective(EditorDirective.Record | EditorDirective.Autosave);
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public undo(issueDirective: DirectiveIssuer = () => {}): void {
        this.property.setTimezone(this.prevValue);
        issueDirective(EditorDirective.Autosave);
    }

}

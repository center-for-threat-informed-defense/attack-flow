import { EditorDirective } from "../../EditorDirectives";
import { SynchronousEditorCommand } from "../SynchronousEditorCommand";
import type { DateTime } from "luxon";
import type { DateProperty } from "@OpenChart/DiagramModel";
import type { DirectiveIssuer } from "../../EditorDirectives";

export class SetDatePropertyTime extends SynchronousEditorCommand {

    /**
     * The property.
     */
    public readonly property: DateProperty;

    /**
     * The property's next value.
     */
    public readonly nextValue: DateTime | Date | null;

    /**
     * The property's previous value.
     */
    private readonly prevValue: DateTime | null;


    /**
     * Sets the time value of a {@link DateProperty}.
     * @param property
     *  The {@link DateProperty}.
     * @param value
     *  The {@link DateProperty}'s new time value.
     */
    constructor(property: DateProperty, value: DateTime | Date | null) {
        super();
        this.property = property;
        this.prevValue = property.time;
        this.nextValue = value;
    }


    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public async execute(issueDirective: DirectiveIssuer = () => {}): Promise<void> {
        this.property.setTime(this.nextValue);
        issueDirective(EditorDirective.Record | EditorDirective.Autosave);
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public async undo(issueDirective: DirectiveIssuer = () => {}): Promise<void> {
        this.property.setTime(this.prevValue);
        issueDirective(EditorDirective.Autosave);
    }

}

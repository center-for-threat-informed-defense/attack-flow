import { EditorCommand } from "../EditorCommand";
import { EditorDirective } from "../EditorDirective";
import type { DateProperty } from "@OpenChart/DiagramModel";
import type { DirectiveIssuer } from "../DirectiveIssuer";
import type { DateTime } from "luxon";

export class SetDateProperty extends EditorCommand {

    /**
     * The property.
     */
    public readonly property: DateProperty;

    /**
     * The property's next value.
     */
    public readonly nextValue: DateTime | null;

    /**
     * The property's previous value.
     */
    private readonly prevValue: DateTime | null;


    /**
     * Sets the value of a {@link DateProperty}.
     * @param property
     *  The {@link DateProperty}.
     * @param value
     *  The {@link DateProperty}'s new value.
     */
    constructor(property: DateProperty, value: DateTime | null) {
        super();
        this.property = property;
        this.nextValue = value;
        if (property.value) {
            this.prevValue = property.value;
        } else {
            this.prevValue = null;
        }
    }


    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public async execute(issueDirective: DirectiveIssuer = () => {}): Promise<void> {
        this.property.setValue(this.nextValue);
        issueDirective(EditorDirective.Record | EditorDirective.Autosave);
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public async undo(issueDirective: DirectiveIssuer = () => {}): Promise<void> {
        this.property.setValue(this.prevValue);
        issueDirective(EditorDirective.Autosave);
    }

}

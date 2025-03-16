import { EditorCommand } from "../EditorCommand";
import { EditorDirective } from "../EditorDirective";
import type { StringProperty } from "@OpenChart/DiagramModel";
import type { DirectiveIssuer } from "../DirectiveIssuer";

export class SetStringProperty extends EditorCommand {

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

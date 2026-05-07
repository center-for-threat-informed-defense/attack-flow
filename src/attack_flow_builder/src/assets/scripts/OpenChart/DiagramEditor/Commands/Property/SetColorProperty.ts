import { EditorDirective } from "../../EditorDirectives";
import { SynchronousEditorCommand } from "../SynchronousEditorCommand";
import type { ColorProperty } from "@OpenChart/DiagramModel";
import type { DirectiveIssuer } from "../../EditorDirectives";

export class SetColorProperty extends SynchronousEditorCommand {

    /**
     * The property.
     */
    public readonly property: ColorProperty;

    /**
     * The property's next value.
     */
    public readonly nextValue: string | null;

    /**
     * The property's previous value.
     */
    private readonly prevValue: string | null;

    /**
     * Sets the value of a {@link ColorProperty}.
     * @param property
     * The {@link ColorProperty}.
     * @param value
     * The {@link ColorProperty}'s new value.
     */
    constructor(property: ColorProperty, value: string | null) {
        super();
        this.property = property;
        this.nextValue = value;
        this.prevValue = property.toJson();
    }

    /**
     * Executes the editor command.
     * @param issueDirective
     * A function that can issue one or more editor directives.
     */
    public execute(issueDirective: DirectiveIssuer = () => {}): void {
        this.property.setValue(this.nextValue);
        issueDirective(EditorDirective.Record | EditorDirective.Autosave);
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     * A function that can issue one or more editor directives.
     */
    public undo(issueDirective: DirectiveIssuer = () => {}): void {
        this.property.setValue(this.prevValue);
        issueDirective(EditorDirective.Autosave);
    }
}

import { EditorDirective } from "../../EditorDirectives";
import { SynchronousEditorCommand } from "../SynchronousEditorCommand";
import type { EnumProperty } from "@OpenChart/DiagramModel";
import type { DirectiveIssuer } from "../../EditorDirectives";

export class SetEnumProperty extends SynchronousEditorCommand {

    /**
     * The property.
     */
    public readonly property: EnumProperty;

    /**
     * The property's next value.
     */
    public readonly nextValue: string | null;

    /**
     * The property's previous value.
     */
    private readonly prevValue: string | null;


    /**
     * Sets the value of a {@link EnumProperty}.
     * @param property
     *  The {@link EnumProperty}.
     * @param value
     *  The {@link EnumProperty}'s new value.
     */
    constructor(property: EnumProperty, value: string | null) {
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


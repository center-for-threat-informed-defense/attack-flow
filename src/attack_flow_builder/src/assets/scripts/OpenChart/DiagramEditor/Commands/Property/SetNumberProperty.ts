import { EditorDirective } from "../../EditorDirectives";
import { SynchronousEditorCommand } from "../SynchronousEditorCommand";
import type { DirectiveIssuer } from "../../EditorDirectives";
import type { FloatProperty, IntProperty } from "@OpenChart/DiagramModel";

export class SetNumberProperty extends SynchronousEditorCommand {

    /**
     * The property.
     */
    public readonly property: IntProperty | FloatProperty;

    /**
     * The property's next value.
     */
    public readonly nextValue: number | null;

    /**
     * The property's previous value.
     */
    private readonly prevValue: number | null;


    /**
     * Sets the value of a {@link IntProperty} or {@link FloatProperty}.
     * @param property
     *  The {@link IntProperty} or {@link FloatProperty}.
     * @param value
     *  The new value.
     */
    constructor(property: IntProperty | FloatProperty, value: number | null) {
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

import { EditorDirective } from "../../EditorDirectives";
import { SynchronousEditorCommand } from "../SynchronousEditorCommand";
import type { DirectiveIssuer } from "../../EditorDirectives";
import type { JsonValue, TupleProperty } from "@OpenChart/DiagramModel";

export class SetTupleSubproperty extends SynchronousEditorCommand {

    /**
     * The property.
     */
    public readonly property: TupleProperty;

    /**
     * The property's previous value.
     */
    public readonly prevValue: [string, JsonValue][];

    /**
     * The command that sets the subproperty.
     */
    public readonly nextValue: SynchronousEditorCommand;


    /**
     * Sets the value of a {@link TupleProperty}'s subproperty.
     * @param property
     *  The {@link TupleProperty}.
     * @param value
     *  The {@link SynchronousEditorCommand} that sets the subproperty.
     */
    constructor(property: TupleProperty, value: SynchronousEditorCommand) {
        super();
        this.property = property;
        this.nextValue = value;
        this.prevValue = property.toOrderedJson();
    }


    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public execute(issueDirective: DirectiveIssuer = () => {}): void {
        this.nextValue.execute();
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

import { PositionSetByUser } from "@OpenChart/DiagramView";
import { EditorDirective } from "../../EditorDirectives";
import { SynchronousEditorCommand } from "../SynchronousEditorCommand";
import type { DirectiveIssuer } from "../../EditorDirectives";
import type { DiagramObjectView } from "@OpenChart/DiagramView";

export class UserSetObjectPosition extends SynchronousEditorCommand {

    /**
     * The object.
     */
    public readonly object: DiagramObjectView;

    /**
     * The object's previous value.
     */
    public readonly prevValue: number;

    /**
     * The object's next value.
     */
    public readonly nextValue: number;


    /**
     * Declares that an object's position was set by the user.
     * @param object
     *  The object.
     */
    constructor(object: DiagramObjectView) {
        super();
        this.object = object;
        this.prevValue = object.userSetPosition;
        this.nextValue = PositionSetByUser.True;
    }


    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public execute(issueDirective: DirectiveIssuer = () => {}): void {
        this.object.userSetPosition = this.nextValue;
        issueDirective(EditorDirective.Record);
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public undo(issueDirective: DirectiveIssuer = () => {}): void {
        this.object.userSetPosition = this.prevValue;
        issueDirective(EditorDirective.Record);
    }


}

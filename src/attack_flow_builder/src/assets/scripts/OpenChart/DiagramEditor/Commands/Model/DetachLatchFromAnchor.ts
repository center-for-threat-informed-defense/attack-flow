import { EditorDirective } from "../../EditorDirectives";
import { SynchronousEditorCommand } from "../SynchronousEditorCommand";
import type { Anchor, Latch } from "@OpenChart/DiagramModel";
import type { DirectiveIssuer } from "../../EditorDirectives";

export class DetachLatchFromAnchor extends SynchronousEditorCommand {

    /**
     * The latch.
     */
    public readonly latch: Latch;

    /**
     * The latch's anchor.
     */
    public readonly anchor: Anchor;


    /**
     * Detaches a latch from its anchor.
     * @param object
     *  The latch.
     */
    constructor(latch: Latch) {
        super();
        if (!latch.anchor) {
            throw new Error(`Latch '${latch.id}' not attached to an anchor.`);
        }
        this.latch = latch;
        this.anchor = latch.anchor;
    }


    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public execute(issueDirective: DirectiveIssuer = () => {}): void {
        this.latch.unlink(true);
        issueDirective(EditorDirective.Autosave | EditorDirective.Record);
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public undo(issueDirective: DirectiveIssuer = () => {}): void {
        this.latch.link(this.anchor, true);
        issueDirective(EditorDirective.Autosave | EditorDirective.Record);
    }

}

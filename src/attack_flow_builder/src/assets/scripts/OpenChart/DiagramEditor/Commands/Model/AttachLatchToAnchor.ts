import { EditorDirective } from "../../EditorDirectives";
import { SynchronousEditorCommand } from "../SynchronousEditorCommand";
import type { Anchor, Latch } from "@OpenChart/DiagramModel";
import type { DirectiveIssuer } from "../../EditorDirectives";

export class AttachLatchToAnchor extends SynchronousEditorCommand {

    /**
     * The latch.
     */
    public readonly latch: Latch;

    /**
     * The latch's previous anchor.
     */
    public readonly prevAnchor: Anchor | null;

    /**
     * The latch's next anchor.
     */
    public readonly nextAnchor: Anchor;


    /**
     * Attaches a latch to an anchor.
     * @param latch
     *  The latch.
     * @param anchor
     *  The anchor.
     */
    constructor(latch: Latch, anchor: Anchor) {
        super();
        this.latch = latch;
        this.prevAnchor = latch.anchor;
        this.nextAnchor = anchor;
    }


    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public execute(issueDirective: DirectiveIssuer = () => {}): void {
        this.latch.link(this.nextAnchor, true);
        issueDirective(EditorDirective.Autosave | EditorDirective.Record);
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public undo(issueDirective: DirectiveIssuer = () => {}): void {
        this.latch.unlink(true);
        if (this.prevAnchor) {
            this.latch.link(this.prevAnchor, true);
        }
        issueDirective(EditorDirective.Autosave | EditorDirective.Record);
    }

}

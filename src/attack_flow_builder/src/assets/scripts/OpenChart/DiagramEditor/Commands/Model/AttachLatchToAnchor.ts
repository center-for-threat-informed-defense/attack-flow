import { EditorCommand } from "../EditorCommand";
import { EditorDirective } from "../EditorDirective";
import type { Anchor, Latch } from "@OpenChart/DiagramModel";
import type { DirectiveIssuer } from "../DirectiveIssuer";

export class AttachLatchToAnchor extends EditorCommand {

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
        this.latch.unlink();
        this.latch.link(this.nextAnchor);
        issueDirective(EditorDirective.Autosave | EditorDirective.Record);
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public undo(issueDirective: DirectiveIssuer = () => {}): void {
        this.latch.unlink();
        if(this.prevAnchor) {
            this.latch.link(this.prevAnchor);
        }
        issueDirective(EditorDirective.Autosave | EditorDirective.Record);
    }

}

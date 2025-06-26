import { EditorDirective } from "../../EditorDirectives";
import { SynchronousEditorCommand } from "../SynchronousEditorCommand";
import type { DirectiveIssuer } from "../../EditorDirectives";
import type { DiagramObjectView } from "@OpenChart/DiagramView";

export class MoveObjectsBy extends SynchronousEditorCommand {

    /**
     * The object(s) to move.
     */
    public readonly object: DiagramObjectView | DiagramObjectView[];

    /**
     * The change in x.
     */
    public readonly dx: number;

    /**
     * The change in y.
     */
    public readonly dy: number;


    /**
     * Moves one or more objects relative to their current position.
     * @param object
     *  The object(s) to move.
     * @param dx
     *  The change in x.
     * @param dy
     *  The change in y.
     */
    constructor(object: DiagramObjectView | DiagramObjectView[], dx: number, dy: number) {
        super();
        this.object = object;
        this.dx = dx;
        this.dy = dy;
    }


    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public execute(issueDirective: DirectiveIssuer = () => {}): void {
        if (Array.isArray(this.object)) {
            this.object.forEach(o => o.moveBy(this.dx, this.dy));
        } else {
            this.object.moveBy(this.dx, this.dy);
        }
        issueDirective(EditorDirective.Record | EditorDirective.Autosave);
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public undo(issueDirective: DirectiveIssuer = () => {}): void {
        if (Array.isArray(this.object)) {
            this.object.forEach(o => o.moveBy(-this.dx, -this.dy));
        } else {
            this.object.moveBy(-this.dx, -this.dy);
        }
        issueDirective(EditorDirective.Record | EditorDirective.Autosave);
    }

}

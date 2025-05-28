import { EditorCommand } from "../EditorCommand";
import { EditorDirective } from "../EditorDirective";
import type { DirectiveIssuer } from "../DirectiveIssuer";
import type { DiagramObjectView } from "@OpenChart/DiagramView";

export class MoveObjectsTo extends EditorCommand {

    /**
     * The object(s) to move.
     */
    public readonly object: DiagramObjectView | DiagramObjectView[];

    /**
     * The x coordinate.
     */
    public readonly nx: number;

    /**
     * The y coordinate.
     */
    public readonly ny: number;

    /**
     * The objects' last x coordinate.
     */
    private readonly px: number | number[];

    /**
     * The objects' last y coordinate.
     */
    public readonly py: number | number[];


    /**
     * Moves one or more objects to a specific coordinate.
     * @param object
     *  The object(s) to move.
     * @param x
     *  The x coordinate.
     * @param y
     *  The y coordinate.
     */
    constructor(object: DiagramObjectView | DiagramObjectView[], x: number, y: number) {
        super();
        this.object = object;
        this.nx = x;
        this.ny = y;
        if (Array.isArray(this.object)) {
            this.px = new Array(this.object.length);
            this.py = new Array(this.object.length);
            for (let i = 0; i < this.object.length; i++) {
                this.px[i] = this.object[i].x;
                this.py[i] = this.object[i].y;
            }
        } else {
            this.px = this.object.x;
            this.py = this.object.y;
        }
    }


    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public execute(issueDirective: DirectiveIssuer = () => {}): void {
        if (Array.isArray(this.object)) {
            this.object.forEach(o => o.moveTo(this.nx, this.ny));
        } else {
            this.object.moveTo(this.nx, this.ny);
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
            for (let i = 0; i < this.object.length; i++) {
                this.object[i].moveTo(
                    (this.px as number[])[i],
                    (this.py as number[])[i]
                );
            }
        } else {
            this.object.moveTo(
                this.px as number,
                this.py as number
            );
        }
        issueDirective(EditorDirective.Record | EditorDirective.Autosave);
    }

}

import { EditorDirective } from "../../EditorDirectives";
import { ManualLayoutEngine } from "@OpenChart/DiagramView";
import { SynchronousEditorCommand } from "../SynchronousEditorCommand";
import type { DirectiveIssuer } from "../../EditorDirectives";
import type { CanvasView, DiagramLayoutEngine, PositionMap } from "@OpenChart/DiagramView";

export class RunLayout extends SynchronousEditorCommand {

    /**
     * The layout engine to use.
     */
    public readonly engine: DiagramLayoutEngine;

    /**
     * The canvas to operate on.
     */
    public readonly canvas: CanvasView;

    /**
     * The objects to position.
     */
    public readonly objects: Set<string> | undefined;

    /**
     * The canvas's previous layout.
     */
    public readonly prevLayout: PositionMap;


    /**
     * Runs a layout engine on a {@link CanvasView}. 
     * @param engine
     *  The layout engine to use.
     * @param canvas
     *  The canvas to operate on.
     * @param objects
     *  The objects to position. If unspecified, all objects are positioned.
     */
    constructor(engine: DiagramLayoutEngine, canvas: CanvasView, objects?: Set<string>) {
        super();
        this.engine = engine;
        this.canvas = canvas;
        this.objects = objects;
        this.prevLayout = ManualLayoutEngine.generatePositionMap([this.canvas]);
    }


    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public execute(issueDirective: DirectiveIssuer = () => {}): void {
        this.engine.run(this.canvas, this.objects);
        issueDirective(EditorDirective.Record | EditorDirective.Autosave);
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public undo(issueDirective: DirectiveIssuer = () => {}): void {
        new ManualLayoutEngine(this.prevLayout).run(this.canvas);
        issueDirective(EditorDirective.Record | EditorDirective.Autosave);
    }

}

import { Focus } from "@OpenChart/DiagramView";
import { EditorDirective } from "../../EditorDirectives";
import { SynchronousEditorCommand } from "../SynchronousEditorCommand";
import type { DirectiveIssuer } from "../../EditorDirectives";
import type { DiagramObjectView } from "@OpenChart/DiagramView";

export class SelectObjects extends SynchronousEditorCommand {

    /**
     *  The object(s) to select.
     */
    public readonly object: DiagramObjectView | DiagramObjectView[];

    /**
     * The select state upon execute.
     */
    public readonly execSelect: boolean | undefined;

    /**
     * The select state upon undo.
     */
    public readonly undoSelect: boolean | undefined;

    /**
     * The select state upon redo.
     */
    public readonly redoSelect: boolean | undefined;


    /**
     * Selects / Unselects one or more objects. This command allows you to set
     * the select state of a {@link DiagramObjectView} for each command state
     * (i.e. execute, undo, and redo).
     * @param object
     *  The object(s) to select.
     * @param execSelect
     *  The select state upon execute.
     * @param undoSelect
     *  The select state upon undo.
     * @param redoSelect
     *  The select state upon redo.
     */
    constructor(
        object: DiagramObjectView | DiagramObjectView[],
        execSelect?: boolean,
        undoSelect?: boolean,
        redoSelect?: boolean
    ) {
        super();
        this.object = object;
        this.execSelect = execSelect;
        this.undoSelect = undoSelect;
        this.redoSelect = redoSelect ?? this.execSelect;
    }


    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public execute(issueDirective: DirectiveIssuer = () => {}): void {
        this.select(this.execSelect);
        issueDirective(EditorDirective.ReindexSelection);
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public undo(issueDirective: DirectiveIssuer = () => {}): void {
        this.select(this.undoSelect);
        issueDirective(EditorDirective.ReindexSelection);
    }

    /**
     * Redoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public redo(issueDirective: DirectiveIssuer = () => {}): void {
        this.select(this.redoSelect);
        issueDirective(EditorDirective.ReindexSelection);
    }

    /**
     * Executes a select option.
     * @param option
     *  The select option.
     */
    private select(option?: boolean) {
        if (option === undefined) {
            return;
        }
        const state = option ? Focus.True : Focus.False;
        if (Array.isArray(this.object)) {
            for (const obj of this.object) {
                obj.focused = state;
            }
        } else  {
            this.object.focused = state;
        }
    }

}

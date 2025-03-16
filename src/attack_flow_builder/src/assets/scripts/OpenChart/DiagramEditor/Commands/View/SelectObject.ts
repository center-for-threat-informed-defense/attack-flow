import { Focus } from "@OpenChart/DiagramView";
import { EditorCommand } from "../EditorCommand";
import { EditorDirective } from "../EditorDirective";
import type { DirectiveIssuer } from "../DirectiveIssuer";
import type { DiagramObjectView } from "@OpenChart/DiagramView";

export class SelectObject extends EditorCommand {

    /**
     * The object to select.
     */
    public readonly object: DiagramObjectView;


    /**
     * Selects an object.
     * @param object
     *  The object to select.
     */
    constructor(object: DiagramObjectView) {
        super();
        this.object = object;
    }


    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public async execute(issueDirective: DirectiveIssuer = () => {}): Promise<void> {
        this.object.focused = Focus.True;
        issueDirective(EditorDirective.ReindexSelection);
    }

    /**
     * Undoes the editor command.
     */
    public async undo(): Promise<void> {}

}

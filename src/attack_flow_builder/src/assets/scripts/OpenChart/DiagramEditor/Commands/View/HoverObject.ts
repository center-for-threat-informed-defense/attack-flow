import { Hover } from "@OpenChart/DiagramView";
import { EditorCommand } from "../EditorCommand";
import type { DiagramObjectView } from "@OpenChart/DiagramView";

export class HoverObject extends EditorCommand {

    /**
     * The object to hover.
     */
    public readonly object: DiagramObjectView;

    /**
     * The object's hover state.
     */
    public readonly state: boolean;


    /**
     * Sets an object's hover state.
     * @param object
     *  The object to hover.
     * @param state
     *  The object's hover state.
     */
    constructor(object: DiagramObjectView, state: boolean) {
        super();
        this.object = object;
        this.state = state;
    }
    
    
    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public async execute(): Promise<void> {
        let obj: DiagramObjectView | null = this.object;
        const h1 = this.state ? Hover.Direct : Hover.Off;
        const h2 = this.state ? Hover.Indirect : Hover.Off;
        obj.hovered = h1;
        obj = obj.parent;
        while (obj) {
            obj.hovered = h2;
            obj = obj.parent;
        }
    }

    /**
     * Undoes the editor command.
     */
    public async undo(): Promise<void> {}

}

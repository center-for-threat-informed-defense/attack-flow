import * as EditorCommands from "../Commands";
import { Anchor } from "@OpenChart/DiagramModel";
import { DragHandler } from "@OpenChart/DiagramInterface";
import type { EditorCommand } from "../Commands";
import type { DiagramObjectView } from "@OpenChart/DiagramView";

export class SelectAndMoveHandler extends DragHandler<EditorCommand> {
    
    /**
     * Creates a new {@link SelectMoveHandler}.
     */
    constructor() {
        super();
    }

    public canHandleInteraction(obj: DiagramObjectView): boolean {
        if(obj instanceof Anchor) {
            return false;
        }
        return true;
    }

    protected handleDragStart(obj: DiagramObjectView): void {
        this.emit("interaction", EditorCommands.selectObject(obj));
    }
    
    protected handleDrag(): void {
        // throw new Error("Method not implemented.");
    }
    
    protected handleDragEnd(): void {
        // throw new Error("Method not implemented.");
    }

}
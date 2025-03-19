import * as EditorCommands from "../Commands";
import { HoverPlugin } from "./HoverPlugin";
import { EditorCommand } from "../Commands";
import { DiagramInterface } from "@OpenChart/DiagramInterface";
import { SelectionAnimation } from "./Animations";
import type { DiagramObjectView } from "@OpenChart/DiagramView";

export class CanvasSelectPlugin extends HoverPlugin {

    /**
     * Creates a new {@link MoveObjectPlugin}.
     * @param ui
     *  The plugin's interface.
     */
    constructor(ui: DiagramInterface<EditorCommand>) {
        super(ui);
    }

    
    /**
     * Tests if the plugin can handle a selection.
     * @param obj
     *  The object being selected.
     * @param event
     *  The mouse event.
     * @returns
     *  True if the plugin can handle the event, false otherwise.
     */
    public canHandleSelection(obj: DiagramObjectView | undefined, event: MouseEvent): boolean {
        return obj === undefined;
    }

    /**
     * Selection start logic.
     * @param obj
     *  The object being selected.
     * @param event
     *  The mouse event.
     * @returns
     *  True if control should be transferred back to the interface, false
     *  otherwise. If true, subsequent drag events will directly manipulate the
     *  view instead of the plugin's selection (`handleSelectDrag()` and
     *  `handleSelectEnd()` will not be invoked).
     */
    protected handleSelectStart(obj: DiagramObjectView | undefined, event: MouseEvent): boolean {
        this.execute(EditorCommands.unselectGroupObjects(this.interface.root));
        this.execute(EditorCommands.stopAnimation(this.interface, SelectionAnimation));
        return true;
    }

    /**
     * Selection drag logic.
     * @param event
     *  The mouse event.
     * @param delta
     *  The selection's delta.
     */
    protected handleSelectDrag(event: MouseEvent): [number, number] {
        return this.getDistance();
    }
    
    /**
     * Selection end logic.
     * @param event
     *  The mouse event.
     */
    protected handleSelectEnd(event: MouseEvent): void {}

}

import * as EditorCommands from "../Commands";
import { AnchorView } from "@OpenChart/DiagramView";
import { EditorCommand } from "../Commands";
import { DiagramInterface } from "@OpenChart/DiagramInterface";
import { LineLatchMoverPlugin } from "./LineLatchMoverPlugin";
import type { DiagramObjectView } from "@OpenChart/DiagramView";

export class CreateLineControllerPlugin extends LineLatchMoverPlugin {

    /**
     * Creates a new {@link CreateLineControllerPlugin}.
     * @param ui
     *  The plugin's interface.
     */
    constructor(ui: DiagramInterface<EditorCommand>) {
        super(ui);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Selection Interactions  ////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    

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
        return obj instanceof AnchorView;
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
        // Start stream command
        // Create line
        
        // Handle latch
        // super.handleSelectStart();
        // Assume control of movement
        return false;
    }

}

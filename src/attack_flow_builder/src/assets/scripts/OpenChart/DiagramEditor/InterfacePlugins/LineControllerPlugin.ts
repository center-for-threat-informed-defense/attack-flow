import * as EditorCommands from "../Commands";
import { HoverPlugin } from "./HoverPlugin";
import { EditorCommand } from "../Commands";
import { Handle, Latch } from "@OpenChart/DiagramModel";
import { Alignment, HandleView } from "@OpenChart/DiagramView";
import { Cursor, DiagramInterface } from "@OpenChart/DiagramInterface";
import { LatchView, type DiagramObjectView } from "@OpenChart/DiagramView";

export class LineControllerPlugin extends HoverPlugin {

    /**
     * The current selection.
     */
    private selection: LatchView | HandleView;

    /**
     * The selection's alignment.
     */
    private alignment: number;


    /**
     * Creates a new {@link SelectAndMovePlugin}.
     * @param ui
     *  The plugin's interface.
     */
    constructor(ui: DiagramInterface<EditorCommand>) {
        super(ui);
        this.selection = null as unknown as LatchView;
        this.alignment = Alignment.Free;
    }

    
    ///////////////////////////////////////////////////////////////////////////
    //  1. Hover Interactions  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Tests if the plugin can handle a hover event.
     * @param obj
     *  The object being hovered.
     * @param event
     *  The mouse event.
     * @returns
     *  True if the plugin can handle the event, false otherwise.
     */
    public canHandleHover(obj: DiagramObjectView | undefined, event: MouseEvent): boolean {
        return obj instanceof Latch || obj instanceof Handle;
    }

    /**
     * Hover start logic.
     * @param obj
     *  The object being hovered.
     * @returns
     *  The active cursor type.
     */
    public handleHoverStart(obj: DiagramObjectView | undefined): Cursor {
        super.handleHoverStart(obj);
        return Cursor.Pointer;
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
        return obj instanceof Latch || obj instanceof Handle;
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
        // Prepare selection
        if(obj instanceof LatchView) {
            this.selection = obj;
            this.alignment = obj.alignment;
        } else if(obj instanceof HandleView) {
            this.selection = obj;
            this.alignment = obj.alignment;
            this.execute(EditorCommands.userSetObjectPosition(obj));
        }
        // Assume control of movement
        return false;
    }

    /**
     * Selection drag logic.
     * @param event
     *  The mouse event.
     * @param delta
     *  The selection's delta.
     */
    protected handleSelectDrag(event: MouseEvent): [number, number] {
        // Get distance
        let delta;
        if(this.alignment === Alignment.Grid) {
            delta = this.getDistanceOnGrid(this.interface.root.grid);
        } else {
            delta = this.getDistance();
        }
        // Move
        this.execute(EditorCommands.moveObjectsBy(this.selection, delta[0], delta[1]));
        // Return delta
        return delta;
    }
    
    /**
     * Selection end logic.
     * @param event
     *  The mouse event.
     */
    protected handleSelectEnd(event: MouseEvent): void {
        // End stream command
    }

}

import * as EditorCommands from "../Commands";
import { SelectPlugin } from "./SelectPlugin";
import { EditorCommand } from "../Commands";
import { Cursor, DiagramInterface } from "@OpenChart/DiagramInterface";
import { Alignment, AnchorView, LatchView, LineView, Tangibility } from "@OpenChart/DiagramView";
import type { DiagramObjectView } from "@OpenChart/DiagramView";

export class LineLatchMoverPlugin extends SelectPlugin {

    /**
     * The current selection.
     */
    private selection: LatchView;

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
        return this.canHandleSelection(obj, event);
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
        if(obj instanceof LatchView) {
            return obj.parent instanceof LineView;
        } 
        return false;
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
        if(!obj?.parent) {
            return true;
        }
        // TODO: Start stream command
        // Prepare selection
        this.selection = obj as LatchView;
        this.alignment = obj.alignment;
        // Select line
        if(!obj.parent.focused) {
            this.select(obj.parent, event);
        }
        // Make line and latch intangible
        const { setTangibility } = EditorCommands;
        this.execute(setTangibility(obj, Tangibility.None));
        this.execute(setTangibility(obj.parent!, Tangibility.None));
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
        const { attachLatchToAnchor, detachLatchFromAnchor, moveObjectsBy } = EditorCommands;
        // Get hovered item
        let delta = this.getDistance();
        const hover = this.interface.root.getObjectAt(
            this.selection.x + delta[0],
            this.selection.y + delta[1]
        )
        // Update hover
        this.hoverStart(hover, event);
        // Update distance, if necessary 
        if(this.alignment === Alignment.Grid) {
            delta = this.getDistanceOnGrid(this.interface.root.grid);
        }
        // Attach latch
        if(hover instanceof AnchorView) {
            delta = this.getDistanceOntoObject(hover, this.selection);
            if(!this.selection.isLinked(hover)) {
                this.execute(attachLatchToAnchor(this.selection, hover));
            }
        } else if(this.selection.isLinked()) {
            this.execute(detachLatchFromAnchor(this.selection));
        }
        // Move object
        this.execute(moveObjectsBy(this.selection, delta[0], delta[1]));
        // Return delta
        return delta;
    }
    
    /**
     * Selection end logic.
     * @param event
     *  The mouse event.
     */
    protected handleSelectEnd(event: MouseEvent): void {
        const { setTangibility } = EditorCommands;
        // Reset latch tangibility
        // TODO: Consider separating tangibility from selection priority
        this.execute(setTangibility(this.selection, Tangibility.Priority));
        // Reset line tangibility
        const line = this.selection.parent;
        if(line) {
            this.execute(setTangibility(line, Tangibility.Normal));
        }
        // TODO: End stream command
    }

}

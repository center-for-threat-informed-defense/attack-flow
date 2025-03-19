import * as EditorCommands from "../Commands";
import { Alignment } from "@OpenChart/DiagramView";
import { HoverPlugin } from "./HoverPlugin";
import { EditorCommand } from "../Commands";
import { SelectionAnimation } from "./Animations";
import { Cursor, DiagramInterface } from "@OpenChart/DiagramInterface";
import { Block, findImplicitSelection, Handle, Line, traverse } from "@OpenChart/DiagramModel";
import type { DiagramObjectView } from "@OpenChart/DiagramView";

export class MoveObjectPlugin extends HoverPlugin {

    /**
     * The current selection.
     */
    private selection: DiagramObjectView[];

    /**
     * The selection's alignment.
     */
    private alignment: number;


    /**
     * Creates a new {@link MoveObjectPlugin}.
     * @param ui
     *  The plugin's interface.
     */
    constructor(ui: DiagramInterface<EditorCommand>) {
        super(ui);
        this.selection = [];
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
        return obj instanceof Block
            || obj instanceof Line
            || obj instanceof Handle;
    }

    /**
     * Hover start logic.
     * @param obj
     *  The object being hovered.
     * @returns
     *  The active cursor type.
     */
    public handleHoverStart(obj: DiagramObjectView | undefined): Cursor {
        // Handle hover
        super.handleHoverStart(obj);
        // Return cursor
        return Cursor.Move;
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
        return obj instanceof Block
            || obj instanceof Line;
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
        const root = this.interface.root;
        // Update selection
        this.updateSelection(obj, event);
        // Get initial selection
        this.selection = [...traverse(root, o => o.focused)];
        // Get implicit selection
        this.selection = findImplicitSelection(this.selection) as DiagramObjectView[];
        // Determine alignment
        this.alignment = this.selection.some(
            o => o.alignment === Alignment.Grid
        ) ? Alignment.Grid : Alignment.Free;
        // Start stream command
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

    /**
     * Updates the current selection.
     * @param obj
     *  The object being selected.
     * @param event
     *  The mouse event.
     */
    private updateSelection(obj: DiagramObjectView | undefined, event: MouseEvent) {
        // Update selection 
        if(!event.ctrlKey) {
            this.execute(EditorCommands.unselectGroupObjects(this.interface.root));
            this.execute(EditorCommands.stopAnimation(this.interface, SelectionAnimation));
        }
        if(obj) {
            this.execute(EditorCommands.selectObject(obj));
            this.execute(EditorCommands.runAnimation(this.interface, SelectionAnimation));
        }
    }

}

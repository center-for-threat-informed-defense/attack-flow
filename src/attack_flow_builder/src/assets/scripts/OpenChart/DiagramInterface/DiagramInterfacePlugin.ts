import { EventEmitter, roundNearestMultiple } from "../Utilities";
import type { Cursor } from "./Mouse";
import type { DiagramObjectView } from "@OpenChart/DiagramView";

export abstract class DiagramInterfacePlugin<T> extends EventEmitter<{ "execute": (event: T) => void}> {

    /**
     * The cursor's current x-coordinate.
     */
    protected xCursor: number;

    /**
     * The cursor's current y-coordinate.
     */
    protected yCursor: number;

    /**
     * The cursor's total delta on the x-axis.
     */
    private xCursorDelta: number;

    /**
     * The cursor's total delta on the y-axis.
     */
    private yCursorDelta: number;

    /**
     * The selection's total delta on the x-axis.
     */
    private xSelectionDelta: number;

    /**
     * The selection's total delta on the y-axis.
     */
    private ySelectionDelta: number;


    /**
     * Creates a new {@link DiagramInterfacePlugin}.
     */
    constructor() {
        super();
        this.xCursor = 0;
        this.yCursor = 0;
        this.xCursorDelta = 0;
        this.yCursorDelta = 0;
        this.xSelectionDelta = 0;
        this.ySelectionDelta = 0;
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
    public abstract canHandleHover(
        obj: DiagramObjectView | undefined,
        event: MouseEvent
    ): boolean;

    /**
     * Singles the start of a hover event.
     * @param obj
     *  The object being hovered.
     * @param event
     *  The mouse event.
     * @returns
     *  The active cursor type.
     */
    public hoverStart(
        obj: DiagramObjectView | undefined,
        event: MouseEvent
    ): Cursor | undefined {
        return this.handleHoverStart(obj, event);
    }

    /**
     * Hover start logic.
     * @param obj
     *  The object being hovered.
     * @param event
     *  The mouse event.
     * @returns
     *  The active cursor type.
     */
    public abstract handleHoverStart(
        obj: DiagramObjectView | undefined,
        event: MouseEvent
    ): Cursor | undefined;


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
    public abstract canHandleSelection(
        obj: DiagramObjectView | undefined,
        event: MouseEvent
    ): boolean;

    /**
     * Signals the start of a selection.
     * @param obj
     *  The object being selected.
     * @param cx
     *  The cursor's current x-coordinate.
     * @param cy
     *  The cursor's current y-coordinate.
     * @param event
     *  The mouse event.
     * @returns
     *  True if control should be transferred back to the interface, false
     *  otherwise. If true, subsequent drag events will directly manipulate the
     *  view instead of the plugin's selection (`handleSelectDrag()` and
     *  `handleSelectEnd()` will not be invoked).
     */
    public selectStart(
        obj: DiagramObjectView | undefined,
        cx: number, cy: number,
        event: MouseEvent
    ): boolean {
        this.xCursor = cx;
        this.yCursor = cy;
        this.xCursorDelta = 0;
        this.yCursorDelta = 0;
        this.xSelectionDelta = 0;
        this.ySelectionDelta = 0;
        return this.handleSelectStart(obj, event);
    }

    /**
     * Signals the movement of the selection.
     * @param dx
     *  The current delta-x.
     * @param dy
     *  The current delta-y.
     * @param event
     *  The mouse event.
     */
    public selectDrag(
        dx: number,
        dy: number,
        event: MouseEvent
    ) {
        // Update cursor
        this.xCursor += dx;
        this.yCursor += dy;
        this.xCursorDelta += dx;
        this.yCursorDelta += dy;
        // Handle drag
        const delta = this.handleSelectDrag(event);
        // Update selection delta
        this.xSelectionDelta += delta[0];
        this.ySelectionDelta += delta[1];
    }

    /**
     * Signals the end of the selection.
     * @param event
     *  The mouse event.
     */
    public selectEnd(event: MouseEvent) {
        this.handleSelectEnd(event);
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
    protected abstract handleSelectStart(
        obj: DiagramObjectView | undefined,
        event: MouseEvent
    ): boolean;

    /**
     * Selection drag logic.
     * @param event
     *  The mouse event.
     * @param delta
     *  The selection's delta.
     */
    protected abstract handleSelectDrag(event: MouseEvent): [number, number];

    /**
     * Selection end logic.
     * @param event
     *  The mouse event.
     */
    protected abstract handleSelectEnd(event: MouseEvent): void;


    ///////////////////////////////////////////////////////////////////////////
    //  3. Distance Functions  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns how far the selection has moved since the last drag event.
     * @returns
     *  The selection's [x, y] delta.
     */
    protected getDistance(): [number, number] {
        return [
            this.xCursorDelta - this.xSelectionDelta,
            this.yCursorDelta - this.ySelectionDelta
        ]
    }

    /**
     * Returns how far the selection has moved on a grid since the last drag
     * event.
     * @param grid
     *  The grid's size.
     * @returns
     *  The selection's [x, y] delta.
     */
    protected getDistanceOnGrid(grid: [number, number]): [number, number] {
        return [
            roundNearestMultiple(this.xCursorDelta, grid[0]) - this.xSelectionDelta,
            roundNearestMultiple(this.yCursorDelta, grid[1]) - this.ySelectionDelta
        ]
    }


    ///////////////////////////////////////////////////////////////////////////
    //  4. Execute Commands  //////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    

    /**
     * Executes a plugin command.
     * @param cmd
     *  The command.
     */
    protected execute(cmd: T) {
        this.emit("execute", cmd);
    }

}

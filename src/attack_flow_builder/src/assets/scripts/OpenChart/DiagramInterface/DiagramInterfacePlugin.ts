import { SubjectTrack } from "./ObjectTrack";
import type { Cursor } from "./Mouse";

export abstract class DiagramInterfacePlugin {

    /**
     * The plugin's subject track.
     */
    protected track: SubjectTrack;


    /**
     * Creates a new {@link DiagramInterfacePlugin}.
     */
    constructor() {
        this.track = new SubjectTrack();
    }

    
    ///////////////////////////////////////////////////////////////////////////
    //  1. Hover Interactions  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Tests if the plugin can handle a hover event.
     * @param x
     *  The cursor's current x-coordinate.
     * @param y
     *  The cursor's current y-coordinate.
     * @param event
     *  The mouse event.
     * @returns
     *  True if the plugin can handle the event, false otherwise.
     */
    public abstract canHandleHover(x: number, y: number, event: MouseEvent): boolean;

    /**
     * Singles the start of a hover event.
     * @param x
     *  The cursor's current x-coordinate.
     * @param y
     *  The cursor's current y-coordinate.
     * @param event
     *  The mouse event.
     */
    public hoverStart(x: number, y: number, event: MouseEvent): void {
        return this.handleHoverStart(x, y, event);
    }

    /**
     * Hover start logic.
     * @param x
     *  The cursor's current x-coordinate.
     * @param y
     *  The cursor's current y-coordinate.
     * @param event
     *  The mouse event.
     */
    protected abstract handleHoverStart(x: number, y: number, event: MouseEvent): void;


    ///////////////////////////////////////////////////////////////////////////
    //  2. Selection Interactions  ////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    

    /**
     * Tests if the plugin can handle a selection.
     * @param x
     *  The cursor's current x-coordinate.
     * @param y
     *  The cursor's current y-coordinate.
     * @param event
     *  The mouse event.
     * @returns
     *  True if the plugin can handle the event, false otherwise.
     */
    public abstract canHandleSelection(x: number, y: number, event: MouseEvent): boolean;

    /**
     * Signals the start of a selection.
     * @param x
     *  The cursor's current x-coordinate.
     * @param y
     *  The cursor's current y-coordinate.
     * @param event
     *  The mouse event.
     * @returns
     *  True if control should be transferred back to the interface, false
     *  otherwise. If true, subsequent drag events will directly manipulate the
     *  view instead of the plugin's selection (`handleSelectDrag()` and
     *  `handleSelectEnd()` will not be invoked).
     */
    public selectStart(x: number, y: number, event: MouseEvent): boolean {
        this.track.reset(x, y);
        return this.handleSelectStart(event);
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
    public selectDrag(dx: number, dy: number, event: MouseEvent) {
        // Update cursor
        this.track.applyCursorDelta(dx, dy);
        // Handle drag
        this.handleSelectDrag(this.track, event);
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
     * @param event
     *  The mouse event.
     * @returns
     *  True if control should be transferred back to the interface, false
     *  otherwise. If true, subsequent drag events will directly manipulate the
     *  view instead of the plugin's selection (`handleSelectDrag()` and
     *  `handleSelectEnd()` will not be invoked).
     */
    protected abstract handleSelectStart(event: MouseEvent): boolean;

    /**
     * Selection drag logic.
     * @param track
     *  The subject track.
     * @param event
     *  The mouse event.
     */
    protected abstract handleSelectDrag(track: SubjectTrack, event: MouseEvent): void;

    /**
     * Selection end logic.
     * @param event
     *  The mouse event.
     */
    protected abstract handleSelectEnd(event: MouseEvent): void;

}

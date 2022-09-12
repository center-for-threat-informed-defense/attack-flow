export class PointerTracker {

    /**
     * The pointer's total delta-x.
     */
    public deltaX: number;

    /**
     * The pointer's total delta-y.
     */
    public deltaY: number;

    /**
     * The pointer's current delta-x.
     */
    public movementX: number;

    /**
     * The pointer's current delta-y.
     */
    public movementY: number;
    
    /**
     * The drag target.
     */
    public target: HTMLElement | null;

    /**
     * The pointer's origin on the x-axis.
     */
    private _originX: number;

    /**
     * The pointer's origin on the y-axis.
     */
    private _originY: number;

    /**
     * The pointer's last position on the x-axis.
     */
    private _lastX: number;

    /**
     * The pointer's last position on the y-axis.
     */
    private _lastY: number;


    /**
     * Creates a new {@link PointerTracker}.
     */
    constructor() {
        this.deltaX = 0;
        this.deltaY = 0;
        this.movementX = 0;
        this.movementY = 0;
        this.target = null;
        this._originX = 0;
        this._originY = 0;
        this._lastX = 0;
        this._lastY = 0;
    }


    /**
     * Captures the pointer and resets the pointer tracker.
     * @param event
     *  The pointer down event.
     * @param callback
     *  The function to call on pointer movement.
     */
    public capture(event: PointerEvent, callback: (e: PointerEvent, t: PointerTracker) => void) {
        this._originX = event.clientX;
        this._originY = event.clientY;
        this._lastX = this._originX;
        this._lastY = this._originY;
        this.target = event.target as HTMLElement;
        this.target.setPointerCapture(event.pointerId);
        this.target.onpointermove = (e) => {
            this.update(e);
            callback(e, this);
        };
    }

    /**
     * Updates the pointer tracker.
     * @param event
     *  The pointer move event.
     */
    private update(event: PointerEvent) {
        this.deltaX = event.clientX - this._originX;
        this.deltaY = event.clientY - this._originY;
        this.movementX = event.clientX - this._lastX;
        this.movementY = event.clientY - this._lastY;
        this._lastX = event.clientX;
        this._lastY = event.clientY;
    }

    /**
     * Releases the current pointer.
     * @param event
     *  The pointer up event.
     */
    public release(event: PointerEvent) {
        if(this.target !== null) {
            this.target.releasePointerCapture(event.pointerId);
            this.target.onpointermove = null;
            this.target = null;
        }
    }

}

import { EventEmitter, roundNearestMultiple } from "../Utilities";
import { Alignment } from "@OpenChart/DiagramView";
import type { DiagramObjectView } from "@OpenChart/DiagramView";

export abstract class DragHandler<T> extends EventEmitter<{ "interaction": (event: T) => void}> {

    /**
     * The object's current delta-x.
     */
    protected xDelta: number;

    /**
     * The object's current delta-y.
     */
    protected yDelta: number;

    /**
     * The object's origin on the x-axis.
     */
    protected xOrigin: number;

    /**
     * The object's origin on the y-axis.
     */
    protected yOrigin: number;

    /**
     * The object's total delta-x.
     */
    protected xTotalDelta: number;

    /**
     * The object's total delta-y.
     */
    protected yTotalDelta: number;

    /**
     * The cursor's origin on the x-axis.
     */
    private _cx: number;

    /**
     * The cursor's origin on the y-axis.
     */
    private _cy: number;

    /**
     * The cursor's total delta-x.
     */
    private _cdx: number;

    /**
     * The cursor's total delta-y.
     */
    private _cdy: number;

    /**
     * The object's alignment.
     */
    private _alignment: number;

    /**
     * The grid size on the x-axis.
     */
    private _gridX: number;

    /**
     * The grid size on the y-axis.
     */
    private _gridY: number;


    /**
     * Creates a new {@link DiagramObjectMover}.
     * @param gridX
     *  The grid size on the x-axis.
     * @param gridY
     *  The grid size on the y-axis.
     */
    constructor() {
        super();
        this.xDelta = 0;
        this.yDelta = 0;
        this.xOrigin = 0;
        this.yOrigin = 0;
        this.xTotalDelta = 0;
        this.yTotalDelta = 0;
        // this.anchor = undefined;
        // this._cx = 0;
        // this._cy = 0;
        this._cdx = 0;
        this._cdy = 0;
        // this._alignment = Alignment.Free;
        // this._gridX = gridX;
        // this._gridY = gridY;
        // this._anchors = [];
    }

    
    /**
     * Whether the handler can 
     * @param obj
     *  The object to handle.
     */
    public abstract canHandleInteraction(obj: DiagramObjectView): boolean;



    /**
     * Resets the object mover.
     * @param alignment
     *  The new alignment.
     * @param ox
     *  The object's origin on the x-axis.
     * @param oy
     *  The object's origin on the y-axis.
     * @param anchors
     *  The set of anchors to track.
     */
    public dragStart(obj: DiagramObjectView, ox: number, oy: number) {
        this.xDelta = 0;
        this.yDelta = 0;
        this.xOrigin = ox;
        this.yOrigin = oy;
        this.xTotalDelta = 0;
        this.yTotalDelta = 0;
        this.handleDragStart(obj);
    }

    /**
     * Calculates the actual delta from the current delta.
     * @param dx
     *  The current delta-x.
     * @param dy
     *  The current delta-y.
     */
    public drag(dx: number, dy: number) {
        this._cdx += dx;
        this._cdy += dy;
        // Assess position
        
        this.xDelta = this._cdx - this.xTotalDelta;
        this.yDelta = this._cdy - this.yTotalDelta;
        // switch (this._alignment) {
        //     case Alignment.Grid:
        //         this.dx = round(this._cdx, this._gridX) - this.odx;
        //         this.dy = round(this._cdy, this._gridY) - this.ody;
        //         break;
        //     case Alignment.Free:
        //     default:
        //         this.dx = this._cdx - this.odx;
        //         this.dy = this._cdy - this.ody;
        //         break;
        // }
        this.xTotalDelta += this.xDelta;
        this.yTotalDelta += this.yDelta;
        this.handleDrag();
    }

    public dragEnd() {
        this.handleDragEnd();
    }


    /**
     * 
     */
    protected abstract handleDragStart(obj: DiagramObjectView): void;

    protected abstract handleDrag(): void;

    protected abstract handleDragEnd(): void;
    
    

}

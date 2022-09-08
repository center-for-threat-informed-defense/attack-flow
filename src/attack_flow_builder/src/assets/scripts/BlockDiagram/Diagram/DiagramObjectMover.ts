import { round } from "../Utilities";
import { Alignment } from "../Attributes";
import { DiagramAnchorModel } from "../DiagramModelTypes";

export class DiagramObjectMover { 

    /**
     * The object's current delta-x.
     */
    public dx: number;

    /**
     * The object's current delta-y.
     */
    public dy: number;

    /**
     * The object's origin on the x-axis.
     */
    public ox: number;

    /**
     * The object's origin on the y-axis.
     */
    public oy: number;

    /**
     * The object's total delta-x.
     */
    public odx: number;

    /**
     * The object's total delta-y.
     */
    public ody: number;

    /**
     * The anchor the object is currently over.
     */
    public anchor: DiagramAnchorModel | undefined;

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
     * The mover's anchors.
     */
    private _anchors: DiagramAnchorModel[];


    /**
     * Creates a new {@link DiagramObjectMover}.
     * @param gridX
     *  The grid size on the x-axis. 
     * @param gridY
     *  The grid size on the y-axis.
     */
    constructor(gridX: number, gridY: number) {
        this.dx = 0;
        this.dy = 0;
        this.ox = 0;
        this.oy = 0;
        this.odx = 0;
        this.ody = 0;
        this.anchor = undefined;
        this._cx = 0;
        this._cy = 0;
        this._cdx = 0;
        this._cdy = 0;
        this._alignment = Alignment.Free,
        this._gridX = gridX;
        this._gridY = gridY;
        this._anchors = [];
    }

    /**
     * Resets the object mover.
     * @param alignment
     *  The new alignment.
     * @param cy
     *  The cursor's origin on the x-axis.
     * @param cx
     *  The cursor's origin on the y-axis.
     * @param ox
     *  The object's origin on the x-axis.
     * @param oy
     *  The object's origin on the y-axis.
     * @param anchors
     *  The set of anchors to track.
     */
    public reset(
        alignment: number, 
        cx: number, cy: number,
        ox: number, oy: number,
        anchors?: DiagramAnchorModel[]
    ) {
        this.dx = 0;
        this.dy = 0;
        this.ox = ox;
        this.oy = oy;
        this.odx = 0;
        this.ody = 0;
        this.anchor = undefined;
        this._cx = cx;
        this._cy = cy;
        this._cdx = 0;
        this._cdy = 0;
        this._alignment = alignment;
        this._anchors = anchors ?? [];
    }

    /**
     * Calculates the actual delta from the current delta.
     * @param dx
     *  The current delta-x.
     * @param dy
     *  The current delta-y.
     */
    public updateDelta(dx: number, dy: number) {
        this._cdx += dx;
        this._cdy += dy;
        let cursorX = this._cx + this._cdx;
        let cursorY = this._cy + this._cdy;
        // Assess anchors
        let r, ax, ay, bb;
        for(let anchor of this._anchors) {
            bb = anchor.boundingBox;
            r = anchor.radius;
            ax = bb.xMid - cursorX;
            ay = bb.yMid - cursorY;
            if(ax * ax + ay * ay < r * r) {
                this.dx = bb.xMid - (this.ox + this.odx);
                this.dy = bb.yMid - (this.oy + this.ody);
                this.odx += this.dx;
                this.ody += this.dy;
                this.anchor = anchor;
                return;
            }
        }
        // Assess position
        this.anchor = undefined;
        switch(this._alignment) {
            case Alignment.Grid:
                this.dx = round(this._cdx, this._gridX) - this.odx;
                this.dy = round(this._cdy, this._gridY) - this.ody; 
                break;
            case Alignment.Free:
            default:
                this.dx = this._cdx - this.odx;
                this.dy = this._cdy - this.ody;
                break;
        }
        this.odx += this.dx;
        this.ody += this.dy;
    }

}

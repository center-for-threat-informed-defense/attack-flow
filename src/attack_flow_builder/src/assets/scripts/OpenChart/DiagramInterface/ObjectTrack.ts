import { roundNearestMultiple } from "@OpenChart/Utilities";
import type { DiagramObjectView } from "@OpenChart/DiagramView";

export class SubjectTrack {

    /**
     * The cursor's current x-coordinate.
     */
    public xCursor: number;

    /**
     * The cursor's current y-coordinate.
     */
    public yCursor: number;

    /**
     * The cursor's total delta on the x-axis.
     */
    private xCursorDelta: number;

    /**
     * The cursor's total delta on the y-axis.
     */
    private yCursorDelta: number;

    /**
     * The subject's total delta on the x-axis.
     */
    private xSubjectDelta: number;

    /**
     * The subject's total delta on the y-axis.
     */
    private ySubjectDelta: number;


    /**
     * Creates a new {@link SubjectTrack}.
     */
    constructor() {
        this.xCursor = 0;
        this.yCursor = 0;
        this.xCursorDelta = 0;
        this.yCursorDelta = 0;
        this.xSubjectDelta = 0;
        this.ySubjectDelta = 0;
    }


    /**
     * Resets the track.
     * @param x
     *  The cursor's current x-coordinate.
     * @param y
     *  The cursor's current y-coordinate.
     */
    public reset(x: number, y: number) {

    }

    /**
     * Applies the cursor's delta to the track.
     * @param dx
     *  The cursor's current delta-x.
     * @param dy
     *  The cursor's current delta-y.
     */
    public applyCursorDelta(dx: number, dy: number) {
        this.xCursor += dx;
        this.yCursor += dy;
        this.xCursorDelta += dx;
        this.yCursorDelta += dy;
    }

    /**
     * Applies the subject's delta to the track.
     * @param delta
     *  The subject's current [x, y] delta.
     */
    public applyDelta(delta: [number, number]) {
        this.xSubjectDelta += delta[0];
        this.ySubjectDelta += delta[1];
    }

    /**
     * Returns how far the subject has moved since the last track.
     * @returns
     *  The selection's [x, y] delta.
     */
    public getDistance(): [number, number] {
        return [
            this.xCursorDelta - this.xSubjectDelta,
            this.yCursorDelta - this.ySubjectDelta
        ];
    }

    /**
     * Returns how far the selection has moved on a grid since the last track.
     * @param grid
     *  The grid's size.
     * @returns
     *  The selection's [x, y] delta.
     */
    public getDistanceOnGrid(grid: [number, number]): [number, number] {
        return [
            roundNearestMultiple(this.xCursorDelta, grid[0]) - this.xSubjectDelta,
            roundNearestMultiple(this.yCursorDelta, grid[1]) - this.ySubjectDelta
        ];
    }

    /**
     * Returns how far the selection has moved onto an object.
     * @param obj
     *  The object.
     * @returns
     *  The selection's [x, y] delta.
     */
    public getDistanceOntoObject(obj: DiagramObjectView, obj1: DiagramObjectView): [number, number] {
        // TODO: Document
        return [
            obj.x - obj1.x,
            obj.y - obj1.y
        ];
    }

}

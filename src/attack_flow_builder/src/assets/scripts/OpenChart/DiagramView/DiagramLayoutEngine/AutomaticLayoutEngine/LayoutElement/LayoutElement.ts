import { PivotPoint } from "./PivotPoint";
import { BoundingBox } from "../../../DiagramObjectView";
import type { LayoutBox } from "./LayoutBox";

export abstract class LayoutElement {

    /**
     * Whether or not the element should be the primary focus of its parent.
     */
    public isFocal: boolean;

    /**
     * The element's parent box.
     */
    public parent: LayoutBox | null;
    
    /**
     * The box's unique identifier.
     */
    public readonly id: string;

    /**
     * The box's bounding region.
     */
    public boundingBox: BoundingBox;


    /**
     * The box's root layout.
     */
    public abstract get root(): LayoutElement | null;

    /**
     * The box's width.
     */
    public get width(): number {
        return this.boundingBox.width;
    }

    /**
     * The box's width.
     */
    public get height(): number {
        return this.boundingBox.height;
    }

    /**
     * The box's x-coordinate.
     */
    public get x(): number {
        return this.boundingBox.x;
    }

    /**
     * The box's y-coordinate.
     */
    public get y(): number {
        return this.boundingBox.y;
    }


    /**
     * Creates a new {@link LayoutElement}.
     * @param id
     *  The element's id.
     */
    constructor(id: string) {
        this.id = id;
        this.parent = null;
        this.boundingBox = new BoundingBox();
        this.isFocal = false;
    }


    /**
     * Moves the element to the specified coordinate.
     * @param x
     *  The x coordinate.
     * @param y
     *  The y coordinate.
     * @param point
     *  TODO: Document
     */
    public moveTo(x: number, y: number, point: number = PivotPoint.Middle) {
        // Resolve x-offset
        if(PivotPoint.isLeftAligned(point)) {
            x += this.width / 2; 
        } else if(PivotPoint.isRightAligned(point)) {
            x -= this.width / 2;
        }
        // Resolve y-offset
        if(PivotPoint.isTopAligned(point)) {
            y += this.height / 2;
        } else if(PivotPoint.isBottomAligned(point)) {
            y -= this.height / 2;
        }
        // Move object
        const dx = x - this.boundingBox.xMid;
        const dy = y - this.boundingBox.yMid;
        // Move box
        this.moveBy(dx, dy);
    }

    /**
     * Moves the element relative to its current position.
     * @param dx
     *  The change in x.
     * @param dy
     *  The change in y.
     */
    public moveBy(dx: number, dy: number) {
        this.boundingBox.moveBy(dx, dy);
    }
    
}

import { LayoutNode } from "../LayoutNode";
import { PivotPoint } from "../PivotPoint";
import { LayoutElement } from "../LayoutElement";
import { LayoutDirectionMask, LayoutRoleMask } from "./LayoutAttributes";

export class LayoutBox extends LayoutElement {

    /**
     * The delimiter used by the box's fully-qualified name.
     */
    public static NamespaceDelimiter = ".";

    /**
     * The box's attributes.
     */
    public readonly attrs: number;

    /**
     * The box's list of elements.
     */
    protected readonly _elements: LayoutElement[];


    /**
     * The box's root.
     */
    public get root(): LayoutBox {
        return this.parent?.root ?? this;
    }
    
    /**
     * The box's first element.
     */
    public get first(): LayoutElement | undefined {
        return this._elements[0];
    }

    /**
     * The box's last element.
     */
    public get last(): LayoutElement | undefined {
        return this._elements[this._elements.length - 1];
    }

    /**
     * The box's list of elements.
     */
    public get elements(): ReadonlyArray<LayoutElement> {
        return this._elements;
    }


    /**
     * The box's fully-qualified name.
     */
    public get fqn(): string {
        if(this.parent) {
            const d = LayoutBox.NamespaceDelimiter;
            return `${this.parent.fqn}${d}${this.id}`;
        } else {
            return this.id;
        }
    }

    /**
     * The box's role.
     */
    public get role(): number {
        return this.attrs & LayoutRoleMask;
    }

    /**
     * The box's flow direction.
     */
    public get flow(): number {
        return this.attrs & LayoutDirectionMask;
    }


    /**
     * Creates a new {@link LayoutBox}.
     * @param id
     *  The box's unique identifier.
     * @param attrs
     *  The box's attributes.
     * @param elements
     *  The box's elements.
     */
    constructor(id: string, attrs: number, ...elements: (LayoutElement)[]) {
        super(id);
        // Set state
        this.attrs = attrs;
        this._elements = [];
        // Add elements
        for(const el of elements) {
            this.add(el);
        }
    }

    
    ///////////////////////////////////////////////////////////////////////////
    //  1. Elements  //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Adds an element to the layout box.
     * @param element
     *  The element. 
     */
    public add(element: LayoutElement) {
        // Remove element from existing box
        if(element.parent) {
            element.parent.remove(element);
        }
        // Add element to box
        this._elements.push(element);
        element.parent = this;
    }

    /**
     * Removes an element from the layout box.
     * @param element
     *  The element.
     */
    public remove(element: LayoutElement) {
        const idx = this._elements.indexOf(element);
        if(idx !== -1) {
            this._elements[idx].parent = null;
            this._elements.splice(idx, 1);
        }
    }

    /**
     * Swaps an element in the layout box with a different layout element.
     * @param element
     *  The existing element.
     * @param newElement
     *  The new element.
     */
    public swap(element: LayoutElement, newElement: LayoutElement) {
        const idx = this._elements.indexOf(element);
        if(idx !== -1) {
            this._elements[idx].parent = null;
            this._elements.splice(idx, 1, newElement);
            newElement.parent = this;
        }
    }

    /**
     * Sorts the box's elements according to the specified comparison function.
     * @param compare
     *  The comparison function.
     */
    public sort(compare: (a: LayoutElement, b: LayoutElement) => number) {
        this._elements.sort(compare);
    }

    
    ///////////////////////////////////////////////////////////////////////////
    //  2. Movement & Layout  /////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    

    /**
     * Moves the bounding box to the specified coordinate.
     * @param x
     *  The x coordinate.
     * @param y
     *  The y coordinate.
     * @param point
     *  TODO: Document
     */
    public moveTo(x: number, y: number, point: number = PivotPoint.Middle) {
        const { xMin, yMin, xMax, yMax } = this.boundingBox;
        // Resolve x-offset
        if(PivotPoint.isLeftAligned(point)) {
            x += this.boundingBox.x - xMin; 
        } else if(PivotPoint.isRightAligned(point)) {
            x -= xMax - this.boundingBox.x;
        }
        // Resolve y-offset
        if(PivotPoint.isTopAligned(point)) {
            y += this.boundingBox.y - yMin;
        } else if(PivotPoint.isBottomAligned(point)) {
            y -= yMax - this.boundingBox.y;
        }
        // Move object
        const dx = x - this.boundingBox.x;
        const dy = y - this.boundingBox.y;
        // Move box
        this.moveBy(dx, dy);
    }

    /**
     * Moves the bounding box relative to its current position.
     * @param dx
     *  The change in x.
     * @param dy
     *  The change in y.
     */
    public moveBy(dx: number, dy: number) {
        for(const box of this.elements) {
            box.moveBy(dx, dy);
        }
        this.boundingBox.moveBy(dx, dy);
    }

    /**
     * Recomputes the box's bounding region around its elements.
     */
    public recomputeBoundingRegion() {
        // Recompute bounding box enclosure
        this.boundingBox.setEnclosure(this._elements.map(e => e.boundingBox));
        // Calculate focal point
        let x = 0, y = 0, count = 0;
        for(const el of this.elements) {
            if(!el.isFocal) {
                continue;
            }
            x += el.boundingBox.xMid;
            y += el.boundingBox.yMid;
            count++;
        }
        x /= count;
        y /= count;
        // If there's a focal point...
        if(count) {
            // ...use it.
            this.boundingBox.x = x;
            this.boundingBox.y = y;
        }
        // If there's only one element...
        else if(this.elements.length === 1) {
            // ...inherit its focal point.
            this.boundingBox.x = this.elements[0].x;
            this.boundingBox.y = this.elements[0].y;
        } 
        // Otherwise...
        else {
            // ...use region's midpoint.
            this.boundingBox.x = this.boundingBox.xMid;
            this.boundingBox.y = this.boundingBox.yMid;
        }
    }

}

import type { GraphNode } from "../GraphTypes";

export class LayoutBox {

    /**
     * The box's parent box.
     */
    public parent: LayoutBox | null;

    /**
     * The box's list of elements.
     */
    protected _elements: (LayoutBox | GraphNode)[];


    /**
     * The box's root layout.
     * @returns
     */
    public get rootLayout(): LayoutBox | null {
        return this.parent?.rootLayout ?? null;
    }


    /**
     * The box's list of elements.
     */
    public get elements(): ReadonlyArray<LayoutBox | GraphNode> {
        return this._elements;
    }


    /**
     * Creates a new {@link LayoutBox}.
     * @param elements
     *  The box's elements.
     */
    constructor(...elements: (LayoutBox | GraphNode)[]) {
        this.parent = null;
        this._elements = [];
    }


    /**
     * Adds an element to the layout box.
     * @param element
     *  The element.
     */
    public add(element: LayoutBox | GraphNode) {
        this._elements.push(element);
    }

}

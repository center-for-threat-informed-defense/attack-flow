import { DiagramFace } from "../DiagramFace";
import { findUnlinkedObjectAt } from "../../ViewLocators";
import type { ViewportRegion } from "../../ViewportRegion";
import type { BlockView, DiagramObjectView } from "../../Views";

export abstract class BlockFace extends DiagramFace {

    /**
     * The face's content hash.
     */
    public contentHash: number | undefined;

    /**
     * The face's x-offset from the top-left corner of the bounding box.
     */
    public xOffset: number;

    /**
     * The face's y-offset from the top-left corner of the bounding box.
     */
    public yOffset: number;

    /**
     * The face's width.
     */
    public width: number;

    /**
     * The face's height.
     */
    public height: number;
    
    /**
     * The block's base grid.
     */
    protected readonly grid: [number, number];

    /**
     * The block's scale.
     */
    protected readonly scale: number;

    /**
     * The face's view.
     */
    declare protected view: BlockView;


    /**
     * The block's grid.
     */
    protected get blockGrid(): [number, number] {
        return [
            this.grid[0] * this.scale,
            this.grid[1] * this.scale
        ];
    }


    /**
     * Creates a new {@link BlockFace}.
     * @param grid
     *  The block's base grid.
     * @param scale
     *  The block's scale.
     */
    constructor(grid: [number, number], scale: number) {
        super();
        this.xOffset = 0;
        this.yOffset = 0;
        this.width = 0;
        this.height = 0;
        this.grid = grid;
        this.scale = scale;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Selection  /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns the topmost view at the specified coordinate.
     * @param x
     *  The x coordinate.
     * @param y
     *  The y coordinate.
     * @returns
     *  The topmost view, undefined if there isn't one.
     */
    public getObjectAt(x: number, y: number): DiagramObjectView | undefined {
        if (this.boundingBox.contains(x,y)) {
            // Try anchors
            const object = findUnlinkedObjectAt(
                [...this.view.anchors.values()], x, y
            );
            if (object) {
                return object;
            }
            // Return block
            return this.view;
        } else {
            return undefined;
        }
    }
    

    ///////////////////////////////////////////////////////////////////////////
    //  2. Movement  //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Sets the face's position relative to its current position.
     * @param dx
     *  The change in x.
     * @param dy
     *  The change in y.
     */
    public moveBy(dx: number, dy: number): void {
        // Move self
        this.boundingBox.x += dx;
        this.boundingBox.y += dy;
        this.boundingBox.xMin += dx;
        this.boundingBox.xMax += dx;
        this.boundingBox.yMin += dy;
        this.boundingBox.yMax += dy;
        // Move children
        for (const anchor of this.view.anchors.values()) {
            anchor.face.moveBy(dx, dy);
        }
        // Recalculate layout
        this.calculateLayout();
    }


    ///////////////////////////////////////////////////////////////////////////
    //  3. Layout / Rendering  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Calculates the face's layout.
     * @returns
     *  True if the layout changed, false otherwise.
     */
    public calculateLayout(): boolean {
        this.calculateBoundingBoxFromViews(this.view.anchors.values());
        return true;
    }
    
    /**
     * Renders the face's debug information to a context.
     * @param ctx
     *  The context to render to.
     * @param region
     *  The context's viewport.
     * @returns
     *  True if the view is visible, false otherwise.
     */
    public renderDebugTo(ctx: CanvasRenderingContext2D, region: ViewportRegion): boolean {
        const isRendered = super.renderDebugTo(ctx, region);
        if (isRendered) {
            for(const anchor of this.view.anchors.values()) {
                anchor.renderDebugTo(ctx, region);
            }
        }
        return isRendered;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  4. Cloning  ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns a clone of the face.
     * @returns
     *  A clone of the face.
     */
    public abstract clone(): BlockFace; 

}

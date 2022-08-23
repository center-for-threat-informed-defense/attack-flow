import { RasterCache } from "../../RasterCache";
import { DiagramObjectView } from "./DiagramObjectView";
import { DiagramAnchorModel } from "../../ModelTypes/BaseTypes/DiagramAnchorModel";

export abstract class DiagramAnchorView extends DiagramObjectView {

    /**
     * The underlying model.
     */
    public override el: DiagramAnchorModel;


    /**
     * Creates a new {@link DiagramAnchorView}.
     * @param el
     *  The underlying model.
     * @param rasterCache
     *  The view's raster cache.
     */
    constructor(el: DiagramAnchorModel, rasterCache: RasterCache) {
        super(el, rasterCache);
        this.el = el;
    }

    
    ///////////////////////////////////////////////////////////////////////////
    //  1. Movement  //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    
    /**
     * Moves the object relative to its current position. 
     * @param x
     *  The change in x.
     * @param y 
     *  The change in y.
     */
    public override moveBy(x: number, y: number) {
        // Move self
        this.x += x;
        this.y += y;
        // Move anchored children
        for(let obj of this.children) {
            if(!obj.el.isAnchored()) {
                console.warn(`View object '${ 
                    obj.el.id 
                }' joined to anchor '${ 
                    this.el.id
                }' without 'Movement.Anchored' attribute.`);
                continue;
            }
            let deltaX = this.x - obj.x;
            let deltaY = this.y - obj.y;
            obj.moveBy(deltaX, deltaY);
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Model Synchronization  /////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Synchronizes the view with the underlying model.
     * 
     * NOTE:
     * Anchors simply reference other objects in the tree. Anchors cannot spawn
     * view objects on behalf of their children. Instead, the root of the tree
     * will ensure that each anchor receives a reference to their children. Due
     * to this limitation, anchor linkage cannot be updated independently.
     * 
     */
    public override updateView(): void {
        // Update position
        this.x = this.el.boundingBox.xMid;
        this.y = this.el.boundingBox.yMid;
    }

}

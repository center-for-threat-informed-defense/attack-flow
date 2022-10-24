import { RasterCache } from "../DiagramElement/RasterCache";
import { LineVerticalElbowView } from "../DiagramViewTypes";
import { getLineHitbox, isInsideRegion } from "../Utilities";
import {
    DiagramLineModel,
    DiagramObjectModel,
    LayoutUpdateReason,
    LineEndingPointModel,
    LineHandlePointModel
} from ".";
import {
    DiagramFactory,
    DiagramObjectValues,
    LineVerticalElbowTemplate
} from "../DiagramFactory";
import { Cursor } from "../Attributes";

export class LineVerticalElbowModel extends DiagramLineModel {
    
    /**
     * The template the object was configured with.
     */
    public override readonly template: LineVerticalElbowTemplate;

    /**
     * The line's hitboxes.
     *  [0] = The 1st vertical segment's hitbox.
     *  [1] = The horizontal segment's hitbox.
     *  [2] = The 2nd vertical segment's hitbox.
     */
    public readonly hitboxes: number[][];


    /**
     * Creates a new {@link LineVerticalElbowModel}.
     * @param factory
     *  The line's diagram factory.
     * @param template
     *  The line's template.
     * @param values
     *  The line's values.
     */
     constructor(
        factory: DiagramFactory, 
        template: LineVerticalElbowTemplate,
        values?: DiagramObjectValues
    ) {
        super(factory, template, values);
        this.hitboxes = [[],[],[]];
        this.setCursor(Cursor.Move);
        // Template configuration
        this.setSemanticRole(template.role);
        this.template = template;
        // Define children 
        if(!this.children.length) {
            let x = this.boundingBox.xMid;
            let y = this.boundingBox.yMid;
            // Define Caps and Handles
            let src = template.line_ending_template.source;
            let han = template.line_handle_template;
            let trg = template.line_ending_template.target;
            this.addChild(factory.createObject(src) as LineEndingPointModel, 0, false);
            this.addChild(factory.createObject(han) as LineHandlePointModel, 1, false);
            this.addChild(factory.createObject(trg) as LineEndingPointModel, 2, false);
            // Define position
            for(let obj of this.children) {
                obj.moveTo(x, y);
            }
            this.children[0].moveBy(-50, 100);
            this.children[2].moveBy(50, -100);
        }        
        // Update layout
        this.updateLayout(LayoutUpdateReason.Initialization);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Selection  /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    

    /**
     * Returns the topmost object at the given coordinate.
     * @param x
     *  The x coordinate.
     * @param y
     *  The y coordinate.
     * @returns
     *  The topmost object, undefined if there isn't one.
     */
    public override getObjectAt(x: number, y: number): DiagramObjectModel | undefined {
        if(this.isAnchored()) {
            // Try points
            let obj = super.getObjectAt(x, y);
            if(obj) {
                return obj;
            }
            // Try segments
            for(let i = 0; i < this.hitboxes.length; i++) {
                if(!isInsideRegion(x, y, this.hitboxes[i]))
                    continue;
                if(i === 1) {
                    return this.children[i];
                } else {
                    return this;
                }
            }
        } else {
            if(this.isSelected()) {
                // Try points
                let obj = super.getObjectAt(x, y);
                if(obj) {
                    return obj;
                }
            }
            // Try segments
            for(let hitbox of this.hitboxes) {
                if(isInsideRegion(x, y, hitbox)) {
                    return this;
                }
            }
        }
        return undefined;
    }   


    ///////////////////////////////////////////////////////////////////////////
    //  2. Movement  //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Moves one of the line's children relative to its current position. 
     * @param id
     *  The id of the child.
     * @param dx
     *  The change in x.
     * @param dy
     *  The change in y.
     * @param updateParent
     *  If the parent's layout should be updated.
     *  (Default: true)
     */
    public moveChild(id: string, dx: number, dy: number, updateParent: boolean = true) {
        // Select child
        let obj = this.children.find(o => o.id === id)!;
        if(!obj)
            return;
        // Move ending
        if(obj instanceof LineEndingPointModel) {
            obj.moveBy(dx, dy, updateParent, true);
        }
        // Move handle
        let [e1, h1, e2] = this.children;
        let e1x = e1.boundingBox.xMid,
            e1y = e1.boundingBox.yMid,
            e2x = e2.boundingBox.xMid,
            e2y = e2.boundingBox.yMid,
            h1x = h1.boundingBox.xMid,
            h2y = h1.boundingBox.yMid,
            hdx = ((e1x + e2x) / 2) - h1x,
            hdy = ((e1y + e2y) / 2) - h2y;
        if(!h1.hasUserSetPosition()) {
            h1.moveBy(0, hdy, updateParent, true);
        } else if(obj === h1) {
            h1.moveBy(0, dy, updateParent, true);
        }
        h1.moveBy(hdx, 0, updateParent, true);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  3. Layout & View  /////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    

    /**
     * Updates the line's alignment, cursor, bounding box, and hitbox.
     * @param reasons
     *  The reasons the layout was updated.
     * @param updateParent
     *  If the parent's layout should be updated.
     *  (Default: true)
     */
    public override updateLayout(reasons: number, updateParent: boolean = true) {
        let [e1, h1, e2] = this.children.map(o => o.boundingBox);
        // Update hitboxes
        let w = this.hitboxWidth;
        this.hitboxes[0] = getLineHitbox(e1.xMid, e1.yMid, e1.xMid, h1.yMid, w);
        this.hitboxes[1] = getLineHitbox(e1.xMid, h1.yMid, e2.xMid, h1.yMid, w);
        this.hitboxes[2] = getLineHitbox(e2.xMid, h1.yMid, e2.xMid, e2.yMid, w);
        // Update cursor
        this.children[1].setCursor(Cursor.Row_Resize);
        // Update bounding box
        super.updateLayout(reasons, updateParent);
    }

    /**
     * Returns this object wrapped inside a view object.
     *  @param cache
     *   The view's raster cache.
     *  @returns
     *   This object wrapped inside a view object.
     */
    public createView(cache: RasterCache): LineVerticalElbowView {
        return new LineVerticalElbowView(this, cache);
    }

}

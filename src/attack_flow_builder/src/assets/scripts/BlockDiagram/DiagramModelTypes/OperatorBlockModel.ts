import { computeHash } from "../Utilities";
import { RasterCache } from "../Diagram/RasterCache";
import { OperatorBlockView } from "../DiagramViewTypes";
import {
    AnchorPointModel,
    DiagramObjectModel,
    LayoutUpdateReason
} from ".";
import {
    AnchorAngle,
    DiagramFactory,
    DiagramObjectValues,
    OperatorBlockStyle,
    OperatorBlockTemplate
} from "../DiagramFactory";
import { Alignment, Cursor, InheritAlignment } from "../Attributes";

export class OperatorBlockModel extends DiagramObjectModel {

    /**
     * The template the object was configured with.
     */
    public override readonly template: OperatorBlockTemplate;

    /**
     * The block's style.
     */
    public readonly style: OperatorBlockStyle

    /**
     * The block's render layout.
     */
    public layout: OperatorBlockRenderLayout;


    /**
     * Creates a new {@link DictionaryBlockModel}.
     * @param factory
     *  The block's diagram factory.
     * @param template
     *  The block's template.
     * @param values
     *  The block's values.
     */
    constructor(
        factory: DiagramFactory, 
        template: OperatorBlockTemplate, 
        values?: DiagramObjectValues
    ) {
        super(factory, template, values);
        this.setInheritAlignment(InheritAlignment.False);
        this.setAlignment(Alignment.Grid);
        this.setCursor(Cursor.Move);
        this.layout = {} as any;
        // Template configuration
        this.setSemanticRole(template.role);
        this.template = template;
        this.style = template.style;
        
        // TODO: Remove. Just include until all files have updated
        if(this.children.length === 3) {
            let t = template.anchor_template;
            let a = factory.createObject(t) as AnchorPointModel;
            a.angle = AnchorAngle.DEG_90;
            let b = factory.createObject(t) as AnchorPointModel;
            b.angle = AnchorAngle.DEG_90;
            let c = factory.createObject(t) as AnchorPointModel;
            c.angle = AnchorAngle.DEG_90;   
            // Remove existing children
            let o = [];
            for(let child of [...this.children]) {
                o.push(child);
                this.removeChild(child.id, false, false);
            }
            // Add new children
            let n = [a, o[0], b, o[1], c, o[2]];
            console.log(n);
            for(let i = 0; i < n.length; i++) {
                this.addChild(n[i], i, false);
            }
        }
        
        // Anchor configuration
        if(!this.children.length) {
            let t = template.anchor_template;
            for(let i = 0, anchor; i < 6; i++) {
                anchor = factory.createObject(t) as AnchorPointModel;
                anchor.angle = AnchorAngle.DEG_90;
                this.addChild(anchor, i, false);
            }
        }
        // Update Layout
        this.updateLayout(LayoutUpdateReason.ObjectInit);
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
        // Try anchors
        let obj = super.getObjectAt(x, y);
        if(obj) {
            return obj;
        }
        // Try object
        let bb = this.boundingBox;
        if(
            bb.xMin <= x && x <= bb.xMax &&
            bb.yMin <= y && y <= bb.yMax  
        ) {
            return this;
        } else {
            return undefined;
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Layout & View  /////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Updates the block's bounding box and render layout.
     * @param reasons
     *  The reasons the layout was updated. 
     * @param updateParent
     *  If the parent's layout should be updated.
     *  (Default: true)
     */
    public override updateLayout(reasons: number, updateParent: boolean = true) {
        let contentHash = computeHash(this.template.text);

        // Update layout (if content has changed)
        if(this.layout.contentHash !== contentHash) {

            let { 
                text,
                vertical_padding: vp,
                horizontal_padding: hp
            } = this.style;
            let strokeWidth = 1;

            // Calculate text
            let m = text.font.measure(this.template.text);
            let textFont = {
                x: strokeWidth + hp,
                y: strokeWidth + vp + m.ascent,
                t: this.template.text
            }

            // Calculate block's size
            let width  = (hp * 2) + m.width;
            let height = (vp * 2) + m.ascent + m.descent;

            // Calculate block's bounding box
            let bb = this.boundingBox;
            let xMin = Math.round(bb.xMid - (width / 2));
            let yMin = Math.round(bb.yMid - (height / 2));
            let xMax = Math.round(bb.xMid + (width / 2));
            let yMax = Math.round(bb.yMid + (height / 2));

            // Update anchors
            let xo = (bb.xMid - xMin) / 2;
            let anchors = [
                bb.xMid - xo, yMin,
                bb.xMid, yMin,
                bb.xMid + xo, yMin,
                bb.xMid + xo, yMax,
                bb.xMid, yMax,
                bb.xMid - xo, yMax,
            ]
            for(let i = 0; i < anchors.length; i += 2) {
                this.children[i / 2].moveTo(anchors[i], anchors[i + 1], false);
            }

            // Update object's bounding box
            super.updateLayout(reasons, false);

            // Force object's bounding width
            bb.xMin = xMin;
            bb.xMax = xMax;
            bb.xMid = Math.floor((bb.xMin + bb.xMax) / 2);

            // Update layout
            this.layout = {
                contentHash,
                dx: xMin - bb.xMin,
                dy: yMin - bb.yMin,
                width,
                height,
                textFont
            };

        }

        // Update parent
        if(updateParent) {
            this.parent?.updateLayout(reasons);
        }
        
    }

    /**
     * Returns this object wrapped inside a view object.
     *  @param cache
     *   The view's raster cache.
     *  @returns
     *   This object wrapped inside a view object.
     */
    public override createView(cache: RasterCache): OperatorBlockView {
        return new OperatorBlockView(this, cache);
    }

}


///////////////////////////////////////////////////////////////////////////////
//  Internal Types  ///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


type OperatorBlockRenderLayout = {
    
    /**
     * The layout's content hash.
     */
    contentHash: number
    
    /**
     * The block's x offset from the top-left corner of the bounding box.
     */
    dx: number;

    /**
     * The block's y offset from the top-left corner of the bounding box.
     */
    dy: number;

    /**
     * The block's width.
     */
    width: number,

    /**
     * The blocks's height.
     */
    height: number,

    /**
     * Text placements with the title font.
     */
    textFont: TextPlacement,

}

type TextPlacement = { 
    
    /**
     * The x-axis coordinate relative to the top-left coordinate of the block.
     */
    x: number,

    /**
     * The y-axis coordinate relative to the top-left coordinate of the block.
     */
    y: number,

    /**
     * The text.
     */
    t: string

}

import { computeHash } from "../Utilities";
import { RasterCache } from "../DiagramElement";
import { TextBlockView } from "../DiagramViewTypes";
import {
    AnchorPointModel,
    DiagramObjectModel,
    LayoutUpdateReason
} from ".";
import {
    AnchorAngle,
    DiagramFactory
} from "../DiagramFactory";
import {
    Alignment,
    Cursor,
    InheritAlignment
} from "../Attributes";
import type {
    DiagramObjectValues,
    TextBlockStyle,
    TextBlockTemplate
} from "../DiagramFactory";

export class TextBlockModel extends DiagramObjectModel {

    /**
     * The template the object was configured with.
     */
    public override readonly template: TextBlockTemplate;

    /**
     * The block's style.
     */
    public readonly style: TextBlockStyle;

    /**
     * The block's render layout.
     */
    public layout: TextBlockRenderLayout;


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
        template: TextBlockTemplate,
        values?: DiagramObjectValues
    ) {
        super(factory, template, values);
        this.setInheritAlignment(InheritAlignment.False);
        this.setAlignment(Alignment.Grid);
        this.setCursor(Cursor.Move);
        this.layout = {} as TextBlockRenderLayout;
        // Template configuration
        this.setSemanticRole(template.role);
        this.template = template;
        this.style = template.style;
        // Anchor configuration
        if (!this.children.length) {
            const t = template.anchor_template;
            const a = [AnchorAngle.DEG_90, AnchorAngle.DEG_0];
            for (let i = 0, anchor; i < 12; i++) {
                anchor = factory.createObject(t) as AnchorPointModel;
                anchor.angle = a[Math.floor(i / 3) % 2];
                this.addChild(anchor, i, false);
            }
        }
        // Property configuration
        this.props.onUpdate(() => {
            this.updateLayout(LayoutUpdateReason.PropUpdate);
        });
        // Update Layout
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
        // Try anchors
        const obj = super.getObjectAt(x, y);
        if (obj) {
            return obj;
        }
        // Try object
        const bb = this.boundingBox;
        if (
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
        const contentHash = computeHash(this.props.toString());
        const contentChanged = this.layout.contentHash !== contentHash;
        const fullLayoutRequired = reasons & LayoutUpdateReason.Initialization;

        // Update layout
        if (fullLayoutRequired || contentChanged)  {

            const {
                max_width,
                text: t,
                vertical_padding: vp,
                horizontal_padding: hp
            } = this.style;
            const strokeWidth = 1;

            // Calculate text
            const text = [];
            const lines = t.font.wordWrap(this.props.toString(), max_width);
            let m = t.font.measure(lines[0]);
            let w = m.width;
            let x = strokeWidth + hp;
            let y = strokeWidth + vp + m.ascent;
            text.push({ x, y, t: lines[0] });
            for (let i = 1; i < lines.length; i++) {
                m = t.font.measure(lines[i]);
                w = Math.max(w, m.width);
                y += t.line_height;
                text.push({ x, y, t: lines[i] });
            }
            y += vp + strokeWidth;
            x += w + x;

            // Calculate block's size
            const width = Math.round(x);
            const height = Math.round(y);

            // Calculate block's bounding box
            const bb = this.boundingBox;
            const xMin = Math.round(bb.xMid - (width / 2));
            const yMin = Math.round(bb.yMid - (height / 2));
            const xMax = Math.round(bb.xMid + (width / 2));
            const yMax = Math.round(bb.yMid + (height / 2));

            // Update anchors
            const xo = (bb.xMid - xMin) / 2;
            const yo = (bb.yMid - yMin) / 2;
            const anchors = [
                bb.xMid - xo, yMin,
                bb.xMid, yMin,
                bb.xMid + xo, yMin,
                xMax, bb.yMid - yo,
                xMax, bb.yMid,
                xMax, bb.yMid + yo,
                bb.xMid + xo, yMax,
                bb.xMid, yMax,
                bb.xMid - xo, yMax,
                xMin, bb.yMid + yo,
                xMin, bb.yMid,
                xMin, bb.yMid - yo
            ];
            for (let i = 0; i < anchors.length; i += 2) {
                this.children[i / 2].moveTo(anchors[i], anchors[i + 1], false);
            }

            // Update object's bounding box
            super.updateLayout(reasons, false);

            // Update layout
            this.layout = {
                contentHash,
                dx: xMin - bb.xMin,
                dy: yMin - bb.yMin,
                width,
                height,
                text
            };

        }

        // Update parent
        if (updateParent) {
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
    public override createView(cache: RasterCache): TextBlockView {
        return new TextBlockView(this, cache);
    }

}


///////////////////////////////////////////////////////////////////////////////
//  Internal Types  ///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


type TextBlockRenderLayout = {

    /**
     * The layout's content hash.
     */
    contentHash: number;

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
    width: number;

    /**
     * The blocks's height.
     */
    height: number;

    /**
     * The text to draw.
     */
    text: TextPlacement[];

};

type TextPlacement = {

    /**
     * The x-axis coordinate relative to the top-left coordinate of the block.
     */
    x: number;

    /**
     * The y-axis coordinate relative to the top-left coordinate of the block.
     */
    y: number;

    /**
     * The text.
     */
    t: string;

};

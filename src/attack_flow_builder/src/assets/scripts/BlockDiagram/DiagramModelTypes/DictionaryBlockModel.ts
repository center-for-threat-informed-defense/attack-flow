import { computeHash } from "../Utilities";
import { RasterCache } from "../Diagram/RasterCache";
import { DictionaryBlockView } from "../DiagramViewTypes";
import {
    AnchorPointModel,
    DiagramObjectModel,
    LayoutUpdateReason
} from ".";
import {
    AnchorAngle,
    DiagramFactory,
    DiagramObjectValues,
    DictionaryBlockStyle,
    DictionaryBlockTemplate
} from "../DiagramFactory";
import { Alignment, Cursor, InheritAlignment } from "../Attributes";

export class DictionaryBlockModel extends DiagramObjectModel {

    /**
     * The template the object was configured with.
     */
    public override readonly template: DictionaryBlockTemplate;

    /**
     * The block's style.
     */
    public readonly style: DictionaryBlockStyle

    /**
     * The block's render layout.
     */
    public layout: DictionaryBlockRenderLayout;


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
        template: DictionaryBlockTemplate, 
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
        // Anchor configuration
        if(!this.children.length) {
            let t = template.anchor_template;
            let a = [AnchorAngle.DEG_90, AnchorAngle.DEG_0];
            for(let i = 0, anchor; i < 12; i++) {
                anchor = factory.createObject(t) as AnchorPointModel;
                anchor.angle = a[Math.floor(i / 3) % 2];
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
        let contentHash = this.props.getHash();

        // Update layout (if content has changed)
        if(this.layout.contentHash !== contentHash) {

            let { max_width, head, body, horizontal_padding } = this.style;
            let tf = head.title;
            let sbf = head.subtitle;
            let fnf = body.field_name;
            let fvf = body.field_value;
            let strokeWidth = 1;
            let titleFont: TextPlacement[] = [];
            let subtitleFont: TextPlacement[] = [];
            let fieldNameFont: TextPlacement[] = [];
            let fieldValueFont: TextPlacement[] = [];
            
            // Configure title and subtitle
            let tk = this.template.title_key;
            let prop = this.props.value.get(tk);
            let titleText = this.template.id.toLocaleUpperCase();
            let subtitleText = prop?.toString() ?? `Unknown key: '${ tk }'`;
            
            // Calculate max width
            let mw = max_width;
            mw = Math.max(mw, head.title.font.measureWidth(titleText));
            for(let key of this.props.value.keys()) {
                mw = Math.max(mw, body.field_name.font.measureWidth(key));
            }

            // Calculate text
            let m = null;
            let w = 0;
            let x = strokeWidth + horizontal_padding;
            let y = strokeWidth + head.vertical_padding;
            
            // Calculate title text
            m = tf.font.measure(titleText);
            w = Math.max(w, m.width);
            y += m.ascent;
            titleFont.push({ x, y, t: titleText });
            y += m.descent + head.title.padding;
            
            // Calculate subtitle text
            let lines = sbf.font.wordWrap(subtitleText, mw);
            m = sbf.font.measure(lines[0]);
            w = Math.max(w, m.width);
            y += m.ascent;
            subtitleFont.push({ x, y, t: lines[0] });
            for(let i = 1; i < lines.length; i++) {
                m = sbf.font.measure(lines[i]);
                w = Math.max(w, m.width);
                y += sbf.lineHeight;
                subtitleFont.push({ x, y, t: lines[i] });
            }
            y += head.vertical_padding + strokeWidth;

            let headHeight = Math.round(y);

            // Calculate fields
            y += body.vertical_padding;
            for(let [key, value] of this.props.value) {

                // Ignore title key
                if(key === this.template.title_key)
                    continue;
                key = key.toLocaleUpperCase();
                
                // Calculate field name text
                m = fnf.font.measure(key);
                w = Math.max(w, m.width);
                y += m.ascent;
                fieldNameFont.push({ x, y, t: key });
                y += m.descent + body.field_name.padding;
                
                // Calculate field value text
                let lines = fvf.font.wordWrap(`${ value.toString() }`, mw);
                m = fvf.font.measure(lines[0]);
                w = Math.max(w, m.width);
                y += m.ascent;
                fieldValueFont.push({ x, y, t: lines[0] });
                for(let i = 1; i < lines.length; i++) {
                    m = fvf.font.measure(lines[i]);
                    w = Math.max(w, m.width);
                    y += fvf.line_height;
                    fieldValueFont.push({ x, y, t: lines[i] });
                }
                y += body.field_value.padding;
                
            }
            y -= body.field_value.padding;

            // Calculate block's size
            let width = Math.round(((horizontal_padding + strokeWidth) * 2) + w);
            let height = Math.round(y + body.vertical_padding + strokeWidth);
            
            // Calculate block's bounding box
            let bb = this.boundingBox;
            let xMin = Math.round(bb.xMid - (width / 2));
            let yMin = Math.round(bb.yMid - (height / 2));
            let xMax = Math.round(bb.xMid + (width / 2));
            let yMax = Math.round(bb.yMid + (height / 2));

            // Update anchors
            let xo = (bb.xMid - xMin) / 2;
            let yo = (bb.yMid - yMin) / 2;
            let anchors = [
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
            for(let i = 0; i < anchors.length; i += 2) {
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
                headHeight,   
                titleFont,
                subtitleFont,
                fieldNameFont,
                fieldValueFont
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
    public override createView(cache: RasterCache): DictionaryBlockView {
        return new DictionaryBlockView(this, cache);
    }

}


///////////////////////////////////////////////////////////////////////////////
//  Internal Types  ///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


type DictionaryBlockRenderLayout = {
    
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
     * The block's header height.
     */
    headHeight: number,

    /**
     * Text placements with the title font.
     */
    titleFont: TextPlacement[],

    /**
     * Text placements with the subtitle font.
     */
    subtitleFont: TextPlacement[],    
    
    /**
     * Text placements with the field name font.
     */
    fieldNameFont: TextPlacement[],
    
    /**
     * Text placements with the field value font.
     */
    fieldValueFont: TextPlacement[],

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

/* eslint-disable prefer-const */
import { RasterCache } from "../DiagramElement/RasterCache";
import { BranchBlockView } from "../DiagramViewTypes";
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
import { type IFont, titleCase } from "../Utilities";
import type {
    BranchBlockStyle,
    BranchBlockTemplate,
    DiagramObjectValues
} from "../DiagramFactory";

export class BranchBlockModel extends DiagramObjectModel {

    /**
     * The template the object was configured with.
     */
    public override readonly template: BranchBlockTemplate;

    /**
     * The block's style.
     */
    public readonly style: BranchBlockStyle;

    /**
     * The block's render layout.
     */
    public layout: DictionaryBlockRenderLayout;


    /**
     * Creates a new {@link BranchBlockModel}.
     * @param factory
     *  The block's diagram factory.
     * @param template
     *  The block's template.
     * @param values
     *  The block's values.
     */
    constructor(
        factory: DiagramFactory,
        template: BranchBlockTemplate,
        values?: DiagramObjectValues
    ) {
        super(factory, template, values);
        this.setInheritAlignment(InheritAlignment.False);
        this.setAlignment(Alignment.Grid);
        this.setCursor(Cursor.Move);
        this.layout = {} as DictionaryBlockRenderLayout;
        // Template configuration
        this.setSemanticRole(template.role);
        this.template = template;
        this.style = template.style;
        // Anchor configuration
        if (!this.children.length) {
            let anchor;
            const t = template.anchor_template;
            const a = [AnchorAngle.DEG_0, AnchorAngle.DEG_90];
            // Standard anchors
            for (let i = 0; i < 9; i++) {
                anchor = factory.createObject(t) as AnchorPointModel;
                anchor.angle = a[Math.floor(i / 3) % 2];
                this.addChild(anchor, i, false);
            }
            // Branch anchors
            for (const b of this.template.branches) {
                anchor = factory.createObject(b.anchor_template) as AnchorPointModel;
                anchor.angle = AnchorAngle.DEG_90;
                this.addChild(anchor, this.children.length, false);
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
     * Returns the topmost object at the specified coordinate.
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
        const contentHash = this.props.toHashValue();
        const contentChanged = this.layout.contentHash !== contentHash;
        const fullLayoutRequired = reasons & LayoutUpdateReason.Initialization;

        // Update layout
        if (fullLayoutRequired || contentChanged) {

            const {
                max_width,
                head,
                body,
                branch,
                horizontal_padding
            } = this.style;
            const {
                branches
            } = this.template;
            const fnf = body.field_name;
            const fvf = body.field_value;
            const text: TextSet[] = [];
            const lines: Line[] = [];
            const strokeWidth = 1;

            // Configure title and subtitle
            const titleText = titleCase(this.template.id).toLocaleUpperCase();
            const subtitleText = this.props.isDefined() ? this.props.toString() : "";
            const hasSubtitle = subtitleText !== "";
            const hasBody = this.hasFields();
            type TitleFont = { font: IFont, color: string, padding?: number };
            const tf: TitleFont = (hasSubtitle ? head.two_title : head.one_title).title;

            // Calculate base width
            let bw = 0;
            for (const b of branches) {
                bw += branch.horizontal_padding;
                bw += branch.font.measureWidth(b.text);
                bw += branch.horizontal_padding + strokeWidth;
            }
            bw -= strokeWidth + (2 * horizontal_padding);

            // Calculate max width
            let mw = max_width;
            mw = Math.max(mw, tf.font.measureWidth(titleText));
            for (const key of this.props.value.keys()) {
                mw = Math.max(mw, body.field_name.font.measureWidth(key));
            }
            mw = Math.max(mw, bw);

            // Calculate text
            let m = null;
            let w = 0;
            const x = strokeWidth + horizontal_padding;
            let y = strokeWidth + head.vertical_padding;

            // Create title text set
            const title: TextSet = {
                font: tf.font,
                color: tf.color,
                text: []
            };
            text.push(title);

            // Calculate title text
            m = tf.font.measure(titleText);
            w = Math.max(w, m.width);
            y += m.ascent;
            title.text.push({ x, y, t: titleText });
            y += m.descent + (tf.padding ?? 0);

            // Calculate subtitle text
            if (hasSubtitle) {
                const stf = head.two_title.subtitle;

                // Create subtitle text set
                const subtitle: TextSet = {
                    font: stf.font,
                    color: stf.color,
                    text: []
                };
                text.push(subtitle);

                // Calculate subtitle text
                const lines = stf.font.wordWrap(subtitleText, mw);
                m = stf.font.measure(lines[0]);
                w = Math.max(w, m.width);
                y += m.ascent;
                subtitle.text.push({ x, y, t: lines[0] });
                for (let i = 1; i < lines.length; i++) {
                    m = stf.font.measure(lines[i]);
                    w = Math.max(w, m.width);
                    y += stf.line_height;
                    subtitle.text.push({ x, y, t: lines[i] });
                }

            }
            y += head.vertical_padding + strokeWidth;

            // Calculate header height
            const headerHeight =  Math.round(y);

            // Calculate fields
            if (hasBody) {

                // Create field name & value text sets
                const fieldName: TextSet = {
                    font: fnf.font,
                    color: fnf.color,
                    text: []
                };
                const fieldValue: TextSet = {
                    font: fvf.font,
                    color: fvf.color,
                    text: []
                };
                text.push(fieldName);
                text.push(fieldValue);

                // Calculate fields
                y += body.vertical_padding;
                for (let [key, value] of this.props.value) {

                    // Ignore empty fields
                    if (!value.isDefined()) {
                        continue;
                    }

                    // Ignore hidden fields
                    if (!(value.descriptor.is_visible_chart ?? true)) {
                        continue;
                    }

                    // Ignore the primary key
                    if (key === this.props.primaryKey) {
                        continue;
                    }

                    // Calculate field name text
                    key = key.toLocaleUpperCase();
                    m = fnf.font.measure(key);
                    w = Math.max(w, m.width);
                    y += m.ascent;
                    fieldName.text.push({ x, y, t: key });
                    y += m.descent + body.field_name.padding;

                    // Calculate field value text
                    const lines = fvf.font.wordWrap(value.toString(), mw);
                    m = fvf.font.measure(lines[0]);
                    w = Math.max(w, m.width);
                    y += m.ascent;
                    fieldValue.text.push({ x, y, t: lines[0] });
                    for (let i = 1; i < lines.length; i++) {
                        m = fvf.font.measure(lines[i]);
                        w = Math.max(w, m.width);
                        y += fvf.line_height;
                        fieldValue.text.push({ x, y, t: lines[i] });
                    }
                    y += body.field_value.padding;

                }
                y -= body.field_value.padding;
                y += body.vertical_padding;

            } else {
                y -= strokeWidth;
            }

            // Create branch text set
            const branchText: TextSet = {
                font: branch.font,
                color: branch.color,
                text: []
            };
            text.push(branchText);

            // Calculate branches
            y += strokeWidth;
            w = Math.max(w, bw) + (2 * horizontal_padding);
            const vp = branch.vertical_padding;
            let _x = strokeWidth;
            const _m = branches.map(b => branch.font.measure(b.text));
            const _h = Math.max(..._m.map(m => m.ascent + m.descent)) + vp * 2;
            const _hh = _h / 2;
            const _hw = w / _m.length / 2;

            // Text and line placements
            let x0, y0;
            for (let i = 0; i < _m.length; i++) {
                _x += _hw;
                branchText.text.push({
                    x: Math.round(_x - _m[i].width / 2),
                    y: y + Math.round(_hh + (_m[i].ascent / 2)),
                    t: branches[i].text
                });
                _x += _hw;
                x0 = Math.round(_x) + 0.5;
                lines.push({ x0, y0: y, x1: x0, y1: y + _h });
            }
            lines.pop();
            y0 = Math.round(y) - 0.5;
            y += _h;

            // Calculate block's size
            const width = Math.round(w + (strokeWidth * 2));
            const height = Math.round(y + strokeWidth);

            // Add block line
            lines.push({ x0: 0, y0, x1: width, y1: y0 });

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
                xMin, bb.yMid + yo,
                xMin, bb.yMid,
                xMin, bb.yMid - yo,
                bb.xMid - xo, yMin,
                bb.xMid, yMin,
                bb.xMid + xo, yMin,
                xMax, bb.yMid - yo,
                xMax, bb.yMid,
                xMax, bb.yMid + yo
            ];
            for (let i = 0; i < anchors.length; i += 2) {
                this.children[i / 2].moveTo(anchors[i], anchors[i + 1], false);
            }
            _x = xMin + strokeWidth;
            for (let i = 9; i < this.children.length; i++) {
                _x += _hw;
                this.children[i].moveTo(Math.round(_x), yMax, false);
                _x += _hw;
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
                headerHeight,
                text,
                lines
            };

        }

        // Update parent
        if (updateParent) {
            this.parent?.updateLayout(reasons);
        }

    }

    /**
     * Tests if the block has defined fields.
     * @returns
     *  True if the block has defined fields, false otherwise.
     */
    public hasFields() {
        for (const [key, value] of this.props.value) {
            if (key === this.props.primaryKey) {
                continue;
            }
            if (!(value.descriptor.is_visible_chart ?? true)) {
                continue;
            }
            if (value.isDefined()) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns this object wrapped inside a view object.
     *  @param cache
     *   The view's raster cache.
     *  @returns
     *   This object wrapped inside a view object.
     */
    public override createView(cache: RasterCache): BranchBlockView {
        return new BranchBlockView(this, cache);
    }

}


///////////////////////////////////////////////////////////////////////////////
//  Internal Types  ///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


type DictionaryBlockRenderLayout = {

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
     * The block's header height.
     */
    headerHeight: number;

    /**
     * The text to draw.
     */
    text: TextSet[];

    /**
     * The lines to draw
     */
    lines: Line[];

};

type Line = {

    /**
     * The starting x.
     */
    x0: number;

    /**
     * The starting y.
     */
    y0: number;

    /**
     * The ending x.
     */
    x1: number;

    /**
     * The ending y.
     */
    y1: number;

};

type TextSet = {

    /**
     * The text's fonts.
     */
    font: IFont;

    /**
     * The text's color.
     */
    color: string;

    /**
     * The text placements.
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

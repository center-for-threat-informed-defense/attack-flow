import { BlockFace } from "../Bases";
import type { ViewportRegion } from "../../ViewportRegion";
import type { DictionaryBlockStyle } from "../Styles";
import { drawRect, type Font } from "@OpenChart/Utilities";

export class DictionaryBlock extends BlockFace {

    /**
     * The block's style.
     */
    private readonly style: DictionaryBlockStyle;


    private layout: any;

    /**
     * Creates a new {@link DictionaryBlock}.
     * @param style
     *  The block's style.
     */
    constructor(style: DictionaryBlockStyle) {
        super();
        this.style = style;
        this.layout = {};
    }


    /**
     * Calculates the face's layout.
     * @returns
     *  True if the layout changed, false otherwise.
     */
    public calculateLayout(): boolean {
        const props = this.view.properties;
        // Recalculate content hash
        const lastContentHash = this.contentHash;
        const nextContentHash = props.toHashValue();
        this.contentHash = nextContentHash;

        // If content hasn't changed, bail.
        if (lastContentHash === nextContentHash) {
            return false;
        }

        const {
            maxWidth,
            head,
            body,
            horizontalPadding
        } = this.style;
        const fnf = body.fieldNameText;
        const fvf = body.fieldValueText;
        const text: any[] = [];
        const strokeWidth = 1;

        // Configure title and subtitle
        const titleText = this.view.id.toLocaleUpperCase();
        const subtitleText = props.isDefined() ? props.toString() : "";
        const hasSubtitle = subtitleText !== "";
        // const hasBody = this.hasFields();
        const hasBody = true;
        type TitleFont = { font: Font, color: string, padding?: number };
        const tf: TitleFont = (hasSubtitle ? head.twoTitle : head.oneTitle).title;

        // Calculate max width
        let mw = maxWidth;
        mw = Math.max(mw, tf.font.measureWidth(titleText));
        for (const key of props.value.keys()) {
            mw = Math.max(mw, body.fieldNameText.font.measureWidth(key));
        }

        // Calculate text
        let m = null;
        let w = 0;
        const x = strokeWidth + horizontalPadding;
        let y = strokeWidth + head.verticalPadding;

        // Create title text set
        const title: any = {
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
            const stf = head.twoTitle.subtitle;

            // Create subtitle text set
            const subtitle: any = {
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
                y += stf.lineHeight;
                subtitle.text.push({ x, y, t: lines[i] });
            }

        }
        y += head.verticalPadding + strokeWidth;

        // Calculate header height
        const headerHeight = Math.round(y);

        // Calculate fields
        if (hasBody) {

            // Create field name & value text sets
            const fieldName: any = {
                font: fnf.font,
                color: fnf.color,
                text: []
            };
            const fieldValue: any = {
                font: fvf.font,
                color: fvf.color,
                text: []
            };
            text.push(fieldName);
            text.push(fieldValue);

            // Calculate fields
            y += body.verticalPadding;
            for (let [key, value] of props.value) {

                // Ignore empty fields
                if (!value.isDefined()) {
                    continue;
                }

                // Ignore hidden fields
                // if (!(value.descriptor.is_visible_chart ?? true)) {
                //     continue;
                // }

                // Ignore the primary key
                // if (key === props.primaryKey) {
                //     continue;
                // }

                // Calculate field name text
                key = key.toLocaleUpperCase();
                m = fnf.font.measure(key);
                w = Math.max(w, m.width);
                y += m.ascent;
                fieldName.text.push({ x, y, t: key });
                y += m.descent + body.fieldNameText.lineHeight;

                // Calculate field value text
                const lines = fvf.font.wordWrap(value.toString(), mw);
                m = fvf.font.measure(lines[0]);
                w = Math.max(w, m.width);
                y += m.ascent;
                fieldValue.text.push({ x, y, t: lines[0] });
                for (let i = 1; i < lines.length; i++) {
                    m = fvf.font.measure(lines[i]);
                    w = Math.max(w, m.width);
                    y += fvf.lineHeight;
                    fieldValue.text.push({ x, y, t: lines[i] });
                }
                y += body.fieldValueText.padding;

            }
            y -= body.fieldValueText.padding;
            y += body.verticalPadding;

        } else {
            y -= strokeWidth;
        }

        // Calculate block's size
        const width = Math.round(w + ((horizontalPadding + strokeWidth) * 2));
        const height = Math.round(y + strokeWidth);

        // Calculate block's bounding box
        const bb = this.boundingBox;
        const xMin = Math.round(bb.xMid - (width / 2));
        const yMin = Math.round(bb.yMid - (height / 2));
        const xMax = Math.round(bb.xMid + (width / 2));
        const yMax = Math.round(bb.yMid + (height / 2));

        // Update anchors
        // const xo = (bb.xMid - xMin) / 2;
        // const yo = (bb.yMid - yMin) / 2;
        // const anchors = [
        //     bb.xMid - xo, yMin,
        //     bb.xMid, yMin,
        //     bb.xMid + xo, yMin,
        //     xMax, bb.yMid - yo,
        //     xMax, bb.yMid,
        //     xMax, bb.yMid + yo,
        //     bb.xMid + xo, yMax,
        //     bb.xMid, yMax,
        //     bb.xMid - xo, yMax,
        //     xMin, bb.yMid + yo,
        //     xMin, bb.yMid,
        //     xMin, bb.yMid - yo
        // ];
        // for (let i = 0; i < anchors.length; i += 2) {
        //     this.children[i / 2].moveTo(anchors[i], anchors[i + 1], false);
        // }

        // Update object's bounding box
        // super.updateLayout(reasons, false);

        // Update layout
        this.layout = {
            dx: xMin - bb.xMin,
            dy: yMin - bb.yMin,
            width,
            height,
            headerHeight,
            text
        };

        return true;
    }

    /**
     * Renders the face to a context.
     * @param ctx
     *  The context to render to.
     * @param region
     *  The context's viewport.
     */
    public renderTo(ctx: CanvasRenderingContext2D, region: ViewportRegion): void;

    /**
     * Renders the face to a context.
     * @param ctx
     *  The context to render to.
     * @param region
     *  The context's viewport.
     * @param dsx
     *  The drop shadow's x-offset.
     * @param dsy
     *  The drop shadow's y-offset.
     */
    public renderTo(ctx: CanvasRenderingContext2D, region: ViewportRegion, dsx?: number, dsy?: number): void;
    public renderTo(ctx: CanvasRenderingContext2D, region: ViewportRegion, dsx: number = 10, dsy: number = 10): void {
        if (!this.isVisible(region)) {
            return;
        }

        // Init
        // const { tlx: x, tly: y } = this;
        const x = this.view.x;
        const y = this.view.y;
        const {
            body,
            head,
            selectOutline: so,
            borderRadius: br
        } = this.style;
        const {
            width: w,
            height: h,
            headerHeight: hh,
            text
        } = this.layout;
        const isSplitBlock = hh !== h;

        // Draw body
        let bf, bs;
        if (isSplitBlock) {
            bf = body.fillColor;
            bs = body.strokeColor;
        } else {
            bf = head.fillColor;
            bs = head.strokeColor;
        }
        ctx.lineWidth = 1.1;
        drawRect(ctx, x, y, w, h, br);
        if (dsx | dsy) {
            ctx.shadowOffsetX = dsx + (0.5 * region.scale);
            ctx.shadowOffsetY = dsy + (0.5 * region.scale);
            ctx.fillStyle = bf;
            ctx.strokeStyle = bs;
            ctx.fill();
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.stroke();
        } else {
            ctx.fillStyle = bf;
            ctx.strokeStyle = bs;
            ctx.fill();
            ctx.stroke();
        }

        // Draw head
        if (isSplitBlock) {
            drawRect(ctx, x, y, w, hh, { tr: br, tl: br });
            ctx.fillStyle = head.fillColor;
            ctx.strokeStyle = head.strokeColor;
            ctx.fill();
            ctx.stroke();
        }

        // Draw text
        for (const set of text) {
            ctx.font = set.font.css;
            ctx.fillStyle = set.color;
            for (const text of set.text) {
                ctx.fillText(text.t, x + text.x, y + text.y);
            }
        }

        if (this.view.focused) {

            // Init
            let {
                color,
                padding: p,
                borderRadius: br
            } = so;
            p += 1;

            // Draw select border
            drawRect(ctx, x - p, y - p, w + p * 2, h + p * 2, br, 1);
            ctx.strokeStyle = color;
            ctx.stroke();

        } else if (this.view.hovered) {

            // Init
            const {
                color,
                size
            } = this.style.anchorMarkers;

            // Draw anchors
            // super.renderTo(ctx, vr, dsx, dsy);

            // Draw anchor markers
            // ctx.strokeStyle = color;
            // ctx.beginPath();
            // for (const o of this.children) {
            //     ctx.moveTo(o.x - size, o.y - size);
            //     ctx.lineTo(o.x + size, o.y + size);
            //     ctx.moveTo(o.x + size, o.y - size);
            //     ctx.lineTo(o.x - size, o.y + size);
            // }
            // ctx.stroke();

        }
    }

}

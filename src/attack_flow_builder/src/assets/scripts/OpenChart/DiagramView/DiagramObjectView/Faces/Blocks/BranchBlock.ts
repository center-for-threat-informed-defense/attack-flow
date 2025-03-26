import { BlockFace } from "../Bases";
import type { ViewportRegion } from "../../ViewportRegion";
import type { BranchBlockStyle } from "../Styles";

export class BranchBlock extends BlockFace {

    /**
     * The block's style.
     */
    private readonly style: BranchBlockStyle;


    /**
     * Creates a new {@link BranchBlock}.
     * @param style
     *  The block's style.
     */
    constructor(style: BranchBlockStyle) {
        super();
        this.style = style;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Layout / Rendering  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Calculates the face's layout.
     * @returns
     *  True if the layout changed, false otherwise.
     */
    public calculateLayout(): boolean {
        // Recalculate content hash
        const lastContentHash = this.contentHash;
        const nextContentHash = this.view.properties?.toHashValue();
        this.contentHash = nextContentHash;

        // If content hasn't changed, bail.
        if (lastContentHash !== nextContentHash) {
            return false;
        }

        // const {
        //     max_width,
        //     head,
        //     body,
        //     horizontal_padding
        // } = this.style;
        // const fnf = body.field_name;
        // const fvf = body.field_value;
        // const text: TextSet[] = [];
        // const strokeWidth = 1;

        // // Configure title and subtitle
        // const titleText = titleCase(this.template.id).toLocaleUpperCase();
        // const subtitleText = this.props.isDefined() ? this.props.toString() : "";
        // const hasSubtitle = subtitleText !== "";
        // const hasBody = this.hasFields();
        // type TitleFont = { font: IFont, color: string, padding?: number };
        // const tf: TitleFont = (hasSubtitle ? head.two_title : head.one_title).title;

        // // Calculate max width
        // let mw = max_width;
        // mw = Math.max(mw, tf.font.measureWidth(titleText));
        // for (const key of this.props.value.keys()) {
        //     mw = Math.max(mw, body.field_name.font.measureWidth(key));
        // }

        // // Calculate text
        // let m = null;
        // let w = 0;
        // const x = strokeWidth + horizontal_padding;
        // let y = strokeWidth + head.vertical_padding;

        // // Create title text set
        // const title: TextSet = {
        //     font: tf.font,
        //     color: tf.color,
        //     text: []
        // };
        // text.push(title);

        // // Calculate title text
        // m = tf.font.measure(titleText);
        // w = Math.max(w, m.width);
        // y += m.ascent;
        // title.text.push({ x, y, t: titleText });
        // y += m.descent + (tf.padding ?? 0);

        // // Calculate subtitle text
        // if (hasSubtitle) {
        //     const stf = head.two_title.subtitle;

        //     // Create subtitle text set
        //     const subtitle: TextSet = {
        //         font: stf.font,
        //         color: stf.color,
        //         text: []
        //     };
        //     text.push(subtitle);

        //     // Calculate subtitle text
        //     const lines = stf.font.wordWrap(subtitleText, mw);
        //     m = stf.font.measure(lines[0]);
        //     w = Math.max(w, m.width);
        //     y += m.ascent;
        //     subtitle.text.push({ x, y, t: lines[0] });
        //     for (let i = 1; i < lines.length; i++) {
        //         m = stf.font.measure(lines[i]);
        //         w = Math.max(w, m.width);
        //         y += stf.line_height;
        //         subtitle.text.push({ x, y, t: lines[i] });
        //     }

        // }
        // y += head.vertical_padding + strokeWidth;

        // // Calculate header height
        // const headerHeight = Math.round(y);

        // // Calculate fields
        // if (hasBody) {

        //     // Create field name & value text sets
        //     const fieldName: TextSet = {
        //         font: fnf.font,
        //         color: fnf.color,
        //         text: []
        //     };
        //     const fieldValue: TextSet = {
        //         font: fvf.font,
        //         color: fvf.color,
        //         text: []
        //     };
        //     text.push(fieldName);
        //     text.push(fieldValue);

        //     // Calculate fields
        //     y += body.vertical_padding;
        //     for (let [key, value] of this.props.value) {

        //         // Ignore empty fields
        //         if (!value.isDefined()) {
        //             continue;
        //         }

        //         // Ignore hidden fields
        //         if (!(value.descriptor.is_visible_chart ?? true)) {
        //             continue;
        //         }

        //         // Ignore the primary key
        //         if (key === this.props.primaryKey) {
        //             continue;
        //         }

        //         // Calculate field name text
        //         key = key.toLocaleUpperCase();
        //         m = fnf.font.measure(key);
        //         w = Math.max(w, m.width);
        //         y += m.ascent;
        //         fieldName.text.push({ x, y, t: key });
        //         y += m.descent + body.field_name.padding;

        //         // Calculate field value text
        //         const lines = fvf.font.wordWrap(value.toString(), mw);
        //         m = fvf.font.measure(lines[0]);
        //         w = Math.max(w, m.width);
        //         y += m.ascent;
        //         fieldValue.text.push({ x, y, t: lines[0] });
        //         for (let i = 1; i < lines.length; i++) {
        //             m = fvf.font.measure(lines[i]);
        //             w = Math.max(w, m.width);
        //             y += fvf.line_height;
        //             fieldValue.text.push({ x, y, t: lines[i] });
        //         }
        //         y += body.field_value.padding;

        //     }
        //     y -= body.field_value.padding;
        //     y += body.vertical_padding;

        // } else {
        //     y -= strokeWidth;
        // }

        // // Calculate block's size
        // const width = Math.round(w + ((horizontal_padding + strokeWidth) * 2));
        // const height = Math.round(y + strokeWidth);

        // // Calculate block's bounding box
        // const bb = this.boundingBox;
        // const xMin = Math.round(bb.xMid - (width / 2));
        // const yMin = Math.round(bb.yMid - (height / 2));
        // const xMax = Math.round(bb.xMid + (width / 2));
        // const yMax = Math.round(bb.yMid + (height / 2));

        // // Update anchors
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

        // // Update object's bounding box
        // super.updateLayout(reasons, false);

        // // Update layout
        // this.layout = {
        //     contentHash,
        //     dx: xMin - bb.xMin,
        //     dy: yMin - bb.yMin,
        //     width,
        //     height,
        //     headerHeight,
        //     text
        // };

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
    public renderTo(ctx: CanvasRenderingContext2D, region: ViewportRegion, dsx?: number, dsy?: number): void {
        throw new Error("Method not implemented.");
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Cloning  ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns a clone of the face.
     * @returns
     *  A clone of the face.
     */
    public clone(): BranchBlock {
        return new BranchBlock(this.style);
    }

}

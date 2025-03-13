import { Cursor } from "../../ViewAttributes";
import { LineFace } from "../Bases";
import { LayoutUpdateReason } from "../../LayoutUpdateReason";
import { getLineHitbox, isInsideRegion } from "@OpenChart/Utilities";
import type { LineStyle } from "../Styles";
import type { ViewportRegion } from "../../ViewportRegion";
import type { DiagramObjectView } from "../../Views";
import type { MovementChoreographer } from "../MovementChoreographer";

export class HorizontalElbowLine extends LineFace implements MovementChoreographer {

    /**
     * The line's style.
     */
    private readonly style: LineStyle;

    /**
     * The line's hitboxes.
     */
    private readonly hitboxes: number[][];


    /**
     * Creates a new {@link HorizontalElbowLine}.
     * @param style
     *  The line's style.
     */
    constructor(style: LineStyle) {
        super();
        this.style = style;
        this.hitboxes = new Array(3);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Selection  /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns the topmost view at the given coordinate.
     * @param x
     *  The x coordinate.
     * @param y
     *  The y coordinate.
     * @returns
     *  The topmost view, undefined if there isn't one.
     */
    public getObjectAt(x: number, y: number): DiagramObjectView | undefined {
        if (this.isAnchored()) {
            // Try points
            const obj = super.getObjectAt(x, y);
            if (obj) {
                return obj;
            }
            // Try segments
            for (let i = 0; i < this.hitboxes.length; i++) {
                if (!isInsideRegion(x, y, this.hitboxes[i])) {
                    continue;
                }
                if (i === 1) {
                    return this.view.handles[i];
                } else {
                    return this.view;
                }
            }
        } else {
            if (this.view.focused) {
                // Try points
                const obj = super.getObjectAt(x, y);
                if (obj) {
                    return obj;
                }
            }
            // Try segments
            for (const hitbox of this.hitboxes) {
                if (isInsideRegion(x, y, hitbox)) {
                    return this.view;
                }
            }
        }
        return undefined;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Movement  //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Moves `view` relative to its current position.
     * @param view
     *  The view to move.
     * @param dx
     *  The change in x.
     * @param dy
     *  The change in y.
     */
    public moveViewBy(view: DiagramObjectView, dx: number, dy: number): void {
        // Move latch
        const src = this.view.source;
        const trg = this.view.target;
        if (src.instance === view.instance || trg.instance === view.instance) {
            view.face.setPosition(dx, dy);
        }
        // Move handle
        const hdl = this.view.handles[0];
        const srcX = src.x,
            srcY = src.y,
            trgX = trg.x,
            trgY = trg.y,
            hdlX = hdl.x,
            hdlY = hdl.y,
            hdx = ((srcX + trgX) / 2) - hdlX,
            hdy = ((srcY + trgY) / 2) - hdlY;
        if (!hdl.userSetPosition) {
            hdl.face.setPosition(hdx, 0);
        } else if (view.instance === hdl.instance) {
            hdl.face.setPosition(dx, 0);
        }
        hdl.face.setPosition(0, hdy);
        // Recalculate layout
        this.view.updateLayout(LayoutUpdateReason.Movement);
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
        const e1 = this.view.source;
        const h1 = this.view.handles[0];
        const e2 = this.view.target;
        if (!e1 || !h1 || !e2) {
            // Bail if object incomplete
            return false;
        }
        // Update hitboxes
        const w = this.style.hitboxWidth;
        this.hitboxes[0] = getLineHitbox(e1.x, e1.y, h1.x, e1.y, w);
        this.hitboxes[1] = getLineHitbox(h1.x, e1.y, h1.x, e2.y, w);
        this.hitboxes[2] = getLineHitbox(h1.x, e2.y, e2.x, e2.y, w);
        // Update cursor
        h1.cursor = Cursor.Col_Resize;
        // Update bounding box
        super.calculateLayout();
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
        if (!this.isVisible(region)) {
            return;
        }

        // // Init
        // const {
        //     children: c
        // } = this;
        // const {
        //     cap_size: cs,
        //     width,
        //     color,
        //     select_color
        // } = this.el.style;

        // // Configure line
        // ctx.lineWidth = width;
        // let lineColor;
        // switch (this.el.attrs & SelectMask) {
        //     case Select.True:
        //         lineColor = select_color;
        //         break;
        //     case Select.False:
        //     default:
        //         lineColor = color;
        //         break;
        // }
        // ctx.fillStyle = lineColor;
        // ctx.strokeStyle = lineColor;

        // // Line width offset
        // const wo = width % 2 ? 0.5 : 0;
        // // End offset
        // const eo = Math.sign(c[2].x - c[1].x) * (cs >> 1);

        // // Draw line
        // ctx.beginPath();
        // ctx.moveTo(c[0].x,      c[0].y + wo);
        // ctx.lineTo(c[1].x + wo, c[0].y + wo);
        // ctx.lineTo(c[1].x + wo, c[2].y + wo);
        // ctx.lineTo(c[2].x - eo, c[2].y + wo);
        // ctx.stroke();

        // // Draw arrow head
        // drawArrowHead(
        //     ctx,
        //     c[1].x, c[2].y + wo,
        //     c[2].x, c[2].y + wo,
        //     cs
        // );
        // ctx.fill();

        // // Draw handles and ends
        // if (this.el.isSelected(attrs)) {
        //     super.renderTo(ctx, region, dsx, dsy);
        // }

    }

}

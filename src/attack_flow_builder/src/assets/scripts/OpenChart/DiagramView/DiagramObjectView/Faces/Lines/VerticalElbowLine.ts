import { LineFace } from "../Bases";
import { LayoutUpdateReason } from "../../LayoutUpdateReason";
import {
    drawPolygon,
    drawVerticalElbow,
    getArrowHead,
    getLineHitbox,
    round,
    roundNearestMultiple
} from "@OpenChart/Utilities";
import type { LineStyle } from "../Styles";
import type { ViewportRegion } from "../../ViewportRegion";
import type { RenderSettings } from "../../RenderSettings";
import type { DiagramObjectView } from "../../Views";

export class VerticalElbowLine extends LineFace {

    /**
     * The line's style.
     */
    private readonly style: LineStyle;

    /**
     * The line's grid.
     */
    private readonly grid: [number, number];

    /**
     * The line's coordinates.
     */
    private coordinates: [
        number, number,
        number, number,
        number, number
    ];

    /**
     * The line's arrow head shape.
     */
    private arrowHead: [
        number, number,
        number, number,
        number, number
    ]


    /**
     * Creates a new {@link HorizontalElbowLine}.
     * @param style
     *  The line's style.
     * @param grid
     *  The line's grid.
     */
    constructor(style: LineStyle, grid: [number, number]) {
        super(new Array(3));
        this.style = style;
        this.grid = grid;
        this.coordinates = [0, 0, 0, 0, 0, 0];
        this.arrowHead = getArrowHead(0,0,0,0, style.capSize);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Movement  //////////////////////////////////////////////////////////
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
            hx = round((srcX + trgX) / 2),
            hy = roundNearestMultiple((srcY + trgY) / 2, this.grid[1]);
        if (!hdl.userSetPosition) {
            hdl.face.setPosition(0, hy - hdlY);
        } else if (view.instance === hdl.instance) {
            hdl.face.setPosition(0, dy);
        }
        hdl.face.setPosition(hx - hdlX, 0);
        // Recalculate layout
        this.view.updateLayout(LayoutUpdateReason.Movement);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Layout / Rendering  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Calculates the face's layout.
     * @returns
     *  True if the layout changed, false otherwise.
     */
    public calculateLayout(): boolean {
        const src = this.view.source;
        const hdl = this.view.handles[0];
        const trg = this.view.target;
        if (!src || !hdl || !trg) {
            // Bail if object incomplete
            return false;
        }
        // Update hitboxes
        const w = this.style.hitboxWidth;
        this.hitboxes[0] = getLineHitbox(src.x, src.y, src.x, hdl.y, w);
        this.hitboxes[1] = getLineHitbox(src.x, hdl.y, trg.x, hdl.y, w);
        this.hitboxes[2] = getLineHitbox(trg.x, hdl.y, trg.x, trg.y, w);
        // Update coordinates
        const coords = this.coordinates;
        coords[0] = src.x + LineFace.markerOffset;
        coords[2] = hdl.x;
        coords[3] = hdl.y + LineFace.markerOffset;;
        coords[4] = trg.x + LineFace.markerOffset;
        if(src.y < trg.y) {
            coords[1] = src.y + (LineFace.markerOffset << 1);
            coords[5] = trg.y;
        } else {
            coords[1] = src.y //
            coords[5] = trg.y + (LineFace.markerOffset << 1);
        }

        // Update arrow head
        this.arrowHead = getArrowHead(
            coords[4], coords[3],
            coords[4], coords[5],
            this.style.capSize
        )
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
     * @param settings
     *  The current render settings.
     */
    public renderTo(
        ctx: CanvasRenderingContext2D,
        region: ViewportRegion, settings: RenderSettings
    ): void {
        if (!this.isVisible(region)) {
            return;
        }

        // Init
        const c = this.coordinates;
        const {
            width,
            color,
            selectColor,
            borderRadius,
            capSize
        } = this.style;

        // Configure context
        ctx.lineWidth = width;
        if(this.view.focused) {
            if(settings.animationsEnabled) {
                ctx.setLineDash([5, 2]);
            }
            ctx.fillStyle = selectColor;
            ctx.strokeStyle = selectColor;
        } else {
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
        }

        // End offset
        const eo = Math.sign(c[3] - c[5]) * (capSize >> 1);
        // Draw line
        drawVerticalElbow(
            ctx,
            c[0], c[1],
            c[2], c[3],
            c[4], c[5] + eo,
            borderRadius
        );
        ctx.stroke();
        ctx.setLineDash([]);
        // Draw arrow head
        drawPolygon(
            ctx,
            c[4], c[5],
            this.arrowHead
        );
        ctx.fill();

        // Draw handles and ends
        if (this.view.focused) {
            const view = this.view;
            view.handles[0].renderTo(ctx, region, settings);
            view.source.renderTo(ctx, region, settings);
            view.target.renderTo(ctx, region, settings);
        }

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
        if(isRendered) {
            const radius = 2;
            const p = Math.PI * 2;
            // Draw hitbox points
            ctx.beginPath();
            for (const hitbox of this.hitboxes) {
                for (let i = 0; i < hitbox.length; i += 2) {
                    ctx.moveTo(hitbox[i] + radius, hitbox[i + 1]);
                    ctx.arc(hitbox[i], hitbox[i + 1], radius, 0, p);
                }
            }
            ctx.fill();
        }
        return isRendered;
    }

}

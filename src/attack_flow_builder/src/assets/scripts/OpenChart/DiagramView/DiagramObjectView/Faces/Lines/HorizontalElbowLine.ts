import { LineFace } from "../Bases";
import { LayoutUpdateReason } from "../../LayoutUpdateReason";
import { 
    drawArrowHead,
    drawHorizontalElbow,
    getLineHitbox,
    roundNearestMultiple
} from "@OpenChart/Utilities";
import type { LineStyle } from "../Styles";
import type { ViewportRegion } from "../../ViewportRegion";
import type { RenderSettings } from "../../RenderSettings";
import type { DiagramObjectView } from "../../Views";

export class HorizontalElbowLine extends LineFace {

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
            hx = roundNearestMultiple((srcX + trgX) / 2, this.grid[0]),
            hy = Math.round((srcY + trgY) / 2);
        if (!hdl.userSetPosition) {
            hdl.face.setPosition(hx - hdlX, 0);
        } else if (view.instance === hdl.instance) {
            hdl.face.setPosition(dx, 0);
        }
        hdl.face.setPosition(0, hy - hdlY);
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
        const src = this.view.source;
        const hdl = this.view.handles[0];
        const trg = this.view.target;
        if (!src || !hdl || !trg) {
            // Bail if object incomplete
            return false;
        }
        // Update hitboxes
        const w = this.style.hitboxWidth;
        this.hitboxes[0] = getLineHitbox(src.x, src.y, hdl.x, src.y, w);
        this.hitboxes[1] = getLineHitbox(hdl.x, src.y, hdl.x, trg.y, w);
        this.hitboxes[2] = getLineHitbox(hdl.x, trg.y, trg.x, trg.y, w);
        // Update coordinates
        this.coordinates[1] = src.y + LineFace.markerOffset;
        this.coordinates[2] = hdl.x + LineFace.markerOffset;
        this.coordinates[3] = hdl.y;
        this.coordinates[5] = trg.y + LineFace.markerOffset;
        if(src.x < trg.x) {
            this.coordinates[0] = src.x + (LineFace.markerOffset << 1);
            this.coordinates[4] = trg.x;
        } else {
            this.coordinates[0] = src.x;
            this.coordinates[4] = trg.x + (LineFace.markerOffset << 1);
        }
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
        const eo = Math.sign(c[4] - c[2]) * (capSize >> 1);
        // Draw line
        drawHorizontalElbow(
            ctx,
            c[0], c[1],
            c[2], c[3],
            c[4] - eo, c[5],
            borderRadius
        );
        ctx.stroke();
        ctx.setLineDash([]);
        // Draw arrow head
        drawArrowHead(
            ctx,
            c[2], c[5],
            c[4], c[5],
            capSize
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

import { drawArrowHead } from "../Utilities";
import { RasterCache } from "../DiagramElement/RasterCache";
import { ViewportRegion } from "../DiagramElement";
import { LineStraightModel } from "../DiagramModelTypes/LineStraightModel";
import {
    DiagramLineEndingView,
    DiagramLineView
} from ".";
import { Select, SelectMask } from "../Attributes";

export class LineStraightView extends DiagramLineView {

    /**
     * The underlying model.
     */
    public override el: LineStraightModel;

    /**
     * Creates a new {@link LineStraightView}.
     * @param el
     *  The underlying model.
     * @param rasterCache
     *  The view's raster cache.
     */
    constructor(el: LineStraightModel, rasterCache: RasterCache) {
        super(el, rasterCache);
        this.el = el;
    }

    ///////////////////////////////////////////////////////////////////////////
    //  1. Movement  //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    public moveChild(id: string, dx: number, dy: number): void {
        const obj = this.children.find(o => o.el.id === id)!;
        if (!obj) {
            return;
        }
        if (obj instanceof DiagramLineEndingView) {
            obj.moveBy(dx, dy, undefined, true);
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    //  2. Render  ////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    public override renderTo(
        ctx: CanvasRenderingContext2D, vr: ViewportRegion,
        dsx: number = 0, dsy: number = 0, attrs?: number
    ) {
        if (!this.isVisible(vr)) {
            return;
        }

        const {
            children: c
        } = this;
        const {
            cap_size: cs,
            width,
            color,
            select_color
        } = this.el.style;

        ctx.lineWidth = width;
        let lineColor;
        switch (this.el.attrs & SelectMask) {
            case Select.True:
                lineColor = select_color;
                break;
            case Select.False:
            default:
                lineColor = color;
                break;
        }
        ctx.fillStyle = lineColor;
        ctx.strokeStyle = lineColor;
        // Calculate the angle of the line
        const angle = Math.atan2(c[1].y - c[0].y, c[1].x - c[0].x);

        // Calculate the offset for the line so it doesn't extend beyond the arrowhead
        const offsetX = Math.cos(angle) * (cs * 0.8);
        const offsetY = Math.sin(angle) * (cs * 0.8);

        ctx.beginPath();
        ctx.moveTo(c[0].x, c[0].y);
        ctx.lineTo(c[1].x - offsetX, c[1].y - offsetY);
        ctx.stroke();

        drawArrowHead(
            ctx,
            c[1].x - offsetX, c[1].y - offsetY,
            c[1].x, c[1].y,
            cs
        );
        ctx.fill();

        if (this.el.isSelected(attrs)) {
            super.renderTo(ctx, vr, dsx, dsy);
        }
    }

    public override renderDebugTo(ctx: CanvasRenderingContext2D, vr: ViewportRegion) {
        if (!this.isVisible(vr)) {
            return;
        }
        const radius = 2;
        const p = Math.PI * 2;
        ctx.beginPath();
        for (const hitbox of this.el.hitboxes) {
            for (let i = 0; i < hitbox.length; i += 2) {
                ctx.moveTo(hitbox[i] + radius, hitbox[i + 1]);
                ctx.arc(hitbox[i], hitbox[i + 1], radius, 0, p);
            }
        }
        ctx.fill();
        super.renderDebugTo(ctx, vr);
    }
}

import { drawArrowHead } from "../Utilities";
import { RasterCache } from "../DiagramElement/RasterCache";
import { ViewportRegion } from "../DiagramElement";
import { LineRightAngleHorizontalModel } from "../DiagramModelTypes/LineRightAngleHorizontalModel";
import {
    DiagramLineEndingView,
    DiagramLineView
} from ".";
import { Select, SelectMask } from "../Attributes";

export class LineRightAngleHorizontalView extends DiagramLineView {

    /**
     * The underlying model.
     */
    public override el: LineRightAngleHorizontalModel;

    /**
     * Creates a new {@link LineRightAngleHorizontalView}.
     * @param el
     *  The underlying model.
     * @param rasterCache
     *  The view's raster cache.
     */
    constructor(el: LineRightAngleHorizontalModel, rasterCache: RasterCache) {
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

        const wo = width % 2 ? 0.5 : 0;
        const eo = Math.sign(c[1].y - c[1].y) * (cs >> 1);
        const ho = c[1].y > c[0].y ? 12 : -12;

        ctx.beginPath();
        ctx.moveTo(c[0].x, c[0].y + wo);
        ctx.lineTo(c[1].x + wo, c[0].y + wo);
        ctx.lineTo(c[1].x + wo, c[1].y - (eo + ho));
        ctx.stroke();

        drawArrowHead(
            ctx,
            c[1].x, c[0].y,
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

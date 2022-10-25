import { drawArrowHead } from "../Utilities";
import { RasterCache } from "../DiagramElement/RasterCache";
import { ViewportRegion } from "../DiagramElement";
import { LineHorizontalElbowModel } from "../DiagramModelTypes";
import { 
    DiagramLineEndingView,
    DiagramLineView
} from ".";
import { Select, SelectMask } from "../Attributes";

export class LineHorizontalElbowView extends DiagramLineView {
    
    /**
     * The underlying model.
     */
    public override el: LineHorizontalElbowModel;


    /**
     * Creates a new {@link LineHorizontalElbowView}.
     * @param el
     *  The underlying model.
     * @param rasterCache
     *  The view's raster cache.
     */
    constructor(el: LineHorizontalElbowModel, rasterCache: RasterCache) {
        super(el, rasterCache);
        this.el = el;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Movement  //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Moves one of the line's children relative to its current position. 
     * @param id
     *  The id of the child.
     * @param dx
     *  The change in x.
     * @param dy
     *  The change in y.
     * @param attrs
     *  If specified, this set of attributes will override the object's
     *  underlying attributes.
     */
    public moveChild(id: string, dx: number, dy: number, attrs?: number): void {
        // Select child
        let obj = this.children.find(o => o.el.id === id)!;
        if(!obj)
            return;
        // Move ending
        if(obj instanceof DiagramLineEndingView) {
            obj.moveBy(dx, dy, undefined, true);
        }
        let [e1, h1, e2] = this.children;
        // Move handle
        let hdx = ((e1.x + e2.x) / 2) - h1.x,
            hdy = ((e1.y + e2.y) / 2) - h1.y;
        // attrs must ONLY override the child being moved, we 
        // can't override h1 unless we're explicitly moving h1
        if(!h1.el.hasUserSetPosition(obj === h1 ? attrs : undefined)) {
            h1.moveBy(hdx, 0, undefined, true);
        } else if(obj === h1) {
            h1.moveBy(dx, 0, undefined, true);
        }
        h1.moveBy(0, hdy, undefined, true);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Render  ////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Renders the object to a context.
     * @param ctx
     *  The context to render to.
     * @param vr
     *  The context's viewport.
     * @param dsx
     *  The drop shadow's x-offset.
     *  (Default: 0)
     * @param dsy
     *  The drop shadow's y-offset.
     *  (Default: 0)
     * @param attrs
     *  If specified, these attributes will override the object's underlying
     *  attributes.
     */
    public override renderTo(
        ctx: CanvasRenderingContext2D, vr: ViewportRegion,
        dsx: number = 0, dsy: number = 0, attrs?: number
    ) { 
        if(!this.isVisible(vr)) {
            return;
        }

        // Init
        let {
            children: c
        } = this;        
        let {
            cap_size: cs,
            width,
            color,
            select_color
        } = this.el.style;

        // Configure line
        ctx.lineWidth = width;
        let lineColor;
        switch(this.el.attrs & SelectMask) {
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

        // Line width offset
        let wo = width % 2 ? 0.5 : 0;
        // End offset
        let eo = Math.sign(c[2].x - c[1].x) * (cs >> 1);
        
        // Draw line
        ctx.beginPath();
        ctx.moveTo(c[0].x,      c[0].y + wo);
        ctx.lineTo(c[1].x + wo, c[0].y + wo);
        ctx.lineTo(c[1].x + wo, c[2].y + wo);
        ctx.lineTo(c[2].x - eo, c[2].y + wo);
        ctx.stroke();
        
        // Draw arrow head
        drawArrowHead(
            ctx, 
            c[1].x, c[2].y + wo, 
            c[2].x, c[2].y + wo, 
            cs
        );
        ctx.fill();

        // Draw handles and ends
        if(this.el.isSelected(attrs)) {
            super.renderTo(ctx, vr, dsx, dsy);
        }

    }

    /**
     * Renders the object's debug information to a context.
     * @param ctx
     *  The context to render to.
     * @param vr
     *  The context's viewport.
     */
    public override renderDebugTo(ctx: CanvasRenderingContext2D, vr: ViewportRegion) {
        if(!this.isVisible(vr)) {
            return;
        }
        let radius = 2;
        let p = Math.PI * 2;
        // Draw hitbox points
        ctx.beginPath();
        for(let hitbox of this.el.hitboxes) {
            for(let i = 0; i < hitbox.length; i += 2) {
                ctx.moveTo(hitbox[i] + radius, hitbox[i + 1]);
                ctx.arc(hitbox[i], hitbox[i + 1], radius, 0, p);
            }
        }
        ctx.fill();
        // Draw bounding box
        super.renderDebugTo(ctx, vr);
    }

}

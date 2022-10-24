import { drawRect } from "../Utilities";
import { RasterCache } from "../DiagramElement/RasterCache";
import { ViewportRegion } from "../DiagramElement";
import { DictionaryBlockModel } from "../DiagramModelTypes";
import { DiagramObjectView } from ".";

export class DictionaryBlockView extends DiagramObjectView {
    
    /**
     * The underlying model.
     */
    public override el: DictionaryBlockModel;

    /**
     * The block's top-left x coordinate.
     */
    public tlx: number;

    /**
     * The block's top-left y coordinate.
     */
    public tly: number;


    /**
     * Creates a new {@link DictionaryBlockView}.
     * @param el
     *  The underlying model.
     * @param rasterCache
     *  The view's raster cache.
     */
    constructor(el: DictionaryBlockModel, rasterCache: RasterCache) {
        super(el, rasterCache);
        this.el = el;
        this.tlx = 0;
        this.tly = 0;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Movement  //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Moves the object relative to its current position. 
     * @param dx
     *  The change in x.
     * @param dy 
     *  The change in y.
     * @param attrs
     *  If specified, this set of attributes will override the object's
     *  underlying attributes.
     */
    public override moveBy(dx: number, dy: number, attrs?: number) {
        super.moveBy(dx, dy);
        // Move top left corner
        this.tlx += dx;
        this.tly += dy;
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
        let { tlx: x, tly: y } = this;
        let { 
            body, 
            head,
            select_outline: so,
            border_radius: br,
        } = this.el.style;
        let {
            width: w,
            height: h,
            headerHeight: hh,
            text
        } = this.el.layout;
        let isSplitBlock = hh !== h;

        // Draw body
        let bf, bs;
        if(isSplitBlock) {
            bf = body.fill_color
            bs = body.stroke_color
        } else {
            bf = head.fill_color
            bs = head.stroke_color
        }
        ctx.lineWidth = 1.1;
        drawRect(ctx, x, y, w, h, br);
        if(dsx | dsy) {
            ctx.shadowOffsetX = dsx + (0.5 * vr.scale);
            ctx.shadowOffsetY = dsy + (0.5 * vr.scale);
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
        if(isSplitBlock) {
            drawRect(ctx, x, y, w, hh, { tr: br, tl: br });
            ctx.fillStyle = head.fill_color;
            ctx.strokeStyle = head.stroke_color;
            ctx.fill();
            ctx.stroke();
        }

        // Draw text
        for(let set of text) {
            ctx.font = set.font.css;
            ctx.fillStyle = set.color;
            for(let text of set.text) {
                ctx.fillText(text.t, x + text.x, y + text.y)
            }
        }

        if(this.el.isSelected(attrs)) {
            
            // Init
            let { 
                color,
                padding: p,
                border_radius: br
            } = so;
            p += 1;

            // Draw select border
            drawRect(ctx, x - p, y - p, w + p*2, h + p*2, br, 1);
            ctx.strokeStyle = color;
            ctx.stroke();

        } else if(this.el.isHovered(attrs)) {

            // Init
            let {
                color,
                size
            } = this.el.style.anchor_markers;
            
            // Draw anchors
            super.renderTo(ctx, vr, dsx, dsy);    

            // Draw anchor markers
            ctx.strokeStyle = color;
            ctx.beginPath();
            for(let o of this.children) {
                ctx.moveTo(o.x - size, o.y - size);
                ctx.lineTo(o.x + size, o.y + size);
                ctx.moveTo(o.x + size, o.y - size);
                ctx.lineTo(o.x - size, o.y + size);
            }
            ctx.stroke();
        
        }

    }


    ///////////////////////////////////////////////////////////////////////////
    //  3. Model Synchronization  /////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Synchronizes the view with the underlying model.
     * @returns
     *  The view.
     */
    public override updateView(): DictionaryBlockView {
        // Update view
        super.updateView();
        // Update top-left corner
        this.tlx = this.el.boundingBox.xMin + this.el.layout.dx;
        this.tly = this.el.boundingBox.yMin + this.el.layout.dy;
        // Return
        return this;
    }

}

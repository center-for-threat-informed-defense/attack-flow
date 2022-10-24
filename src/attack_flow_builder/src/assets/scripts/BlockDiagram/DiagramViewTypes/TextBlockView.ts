import { drawRect } from "../Utilities";
import { RasterCache, ViewportRegion } from "../DiagramElement";
import { TextBlockModel } from "../DiagramModelTypes";
import { DiagramObjectView } from ".";

export class TextBlockView extends DiagramObjectView {
    
    /**
     * The underlying model.
     */
    public override el: TextBlockModel;

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
    constructor(el: TextBlockModel, rasterCache: RasterCache) {
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
            text,
            fill_color,
            stroke_color,
            select_outline: so,
            border_radius: br,
        } = this.el.style;
        let {
            width: w,
            height: h,
            text: placements
        } = this.el.layout;

        // Draw body
        ctx.lineWidth = 1.1;
        if(dsx | dsy){
            drawRect(ctx, x, y, w, h, br);
            ctx.shadowOffsetX = dsx + (0.5 * vr.scale);
            ctx.shadowOffsetY = dsy + (0.5 * vr.scale);
            ctx.fillStyle = fill_color;
            ctx.strokeStyle = stroke_color;
            ctx.fill();
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.stroke();
        } else {
            drawRect(ctx, x, y, w, h, br);
            ctx.fillStyle = fill_color;
            ctx.strokeStyle = stroke_color;
            ctx.fill();
            ctx.stroke();
        }

        // Draw text
        ctx.font = text.font.css;
        ctx.fillStyle = text.color;
        for(let p of placements) {
            ctx.fillText(p.t, x + p.x, y + p.y)
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
    public override updateView(): TextBlockView {
        // Update view
        super.updateView();
        // Update top-left corner
        this.tlx = this.el.boundingBox.xMin + this.el.layout.dx;
        this.tly = this.el.boundingBox.yMin + this.el.layout.dy;
        // Return
        return this;
    }

}

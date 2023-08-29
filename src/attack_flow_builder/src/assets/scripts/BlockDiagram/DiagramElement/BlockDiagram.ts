import * as d3 from "d3";
import { Browser } from "../../Browser";
import { RasterCache } from "./RasterCache";
import { ViewportRegion } from "./ViewportRegion";
import { CameraLocation } from "./Camera";
import { DiagramObjectMover } from "./DiagramObjectMover";
import { DiagramDisplaySettings } from "./DiagramDisplaySettings";
import { 
    resizeAndTransformContext,
    resizeContext,
    transformContext } from "../Utilities/Canvas";
import {
    EventEmitter,
    MouseClick
} from "../Utilities";
import {
    DiagramLineModel,
    DiagramAnchorModel,
    DiagramObjectModel,
    PageModel,
    DiagramAnchorableModel
} from "../DiagramModelTypes";
import {
    DiagramAnchorableView,
    DiagramLineEndingView,
    DiagramLineView,
    DiagramObjectView,
    PageView
} from "../DiagramViewTypes";
import {
    Alignment,
    Cursor,
    PositionSetByUser
} from "../Attributes";

export class BlockDiagram extends EventEmitter<DiagramEvents> {

    /**
     * The viewport's padding.
     */
    private static readonly VIEWPORT_PADDING = 0;

    /**
     * When a zoom action occurs, this constant defines that amount of time to
     * wait (in milliseconds) before the raster cache is updated.
     */
    private static readonly RASTER_CACHE_UPDATE_DELAY = 100;


    /**
     * The diagram's canvas.
     */
    private _canvas: CanvasSelection | null;

    /**
     * The diagram's context.
     */
    private _context: CanvasRenderingContext2D | null;
    
    /**
     * The diagram's display settings.
     */
    private _display: DiagramDisplaySettings;

    /**
     * The diagram container's height.
     */
    private _elHeight: number;

    /**
     * The diagram container's width.
     */
    private _elWidth: number;

    /**
     * The object currently being hovered over.
     */
    private _hovObj: DiagramObjectModel | undefined;

    /**
     * The diagram's object mover.
     */
    private _mover: DiagramObjectMover;

    /**
     * If the current layout is locked or not.
     */
    private _layoutLocked: boolean;

    /**
     * The diagram's current page.
     */
    private _page: PageView;

    /**
     * The id of the last animation frame request.
     */
    private _rafId: number;

    /**
     * The diagram's raster cache.
     */
    private _rasterCache: RasterCache;

    /**
     * An observer that monitors the size of the diagram's container.
     */
    private _resizeObserver: ResizeObserver | null;
    
    /**
     * The context's current transform.
     */
    private _transform: d3.ZoomTransform;

    /**
     * The context's viewport.
     */
    private _viewport: ViewportRegion;
    
    /**
     * The id of the late zoom timeout request.
     */
    private _ztoId: number;

    /**
     * The diagram's zoom behavior.
     */
    private _zoom: CanvasZoomBehavior;


    /**
     * Creates a new {@link BlockDiagram}.
     */
    constructor() {
        super();
        let page = PageModel.createDummy();
        let cache = new RasterCache();
        this._canvas = null;
        this._context = null;
        this._display = new DiagramDisplaySettings();
        this._elWidth = 0;
        this._elHeight = 0;
        this._mover = new DiagramObjectMover(...page.grid);
        this._layoutLocked = false;
        this._page = page.createView(cache); 
        this._rafId = 0;
        this._rasterCache = cache;
        this._resizeObserver = null;
        this._transform = d3.zoomIdentity;
        this._viewport = new ViewportRegion();
        this._ztoId = 0;
        this._zoom =  d3.zoom<HTMLCanvasElement, unknown>()
            .scaleExtent([1 / 8, 6])
            .on("zoom", this.onCanvasZoom.bind(this))
            .on("end", () => this.onCanvasZoomEnd());
        // `null` ensures cursor is updated immediately
        this._hovObj = null as any;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Inject and Destroy  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Injects the diagram into a container and updates the view.
     * @param container
     *  The container to inject the diagram into.
     */
    public inject(container: HTMLElement): void {

        // Set sizing
        this._elWidth = container.clientWidth;
        this._elHeight = container.clientHeight;

        // Setup canvas & context
        this._canvas = d3.select(container)
            .append("canvas")
                .attr("style", "display:block;")
            .on("mousemove", (event) => {
                this.onHoverSubject(...d3.pointer(event));
            })
            .on("contextmenu", (e: any) => e.preventDefault());
        this._context = this._canvas.node()!.getContext("2d", { alpha: false });

        // Size context
        resizeContext(this._context!, this._elWidth, this._elHeight);

        // Configure resize observer
        this._resizeObserver = new ResizeObserver(
            entries => this.onCanvasResize(entries[0].target)
        );
        this._resizeObserver.observe(container);

        // Configure dppx change behavior
        Browser.on("dppx-change", this.onDevicePixelRatioChange, this);

        // Configure canvas interactions
        this._canvas
            .call(d3.drag<HTMLCanvasElement, unknown>()
                .filter(() => true)
                .subject(this.onSelectSubject.bind(this))
                .on("start", this.onObjectDragStarted.bind(this))
                .on("drag", this.onObjectDragged.bind(this))
                .on("end", this.onObjectDragEnded.bind(this))
            ).call(this._zoom);
        
    }

    /**
     * Removes the diagram from the container and removes all event listeners.
     */
    public destroy() {
        this._canvas?.remove();
        this._canvas = null;
        this._context = null;
        this.removeAllListeners();
        this._resizeObserver?.disconnect();
        Browser.removeEventListenersWithContext(this);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Rendering  /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Enables/Disables the grid.
     * @param display
     *  [true]
     *   Enables the grid.
     *  [false]
     *   Disables the grid.
     */
    public setGridDisplay(display: boolean) {
        this._display.showGrid = display;
    }

    /**
     * Enables/Disables shadows.
     * @param display
     *  [true]
     *   Enables shadows.
     *  [false]
     *   Disables shadows.
     */
    public setShadowsDisplay(display: boolean) {
        this._display.showShadows = display;        
    }

    /**
     * Enables/Disables the debug display. If enabled, the diagram will display
     * additional information that can be used to debug issues with the block
     * diagram API.
     * @param display
     *  [true]
     *   Enables debug mode.
     *  [false]
     *   Disables debug mode.
     */
    public setDebugDisplay(display: boolean) {
        this._display.showDebug = display;
    }

    /**
     * Sets the diagram's supersampling anti-aliasing (SSAA) level.
     * @param k
     *  The supersampling scale.
     */
    public setSsaaScale(k: number) {
        this._display.ssaaScale = k;
        this._rasterCache.setScale(k);
    }

    /**
     * Sets the scale level shadows disable at.
     * @param k
     *  The scale level shadows disable at.
     */
    public setShadowsDisableAt(k: number) {
        this._display.shadowsDisableAt = k;
    }

    /**
     * Renders the block diagram.
     */
    public render() {
        if (this._rafId != 0)
            return;
        this._rafId = requestAnimationFrame(() => {
            this._rafId = 0;
            this.executeRenderPipeline();
        })
    }

    /**
     * Executes the diagram rendering pipeline.
     */
    private executeRenderPipeline() {
        // Return if there's no context to render to
        if(this._context === null)
            return;
        let d = this._display;
        // Render page surface
        this._page.renderPageSurfaceTo(this._context, this._viewport, d.showGrid);
        // Render page contents
        if(d.showShadows && d.shadowsDisableAt <= this._transform.k) {
            // With drop shadow
            this._page.renderTo(this._context, this._viewport);
        } else {
            // Without drop shadow
            this._page.renderTo(this._context, this._viewport, 0, 0);
        }
        // Render debug display
        if(d.showDebug) {
            this._page.renderDebugTo(this._context, this._viewport);
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  3. Canvas Interactions  ///////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Canvas hover behavior.
     * @param x
     *  The pointer's position on the x-axis.
     * @param y
     *  The pointer's position on the y-axis.
     * @param cursor
     *  The cursor to use.
     *  (Default: The subject's cursor)
     */
    private onHoverSubject(x: number, y: number, cursor?: number) {
        x = this._transform.invertX(x);
        y = this._transform.invertY(y);
        let hovObj = this._page.el.getObjectAt(x, y);
        if(this._hovObj !== hovObj) {
            // Update hover object
            this._hovObj = hovObj;
            // Pick cursor
            cursor = cursor ?? hovObj?.getCursor() ?? Cursor.Default;
            // Emit
            this.emit("object-hover", hovObj, cursor);
        }
    }

    /**
     * Canvas click behavior.
     * @param event
     *  The click event.
     * @returns
     *  The drag action to perform or `undefined` if no object was clicked.
     */
     private onSelectSubject(event: any): DragAction | undefined {
        let evt = event.sourceEvent;
        let x = this._transform.invertX(event.x);
        let y = this._transform.invertY(event.y);
        let obj = this._page.el.getObjectAt(x, y);
        let rc = evt.button === MouseClick.Right;
        let mv: DiagramObjectView[];

        // If no object:
        if(!obj) {
            this.emit("canvas-click", evt, event.x, event.y);
            return undefined; 
        }
        
        // If object is an anchor:
        if(obj instanceof DiagramAnchorModel) {
            // Select canvas
            this.emit("canvas-click", evt, event.x, event.y);
            if(rc) {
                return undefined;
            }
            // Create line
            let line = obj.makeLine();
            // Configure line
            let x = obj.boundingBox.xMid;
            let y = obj.boundingBox.yMid;
            line.srcEnding.moveTo(x, y);
            line.trgEnding.moveTo(x, y);
            // Create line view
            let view = line
                .createView(this._rasterCache)
                .updateView() as DiagramLineView;
            // Initiate line move
            return {
                type: DragActionType.CreateLine,
                line: view,
                parent: this._page, 
                anchor: obj,
                obj: view.trgEnding
            };
        }

        // If object is child of line:
        if(obj.parent instanceof DiagramLineModel) { 
            // Select line
            this.emit("object-click", evt, obj.parent, event.x, event.y);
            if(rc) {
                return undefined;
            }
            // Move the child
            mv = [this._page.lookup(obj.id)!];
        } 
        
        // If any other object type:
        else {
            // Select object
            this.emit("object-click", evt, obj, event.x, event.y);
            if(rc) {
                return undefined;
            }
            // Move the current selection
            mv = this._page.selects;   
        }

        // Initiate object move
        if(mv[0] instanceof DiagramAnchorableView && mv.length === 1) {
            return { type: DragActionType.MoveAnchorable, obj: mv[0] }
        } else {
            return { type: DragActionType.Move, objs: mv }
        }

    }

    /**
     * Object drag start behavior.
     * @param event
     *  The drag event.
     */
    private onObjectDragStarted(event: any) {
        /**
         * Developers Note:
         * Wait until all mouse related callbacks have fired before locking the
         * layout. This gives applications using this library a chance to
         * update the layout in other handlers before the drag event officially
         * starts. Ideally, an application shouldn't update the layout during a
         * drag operation. I'll refactor this in the future to improve the
         * coordination constructs between library and application.
         */
        setTimeout(() => {
            this._layoutLocked = true;
            let s = event.subject as DragAction;
            let cx = this._transform.invertX(event.x);
            let cy = this._transform.invertY(event.y);
            let ox = 0;
            let oy = 0;
            let al = Alignment.Free;
            let an = undefined;
            switch(s.type) {
                case DragActionType.Move:
                    for(let obj of s.objs) {
                        ox += obj.x;
                        oy += obj.y;
                        al = Math.max(al, obj.el.getAlignment());
                    }
                    ox /= s.objs.length;
                    oy /= s.objs.length;
                    break;
                case DragActionType.CreateLine:
                    s.parent.children.push(s.line);
                case DragActionType.MoveAnchorable:
                    ox = s.obj.x;
                    oy = s.obj.y;
                    al = s.obj.el.getAlignment();
                    an = this._page.el.anchorCache;
                    break;
            }
            this._mover.reset(al, cx, cy, ox, oy, an);
        }, 0);
    }

    /**
     * Object dragged behavior.
     * @param event
     *  The drag event.
     */
    private onObjectDragged(event: any) {
        let s = event.subject as DragAction;
        // Calculate delta
        this._mover.updateDelta(
            event.dx / this._transform.k,
            event.dy / this._transform.k
        );
        // Move elements
        let attrs;
        switch(s.type) {
            case DragActionType.Move:
                for(let obj of s.objs) {
                    attrs = obj.fakePositionSetByUser(PositionSetByUser.True);
                    obj.moveBy(this._mover.dx, this._mover.dy, attrs);
                }
                break;
            case DragActionType.CreateLine:
                s.obj.el.moveBy(this._mover.dx, this._mover.dy);
            case DragActionType.MoveAnchorable:
                this.onHoverSubject(event.x, event.y, s.obj.el.getCursor());
                attrs = s.obj.fakePositionSetByUser(PositionSetByUser.True);
                s.obj.moveBy(this._mover.dx, this._mover.dy, attrs);
                break;
        }
        // Render
        this.render();
    }

    /**
     * Object drag end behavior.
     * @param event
     *  The drag event.
     */
    private onObjectDragEnded(event: any) {
        this._layoutLocked = false;
        let s = event.subject as DragAction;
        let tdx = this._mover.odx;
        let tdy = this._mover.ody;
        switch(s.type) {
            case DragActionType.Move:
                if(!(tdx || tdy)) {
                    // If no movement, bail
                    return;
                }
                let ids = s.objs.map((o: any) => o.el);
                this.emit("object-move", ids, tdx, tdy);
                break;
            case DragActionType.MoveAnchorable:
                if(!(tdx || tdy)) {
                    // If no movement, bail
                    return;
                }
                if(this._mover.anchor) {
                    let anchor = this._mover.anchor;
                    let object = s.obj.el;
                    this.emit("object-attach", object, anchor);
                } else if(s.obj.el.isAttached()) {
                    let object = s.obj.el;
                    this.emit("object-detach", object, tdx, tdy);
                } else {
                    let ids = [s.obj.el];
                    this.emit("object-move", ids, tdx, tdy);
                }
                break;
            case DragActionType.CreateLine:
                if((tdx || tdy) && s.anchor !== this._mover.anchor) {
                    let obj = s.line.el;
                    let par = s.parent.el;
                    let src = s.anchor;
                    let trg = this._mover.anchor;
                    this.emit("line-create", obj, par, src, trg);
                } else {
                    // If no movement, reset view and bail
                    this.updateView();
                    this.render();
                }
                break;
        }
    }

    /**
     * Canvas zoom behavior.
     * @param event
     *  The zoom event.
     */
    private onCanvasZoom(event: any) {
        // Update cache
        if (this._transform.k !== event.transform.k) {
            clearTimeout(this._ztoId);
            this._ztoId = setTimeout(() => {
                let k = this._transform.k * this._display.ssaaScale;
                if(this._rasterCache.getScale() !== k) {
                    this._rasterCache.setScale(k);
                    this.render();
                }
            }, BlockDiagram.RASTER_CACHE_UPDATE_DELAY)
        }
        // Update transform
        this._transform = event.transform;
        // Update viewport
        this.updateViewportBounds();
        if(this._context) {
            transformContext(
                this._context, this._transform.k,
                this._transform.x, this._transform.y
            );
        }
        // If no source event, then we are already
        // running inside a requestAnimationFrame()
        if(event.sourceEvent === null) {
            // If no render scheduled, run render pipeline
            if(this._rafId === 0) {
                this.executeRenderPipeline();
            }
        } else {
            this.render();
        }
    }

    /**
     * Canvas zoom end behavior.
     */
    private onCanvasZoomEnd() {
        this.emit("view-transform", 
            this._transform.x,
            this._transform.y,
            this._transform.k,
            this._elWidth,
            this._elHeight
        );
    }

    /**
     * Canvas resize behavior.
     * @param el
     *  The block diagram's container.
     */
    private onCanvasResize(el: Element) {
        let newWidth = el.clientWidth;
        let newHeight = el.clientHeight;
        // Center viewport
        (this._transform as any).x += (newWidth - this._elWidth) / 2;
        (this._transform as any).y += (newHeight - this._elHeight) / 2;
        // Update dimensions
        this._elWidth = newWidth;
        this._elHeight = newHeight;
        // Update viewport
        this.updateViewportBounds();
        // Adjust viewport
        if(this._context) {
            resizeAndTransformContext(
                this._context, this._elWidth, this._elHeight,
                this._transform.k, this._transform.x, this._transform.y
            )
        }
        // Immediately redraw diagram to context, if possible
        if(this._context)
            this.executeRenderPipeline();
    }

    /**
     * Device pixel ratio change behavior.
     * @remarks
     *  The device's pixel ratio can change when dragging the window to and
     *  from a monitor with high pixel density (like Apple Retina displays).
     */
    private onDevicePixelRatioChange() {
        // Update cache
        let k = this._transform.k * this._display.ssaaScale;
        this._rasterCache.setScale(k);
        if(!this._context) {
            return;
        }
        // Resize and transform context
        resizeAndTransformContext(
            this._context, this._elWidth, this._elHeight,
            this._transform.k, this._transform.x, this._transform.y
        )
        // Render
        this.render();
    }

    /**
     * Recalculates the viewport's bounds based on the container's current
     * dimensions.
     */
    private updateViewportBounds() {
        let t = this._transform;
        let padding = BlockDiagram.VIEWPORT_PADDING;
        this._viewport.xMin = Math.round(t.invertX(-padding));
        this._viewport.xMax = Math.round(t.invertX(this._elWidth + padding));
        this._viewport.yMin = Math.round(t.invertY(-padding));
        this._viewport.yMax = Math.round(t.invertY(this._elHeight + padding));
        this._viewport.scale = t.k;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  4. Data  //////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    
    /**
     * Configures the diagram's current page.
     * @param page
     *  The diagram page.
     */
    public setPage(page: PageModel) {
        // Update page
        this._page = page.createView(this._rasterCache);
        // Update mover
        this._mover = new DiagramObjectMover(...page.grid);
    }

    /**
     * Syncs the view with the underlying model.
     */
    public updateView() {
        if(!this._layoutLocked) {
            this._page.updateView();
        }
    }

    /**
     * Sets the camera's location.
     * @param location
     *  The camera's new location.
     * @param animate
     *  The length of time (in milliseconds) the camera move animation takes.
     *  (Default: 1000)
     */
    public setCameraLocation(location: CameraLocation, animate: number = 1000) {
        if(!this._canvas)
            return;
        let k = location.k;
        let x = Math.round((this._elWidth / 2) - (location.x * k));
        let y = Math.round((this._elHeight / 2) - (location.y * k))
        // Move camera
        this._canvas.transition()
            .duration(animate)
            .call(this._zoom.transform, 
                d3.zoomIdentity.translate(x, y).scale(k)
            )
    }

}


///////////////////////////////////////////////////////////////////////////////
//  Internal Types  ///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


// D3 types
type CanvasZoomBehavior = 
    d3.ZoomBehavior<HTMLCanvasElement, unknown>;
type CanvasSelection = 
    d3.Selection<HTMLCanvasElement, unknown, null, undefined>;

// Event types
interface DiagramEvents {
    "object-hover"  : (
        obj: DiagramObjectModel | undefined, cursor: number
    ) => void;
    "object-click"  : (
        event: PointerEvent, obj: DiagramObjectModel, x: number, y: number
    ) => void;
    "canvas-click"  : (
        event: PointerEvent, x: number, y: number
    ) => void;
    "object-move"   : (
        objs: DiagramObjectModel[], dx: number, dy: number
    ) => void;
    "object-attach" : (
        obj: DiagramAnchorableModel, anchor: DiagramAnchorModel
    ) => void;
    "object-detach" : (
        obj: DiagramAnchorableModel, dx: number, dy: number
    ) => void;
    "line-create"   : (
        obj: DiagramLineModel, parent: DiagramObjectModel, 
        src: DiagramAnchorModel, trg?: DiagramAnchorModel
    ) => void;
    "view-transform": (
        x: number, y: number, k: number, w: number, h: number
    ) => void
}

// Drag Actions
type DragAction
    = MoveDragAction
    | MoveAnchorableDragAction
    | CreateLineDragAction;


enum DragActionType { 
    Move,
    MoveAnchorable,
    CreateLine
}

type MoveDragAction = {

    /**
     * The move type.
     */
    type: DragActionType.Move,
    
    /**
     * The objects to move.
     */
    objs: DiagramObjectView[]

}

type MoveAnchorableDragAction = {

    /**
     * The move type.
     */
    type: DragActionType.MoveAnchorable,

    /**
     * The anchorable to move.
     */
    obj: DiagramAnchorableView
}

type CreateLineDragAction = {

    /**
     * The move type.
     */
    type: DragActionType.CreateLine,
    
    /**
     * The line.
     */
    line: DiagramLineView,

    /**
     * The line's parent.
     */
    parent: DiagramObjectView,

    /**
     * The anchor that created the line.
     */
    anchor: DiagramAnchorModel, 

    /**
     * The line ending to move.
     */
    obj: DiagramLineEndingView

}

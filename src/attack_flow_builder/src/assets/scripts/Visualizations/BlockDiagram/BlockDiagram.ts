import * as d3 from "d3";
import { PageView } from "./ViewTypes/PageView";
import { PageModel } from "./ModelTypes/PageModel";
import { MouseClick } from "../../WebUtilities/WebTypes";
import { EventEmitter } from "../EventEmitter";
import { BoundingRegion } from "../BoundingRegion";
import { DiagramAnchorView } from "./ViewTypes/BaseTypes/DiagramAnchorView";
import { DiagramObjectModel } from "./ModelTypes/BaseTypes/DiagramObjectModel";
import { RasterCache } from "./RasterCache";

export class BlockDiagram {

    private static readonly VIEWPORT_PADDING = 150;

    // TODO: Document each field

    // Block diagram fields
    private _zoom: CanvasZoomBehavior | null;
    private _rafId = 0;
    private _canvas: CanvasSelection | null;
    private _context: CanvasRenderingContext2D | null;
    private _elWidth: number;
    private _elHeight: number;
    private _viewport: BoundingRegion
    private _transform: any;
    private _rasterCache: RasterCache;
    private _onResizeObserver: ResizeObserver | null;
   
    // Data fields
    private _page: PageView;

    // Event Fields
    private _events: EventEmitter;

    /**
     * Creates a new Diagram.
     */
    constructor() {
        this._zoom = null;
        this._rafId = 0;
        this._canvas = null;
        this._context = null;
        this._elWidth = 0;
        this._elHeight = 0;
        this._viewport = new BoundingRegion();
        this._rasterCache = new RasterCache();
        this._onResizeObserver = null;
        this._page = PageModel.createDummy().createView(this._rasterCache);
        this._events = new EventEmitter();
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Inject and Destroy  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Configures the diagram's current page.
     * @param page
     *  The diagram page.
     */
    public setPage(page: PageModel) {
        this._page = page.createView(this._rasterCache);
    }

    /**
     * Injects the diagram into a container.
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
                .attr("width", this._elWidth)
                .attr("height", this._elHeight)
            .on("contextmenu", (e: any) => e.preventDefault());
        this._context = this._canvas.node()!.getContext("2d", { alpha: false });

        // Configure resize observer
        this._onResizeObserver = new ResizeObserver(
            entries => this.onCanvasResize(entries[0].target)
        );
        this._onResizeObserver.observe(container);

        // Configure zoom behavior
        this._zoom = d3.zoom<HTMLCanvasElement, unknown>()
            .scaleExtent([1 / 10, 6])
            .on("zoom", this.onCanvasZoomed.bind(this));

        // Configure canvas interactions
        this._canvas
            .call(d3.drag<HTMLCanvasElement, unknown>()
                .filter(() => true)
                .subject(this.onSelectSubject.bind(this))
                .on("start", this.onObjectDragStarted.bind(this))
                .on("drag", this.onObjectDragged.bind(this))
                .on("end", this.onObjectDragEnded.bind(this))
            ).call(this._zoom);


        // Pan canvas to center
        let xCenterOffset = container.clientWidth / 2;
        let yCenterOffset = container.clientHeight / 2;
        this._canvas.call(this._zoom.translateBy, xCenterOffset, yCenterOffset);
        
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Event Subscription  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Adds an event listener to the diagram.
     * @param event
     *  The event to subscribe to.
     * @param callback
     *  The function to call once the event has fired.
     */
    public on<K extends keyof DiagramEvents>(event: K, callback: DiagramEvents[K]): void {
        this._events.on(event, callback);
    }

    /**
     * Adds an event listener to the diagram that will be fired once and then
     * removed.
     * @param event
     *  The event to subscribe to.
     * @param callback
     *  The function to call once the event has fired. 
     */
    public once<K extends keyof DiagramEvents>(event: K, callback: DiagramEvents[K]): void {
        this._events.once(event, callback);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  3. Rendering  /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


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

        // Clear viewport
        this._context.fillStyle = "#ff0000";
        this._context.fillRect(
            this._viewport.xMin,  this._viewport.yMin,
            this._viewport.xMax - this._viewport.xMin,
            this._viewport.yMax - this._viewport.yMin
        );

        // Render the page
        this._page.renderTo(this._context, this._viewport);

    }


    ///////////////////////////////////////////////////////////////////////////
    //  4. Canvas Interactions  ///////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Canvas click behavior. If there exists an object at the clicked 
     * location, return it, otherwise return undefined.
     * @param event
     *  The click event.
     * @returns
     *  The clicked object or undefined if no object was clicked.
     */
     private onSelectSubject(event: any): DiagramObjectModel | undefined {
        let x = this._transform.invertX(event.x);
        let y = this._transform.invertY(event.y);
        let evt = event.sourceEvent;
        let el = this._page.el.getObjectAt(x, y);
        if(el) {
            this._events.emit("object-click", evt, el, event.x, event.y);
            // Return entire selection group here so it can be moved in the drag callbacks
            return evt.button === MouseClick.Right ? undefined : el;
        }
        this._events.emit("canvas-click", evt, event.x, event.y);
        return undefined;
    }

    /**
     * Object drag start behavior.
     * @param event
     *  The drag event.
     */
    private onObjectDragStarted(event: any) {
        console.log("click object")
        //event.subject.fx = event.x;
        //event.subject.fy = event.y;
        this.render();
    }

    /**
     * Object dragged behavior.
     * @param event
     *  The drag event.
     */
    private onObjectDragged(event: any) {
        console.log("move object");
        // event.subject.fx = event.subject.x + (event.dx / this._transform.k);
        // event.subject.fy = event.subject.y + (event.dy / this._transform.k);
        // event.subject.x = event.subject.fx;
        // event.subject.y = event.subject.fy;
        this.render();
    }

    /**
     * Object drag end behavior.
     * @param event
     *  The drag event.
     */
    private onObjectDragEnded(event: any) {
        console.log("end click object");
        // if (!event.active)
        //     this._simulation.alphaTarget(0);
        // if (!(event.subject as GraphNode).isFrozen) {
        //     event.subject.fx = null;
        //     event.subject.fy = null;
        // }
        // Raise move event here
    }

    /**
     * Canvas zoom behavior.
     * @param event
     *  The zoom event.
     */
    private onCanvasZoomed(event: any) {
        // Update cache
        // if (this._transform.k !== event.transform.k) {
        //     clearTimeout(this._zoomTimeoutId);
        //     this._zoomTimeoutId = setTimeout(() => {
        //         let k = this._transform.k * this._ssaaScale;
        //         if(this._nodeRasterCache.getScale() !== k) {
        //             this._nodeRasterCache.scale(k);
        //             this._clusterRasterCache.scale(k);
        //             this.render();
        //         }
        //     }, ForceDirectedNetwork.RASTER_CACHE_UPDATE_DELAY)
        // }
        // Update transform
        this._transform = event.transform;
        // Update viewport
        this.updateViewportBounds();
        this._context?.setTransform(
            this._transform.k, 0, 0,
            this._transform.k, this._transform.x, this._transform.y
        );
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
     * Canvas resize behavior.
     * @param el
     *  The block diagram's container.
     */
    private onCanvasResize(el: Element) {
        let newWidth = el.clientWidth;
        let newHeight = el.clientHeight;
        // Center viewport
        this._transform.x += (newWidth - this._elWidth) / 2;
        this._transform.y += (newHeight - this._elHeight) / 2;
        // Update dimensions
        this._elWidth = newWidth;
        this._elHeight = newHeight;
        this._canvas
            ?.attr("width", this._elWidth)
            ?.attr("height", this._elHeight);
        // Update viewport
        this.updateViewportBounds();
        // Adjust viewport
        this._context?.setTransform(
            this._transform.k, 0, 0,
            this._transform.k, this._transform.x, this._transform.y
        );
        // Immediately redraw diagram to context, if possible
        if(this._context)
            this.executeRenderPipeline();
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
    }


    ///////////////////////////////////////////////////////////////////////////
    //  4. Data  //////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    
    /**
     * Synchronizes the diagram with the underlying model.
     */
    public updateView() {
        this._page.updateView();
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
    "object-click" : (event: PointerEvent, obj: DiagramObjectModel, x: number, y: number) => void;
    "canvas-click" : (event: PointerEvent, x: number, y: number) => void;
}

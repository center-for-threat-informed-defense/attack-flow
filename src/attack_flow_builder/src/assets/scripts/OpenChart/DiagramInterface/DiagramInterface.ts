import * as d3 from "d3";
import { Screen } from "./Screen";
import { MouseClick } from "./MouseClick";
import { EventEmitter } from "@OpenChart/Utilities";
import { DisplaySettings } from "./DisplaySettings";
import { Cursor, ViewportRegion } from "@OpenChart/DiagramView";
import { resizeAndTransformContext, resizeContext, transformContext } from "./Context";
import type { DragHandler } from "./DragHandler";
import type { DiagramInterfaceEvents } from "./DiagramInterfaceEvents";
import type { CanvasSelection, CanvasZoomBehavior } from "./D3Types";
import type { CameraLocation, CanvasView, DiagramObjectView } from "@OpenChart/DiagramView";

export class DiagramInterface<T> extends EventEmitter<DiagramInterfaceEvents<T>> {

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
     * The interface's display settings.
     */
    public readonly settings: DisplaySettings;


    /**
     * The interface's root object.
     */
    private readonly root: CanvasView;

    /**
     * The interface's canvas.
     */
    private readonly canvas: CanvasSelection;

    /**
     * The interface's context.
     */
    private readonly context: CanvasRenderingContext2D;

    /**
     * The interface's height.
     */
    private elHeight: number;

    /**
     * The interface's width.
     */
    private elWidth: number;

    /**
     * The object currently being hovered over.
     */
    private hoveredObject: DiagramObjectView | undefined | null;

    /**
     * The context's current transform.
     */
    private transform: d3.ZoomTransform;

    /**
     * The context's viewport.
     */
    private viewport: ViewportRegion;

    /**
     * The diagram's zoom behavior.
     */
    private zoom: CanvasZoomBehavior;

    /**
     * The interface's drag handlers.
     */
    private dragHandlers: Map<Function, DragHandler<T>>;

    private activeDragHandler: DragHandler<T> | null;


    /**
     * The id of the last animation frame request.
     */
    private _rafId: number;

    /**
     * An observer that monitors the size of the diagram's container.
     */
    private _resizeObserver: ResizeObserver | null;

    /**
     * The id of the late zoom timeout request.
     */
    private _ztoId: number;


    /**
     * Creates a new {@link DiagramInterface}.
     * @param root
     *  The diagram's root object.
     */
    constructor(root: CanvasView) {
        super();
        this.root = root;
        this.canvas =
        this.canvas = d3.select(document.createElement("canvas"));
        this.context = this.canvas.node()!.getContext("2d", { alpha: false })!;
        this.elWidth = 0;
        this.elHeight = 0;
        this.settings = new DisplaySettings();
        this.viewport = new ViewportRegion();
        this.transform = d3.zoomIdentity;
        this.zoom =  d3.zoom<HTMLCanvasElement, unknown>()
            .scaleExtent([1 / 8, 6])
            .on("zoom", this.onCanvasZoom.bind(this))
            .on("end", () => this.onCanvasZoomEnd());
        // `null` ensures cursor is updated immediately
        this.hoveredObject = null;

        this.dragHandlers = new Map();
        this.activeDragHandler = null;

        this._rafId = 0;
        this._resizeObserver = null;
        this._ztoId = 0;

        // Configure canvas
        this.canvas
            .attr("style", "display:block;")
            .on("mousemove", (event) => {
                this.onHoverSubject(...d3.pointer(event));
            })
            .on("contextmenu", (e: Event) => e.preventDefault());
        // Configure canvas interactions
        this.canvas
            .call(d3.drag<HTMLCanvasElement, unknown>()
                .filter(() => true)
                .subject(this.onSelectSubject.bind(this))
                .on("start", this.onObjectDragStarted.bind(this))
                .on("drag", this.onObjectDragged.bind(this))
                .on("end", this.onObjectDragEnded.bind(this))
            ).call(this.zoom);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Inject and Destroy  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Mounts the diagram onto a container and updates the view.
     * @param container
     *  The container to inject the diagram into.
     */
    public mount(container: HTMLElement): void {
        // Set sizing
        this.elWidth = container.clientWidth;
        this.elHeight = container.clientHeight;
        // Configure resize observer
        this._resizeObserver = new ResizeObserver(
            entries => this.onCanvasResize(entries[0].target)
        );
        this._resizeObserver.observe(container);
        // Mount canvas
        container.appendChild(this.canvas.node()!);
        // Size context
        resizeContext(this.context, this.elWidth, this.elHeight);
        // Configure dppx change behavior
        Screen.on("dppx-change", this.onDevicePixelRatioChange, this);
    }

    /**
     * Removes the diagram from the container and removes all event listeners.
     */
    public unmount() {
        // Remove canvas
        this.canvas?.remove();
        // Stop watching resize events
        this._resizeObserver?.disconnect();
        // Stop watching screen
        Screen.removeEventListenersWithContext(this);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Rendering  /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Renders the block diagram.
     */
    public render() {
        if (this._rafId != 0) {
            return;
        }
        this._rafId = requestAnimationFrame(() => {
            this._rafId = 0;
            this.executeRenderPipeline();
        });
    }

    /**
     * Executes the diagram rendering pipeline.
     */
    private executeRenderPipeline() {
        const s = this.settings;
        // Render page surface
        this.root.renderSurfaceTo(this.context, this.viewport);
        // Render page contents
        if (s.showShadows && s.disableShadowsAt <= this.transform.k) {
            // With drop shadow
            this.root.renderTo(this.context, this.viewport);
        } else {
            // Without drop shadow
            this.root.renderTo(this.context, this.viewport, 0, 0);
        }
        // Render debug display
        // if (s.showDebug) {
            this.root.renderDebugTo(this.context, this.viewport);
        // }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  3. Canvas Interactions  ///////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Registers a {@link DragHandler} with the interface.
     * @param handler
     *  The drag handler.
     */
    public registerDragHandler(...handlers: DragHandler<T>[]) {
        for(const handler of handlers) {
            // Forward interactions
            handler.on("interaction", o => this.emit("object-interaction", o));
            // Register drag handler
            this.dragHandlers.set(handler.constructor, handler);
        }
    }

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
        x = this.transform.invertX(x);
        y = this.transform.invertY(y);
        const hovered = this.root.getObjectAt(x, y);
        if (this.hoveredObject !== hovered) {
            // Update hover object
            this.hoveredObject = hovered;
            // Pick cursor
            cursor = cursor ?? hovered?.cursor ?? Cursor.Default;
            // Emit event
            this.emit("object-hover", hovered, cursor);
        }
    }

    /**
     * Canvas click behavior.
     * @param event
     *  The click event.
     * @returns
     *  The drag action to perform or `undefined` if no object was clicked.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private onSelectSubject(event: any): DiagramObjectView | undefined {
        const evt = event.sourceEvent;
        const x = this.transform.invertX(event.x);
        const y = this.transform.invertY(event.y);
        const obj = this.root.getObjectAt(x, y);
        const rc = evt.button === MouseClick.Right;

        // If no object, select canvas
        if (!obj) {
            this.emit("canvas-click", evt, event.x, event.y);
            return undefined;
        }

        // If object, choose handler
        this.activeDragHandler = null;
        for(this.activeDragHandler of this.dragHandlers.values()) {
            if(this.activeDragHandler.canHandleInteraction(obj)) {
                break;
            }
        }

        // If no handler, select canvas
        if(!this.activeDragHandler) {
            this.emit("canvas-click", evt, event.x, event.y);
            return undefined;
        }

        // If handler, select object
        return obj;

    }

    /**
     * Object drag start behavior.
     * @param event
     *  The drag event.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private onObjectDragStarted(event: any) {
        const cx = this.transform.invertX(event.x);
        const cy = this.transform.invertY(event.y);
        const ox = event.subject.x;
        const oy = event.subject.y;
        this.activeDragHandler?.dragStart(event.subject, ox, oy);
    }

    /**
     * Object dragged behavior.
     * @param event
     *  The drag event.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private onObjectDragged(event: any) {
        this.activeDragHandler?.drag(
            event.dx / this.transform.k,
            event.dy / this.transform.k
        );
    }

    /**
     * Object drag end behavior.
     * @param event
     *  The drag event.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private onObjectDragEnded(event: any) {
        this.activeDragHandler?.dragEnd();

        // this._layoutLocked = false;
        // const s = event.subject as DragAction;
        // const tdx = this._mover.odx;
        // const tdy = this._mover.ody;
        // switch (s.type) {
        //     case DragActionType.Move:
        //         if (!(tdx || tdy)) {
        //             // If no movement, bail
        //             return;
        //         }
        //         const ids = s.objs.map((o: DiagramObjectView) => o.el);
        //         this.emit("object-move", ids, tdx, tdy);
        //         break;
        //     case DragActionType.MoveAnchorable:
        //         if (!(tdx || tdy)) {
        //             // If no movement, bail
        //             return;
        //         }
        //         if (this._mover.anchor) {
        //             const anchor = this._mover.anchor;
        //             const object = s.obj.el;
        //             this.emit("object-attach", object, anchor);
        //         } else if (s.obj.el.isAttached()) {
        //             const object = s.obj.el;
        //             this.emit("object-detach", object, tdx, tdy);
        //         } else {
        //             const ids = [s.obj.el];
        //             this.emit("object-move", ids, tdx, tdy);
        //         }
        //         break;
        //     case DragActionType.CreateLine:
        //         if ((tdx || tdy) && s.anchor !== this._mover.anchor) {
        //             const obj = s.line.el;
        //             const par = s.parent.el;
        //             const src = s.anchor;
        //             const trg = this._mover.anchor;
        //             this.emit("line-create", obj, par, src, trg);
        //         } else {
        //             // If no movement, reset view and bail
        //             this.updateView();
        //             this.render();
        //         }
        //         break;
        // }
    }

    /**
     * Canvas zoom behavior.
     * @param event
     *  The zoom event.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private onCanvasZoom(event: any) {
        // Update transform
        this.transform = event.transform;
        // Update viewport
        this.updateViewportBounds();
        // Transform context
        transformContext(
            this.context, this.transform.k,
            this.transform.x, this.transform.y
        );
        // If no source event, then we are already
        // running inside a requestAnimationFrame()
        if (event.sourceEvent === null) {
            // If no render scheduled, run render pipeline
            if (this._rafId === 0) {
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
            this.transform.x,
            this.transform.y,
            this.transform.k,
            this.elWidth,
            this.elHeight
        );
    }

    /**
     * Canvas resize behavior.
     * @param el
     *  The block diagram's container.
     */
    private onCanvasResize(el: Element) {
        const newWidth = el.clientWidth;
        const newHeight = el.clientHeight;
        // Center viewport
        const transform = this.transform as { x: number, y: number };
        transform.x += (newWidth - this.elWidth) / 2;
        transform.y += (newHeight - this.elHeight) / 2;
        // Update dimensions
        this.elWidth = newWidth;
        this.elHeight = newHeight;
        // Update viewport
        this.updateViewportBounds();
        // Adjust viewport
        resizeAndTransformContext(
            this.context, this.elWidth, this.elHeight,
            this.transform.k, this.transform.x, this.transform.y
        );
        // Immediately redraw diagram to context
        this.executeRenderPipeline();
    }

    /**
     * Device pixel ratio change behavior.
     * @remarks
     *  The device's pixel ratio can change when dragging the window to and
     *  from a monitor with high pixel density (like Apple Retina displays).
     */
    private onDevicePixelRatioChange() {
        // Resize and transform context
        resizeAndTransformContext(
            this.context, this.elWidth, this.elHeight,
            this.transform.k, this.transform.x, this.transform.y
        );
        // Render
        this.render();
    }

    /**
     * Recalculates the viewport's bounds based on the container's current
     * dimensions.
     */
    private updateViewportBounds() {
        const t = this.transform;
        const padding = DiagramInterface.VIEWPORT_PADDING;
        this.viewport.xMin = Math.round(t.invertX(-padding));
        this.viewport.xMax = Math.round(t.invertX(this.elWidth + padding));
        this.viewport.yMin = Math.round(t.invertY(-padding));
        this.viewport.yMax = Math.round(t.invertY(this.elHeight + padding));
        this.viewport.scale = t.k;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  4. Camera Controls  ///////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Sets the camera's location.
     * @param location
     *  The camera's new location.
     * @param animate
     *  The length of time (in milliseconds) the camera move animation takes.
     *  (Default: 1000)
     */
    public setCameraLocation(location: CameraLocation, animate: number = 1000) {
        const k = location.k;
        const x = Math.round((this.elWidth / 2) - (location.x * k));
        const y = Math.round((this.elHeight / 2) - (location.y * k));
        // Move camera
        this.canvas.transition()
            .duration(animate)
            .call(this.zoom.transform,
                d3.zoomIdentity.translate(x, y).scale(k)
            );
    }

}

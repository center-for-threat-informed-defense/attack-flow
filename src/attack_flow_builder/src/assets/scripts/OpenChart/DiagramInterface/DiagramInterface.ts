import * as d3 from "d3";
import { Screen } from "./Screen";
import { EventEmitter } from "@OpenChart/Utilities";
import { DisplaySettings } from "./DisplaySettings";
import { Cursor, ViewportRegion } from "@OpenChart/DiagramView";
import { resizeAndTransformContext, resizeContext, transformContext } from "./Context";
import type { DiagramInterfaceEvents } from "./DiagramInterfaceEvents";
import type { CanvasSelection, CanvasZoomBehavior } from "./D3Types";
import type { CameraLocation, CanvasView, DiagramObjectView } from "@OpenChart/DiagramView";

export class DiagramInterface extends EventEmitter<DiagramInterfaceEvents> {

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
     * The diagram's display settings.
     */
    public readonly settings: DisplaySettings;


    /**
     * The diagram's root object.
     */
    private readonly root: CanvasView;

    /**
     * The diagram's canvas.
     */
    private readonly canvas: CanvasSelection;

    /**
     * The diagram's context.
     */
    private readonly context: CanvasRenderingContext2D;

    /**
     * The diagram container's height.
     */
    private elHeight: number;

    /**
     * The diagram container's width.
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
        // this._page.renderPageSurfaceTo(this.context, this._viewport, d.showGrid);
        // Render page contents
        if (s.showShadows && s.disableShadowsAt <= this.transform.k) {
            // With drop shadow
            this.root.renderTo(this.context, this.viewport);
        } else {
            // Without drop shadow
            this.root.renderTo(this.context, this.viewport, 0, 0);
        }
        // Render debug display
        if (s.showDebug) {
            // this._page.renderDebugTo(this.context, this.viewport);
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
    private onSelectSubject(event: any): undefined {
        // const evt = event.sourceEvent;
        // const x = this._transform.invertX(event.x);
        // const y = this._transform.invertY(event.y);
        // const obj = this._page.el.getObjectAt(x, y);
        // const rc = evt.button === MouseClick.Right;
        // let mv: DiagramObjectView[];

        // // If no object:
        // if (!obj) {
        //     this.emit("canvas-click", evt, event.x, event.y);
        //     return undefined;
        // }

        // // If object is an anchor:
        // if (obj instanceof DiagramAnchorModel) {
        //     // Select canvas
        //     this.emit("canvas-click", evt, event.x, event.y);
        //     if (rc) {
        //         return undefined;
        //     }
        //     // Create line
        //     const line = obj.makeLine();
        //     // Configure line
        //     const x = obj.boundingBox.xMid;
        //     const y = obj.boundingBox.yMid;
        //     line.srcEnding.moveTo(x, y);
        //     line.trgEnding.moveTo(x, y);
        //     // Create line view
        //     const view = line
        //         .createView(this._rasterCache)
        //         .updateView() as DiagramLineView;
        //     // Initiate line move
        //     return {
        //         type: DragActionType.CreateLine,
        //         line: view,
        //         parent: this._page,
        //         anchor: obj,
        //         obj: view.trgEnding
        //     };
        // }

        // // If object is child of line:
        // if (obj.parent instanceof DiagramLineModel) {
        //     // Select line
        //     this.emit("object-click", evt, obj.parent, event.x, event.y);
        //     if (rc) {
        //         return undefined;
        //     }
        //     // Move the child
        //     mv = [this._page.lookup(obj.id)!];
        // }

        // // If any other object type:
        // else {
        //     // Select object
        //     this.emit("object-click", evt, obj, event.x, event.y);
        //     if (rc) {
        //         return undefined;
        //     }
        //     // Move the current selection
        //     mv = this._page.selects;
        // }

        // // Initiate object move
        // if (mv[0] instanceof DiagramAnchorableView && mv.length === 1) {
        //     return { type: DragActionType.MoveAnchorable, obj: mv[0] };
        // } else {
        //     return { type: DragActionType.Move, objs: mv };
        // }
        return undefined;
    }

    /**
     * Object drag start behavior.
     * @param event
     *  The drag event.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // setTimeout(() => {
        //     this._layoutLocked = true;
        //     const s = event.subject as DragAction;
        //     const cx = this._transform.invertX(event.x);
        //     const cy = this._transform.invertY(event.y);
        //     let ox = 0;
        //     let oy = 0;
        //     let al = Alignment.Free;
        //     let an = undefined;
        //     switch (s.type) {
        //         case DragActionType.Move:
        //             for (const obj of s.objs) {
        //                 ox += obj.x;
        //                 oy += obj.y;
        //                 al = Math.max(al, obj.el.getAlignment());
        //             }
        //             ox /= s.objs.length;
        //             oy /= s.objs.length;
        //             break;
        //         case DragActionType.CreateLine:
        //             s.parent.children.push(s.line);
        //         case DragActionType.MoveAnchorable:
        //             ox = s.obj.x;
        //             oy = s.obj.y;
        //             al = s.obj.el.getAlignment();
        //             an = this._page.el.anchorCache;
        //             break;
        //     }
        //     this._mover.reset(al, cx, cy, ox, oy, an);
        // }, 0);
    }

    /**
     * Object dragged behavior.
     * @param event
     *  The drag event.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private onObjectDragged(event: any) {
        // const s = event.subject as DragAction;
        // // Calculate delta
        // this._mover.updateDelta(
        //     event.dx / this._transform.k,
        //     event.dy / this._transform.k
        // );
        // // Move elements
        // let attrs;
        // switch (s.type) {
        //     case DragActionType.Move:
        //         for (const obj of s.objs) {
        //             attrs = obj.fakePositionSetByUser(PositionSetByUser.True);
        //             obj.moveBy(this._mover.dx, this._mover.dy, attrs);
        //         }
        //         break;
        //     case DragActionType.CreateLine:
        //         s.obj.el.moveBy(this._mover.dx, this._mover.dy);
        //     case DragActionType.MoveAnchorable:
        //         this.onHoverSubject(event.x, event.y, s.obj.el.getCursor());
        //         attrs = s.obj.fakePositionSetByUser(PositionSetByUser.True);
        //         s.obj.moveBy(this._mover.dx, this._mover.dy, attrs);
        //         break;
        // }
        // // Render
        // this.render();
    }

    /**
     * Object drag end behavior.
     * @param event
     *  The drag event.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private onObjectDragEnded(event: any) {
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

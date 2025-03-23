/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from "d3";
import { Cursor, MouseClick } from "./Mouse";
import { Screen } from "./Screen";
import { DisplaySettings } from "./DisplaySettings";
import { ViewportRegion } from "@OpenChart/DiagramView";
import { EventEmitter, round } from "@OpenChart/Utilities";
import { resizeAndTransformContext, resizeContext, transformContext } from "./Context";
import type { Animation } from "./Animation";
import type { DiagramInterfacePlugin } from "./DiagramInterfacePlugin";
import type { DiagramInterfaceEvents } from "./DiagramInterfaceEvents";
import type { CanvasSelection, CanvasZoomBehavior } from "./D3Types";
import type { CameraLocation, CanvasView, DiagramObjectView } from "@OpenChart/DiagramView";

export class DiagramInterface<T> extends EventEmitter<DiagramInterfaceEvents<T>> {

    /**
     * The viewport's padding.
     */
    private static readonly VIEWPORT_PADDING = 0;


    ///////////////////////////////////////////////////////////////////////////
    //  1. Public Fields  /////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * The interface's root object.
     */
    public readonly root: CanvasView;

    
    ///////////////////////////////////////////////////////////////////////////
    //  2. View-Related Fields  ///////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * The interface's display settings.
     */
    private readonly settings: DisplaySettings;

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
     * The context's current transform.
     */
    private transform: d3.ZoomTransform;

    /**
     * The context's viewport.
     */
    private viewport: ViewportRegion;

    /**
     * An observer that monitors the size of the diagram's container.
     */
    private resizeObserver: ResizeObserver | null;


    ///////////////////////////////////////////////////////////////////////////
    //  2. Plugin-Related Fields  /////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    
    /**
     * The interface's plugins.
     */
    private readonly plugins: Map<Function, DiagramInterfacePlugin<T>>;

    /**
     * The interface's active plugin.
     */
    private activePlugin: DiagramInterfacePlugin<T> | null;

    /**
     * The object currently being hovered over.
     * @remarks
     *  `undefined` represents the view's canvas.
     */
    private activeHover: DiagramObjectView | undefined | null;


    ///////////////////////////////////////////////////////////////////////////
    //  3. Render-Related Fields  /////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * The interface's active animations.
     */
    private readonly animations: Map<string, Animation>;

    /**
     * The id of the last animation frame request.
     */
    private rafId: number;


    ///////////////////////////////////////////////////////////////////////////
    //  4. Behavior-Related Fields  ///////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * The diagram's zoom behavior.
     */
    private readonly zoom: CanvasZoomBehavior;


    /**
     * Creates a new {@link DiagramInterface}.
     * @param root
     *  The diagram's root object.
     */
    constructor(root: CanvasView) {
        super();
        
        // Configure state
        this.settings = new DisplaySettings();
        this.root = root;
        this.canvas = d3.select(document.createElement("canvas"));
        this.context = this.canvas.node()!.getContext("2d", { alpha: false })!;
        this.elWidth = 0;
        this.elHeight = 0;
        this.viewport = new ViewportRegion();
        this.transform = d3.zoomIdentity;
        this.resizeObserver = null;
        this.plugins = new Map();
        this.activePlugin = null;
        this.activeHover = null;
        this.animations = new Map();
        this.rafId = 0;
        this.zoom = d3.zoom<HTMLCanvasElement, unknown>()
            .scaleExtent([1 / 8, 6])
            .on("zoom", this.onCanvasZoom.bind(this))
            .on("end", () => this.onCanvasZoomEnd());
        
        // Configure canvas
        this.canvas
            .attr("style", "display:block;")
            .on("mousemove", (event) => {
                this.onHoverSubject(event, ...d3.pointer(event));
            })
            .on("contextmenu", (e: Event) => e.preventDefault());
        
        // Configure canvas interactions
        this.canvas
            .call(d3.drag<HTMLCanvasElement, unknown>()
                .filter(() => true)
                .subject(this.onSelectSubject.bind(this))
                .on("drag", this.onObjectDragged.bind(this))
                .on("end", this.onObjectDragEnded.bind(this))
            ).call(this.zoom);
    
    }


    ///////////////////////////////////////////////////////////////////////////
    //  5. Inject and Destroy  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Mounts the interface onto a container.
     * @param container
     *  The container to mount the interface to.
     */
    public mount(container: HTMLElement): void {
        // Set sizing
        this.elWidth = container.clientWidth;
        this.elHeight = container.clientHeight;
        // Configure resize observer
        this.resizeObserver = new ResizeObserver(
            entries => this.onCanvasResize(entries[0].target)
        );
        this.resizeObserver.observe(container);
        // Mount canvas
        container.appendChild(this.canvas.node()!);
        // Size context
        resizeContext(this.context, this.elWidth, this.elHeight);
        // Configure dppx change behavior
        Screen.on("dppx-change", this.onDevicePixelRatioChange, this);
    }

    /**
     * Unmounts the interface from its container.
     */
    public unmount() {
        // Remove canvas
        this.canvas?.remove();
        // Stop watching resize events
        this.resizeObserver?.disconnect();
        // Stop watching screen
        Screen.removeEventListenersWithContext(this);
        // Remove event listeners
        this.removeAllListeners();
    }


    ///////////////////////////////////////////////////////////////////////////
    //  6. Rendering  /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Renders the interface.
     */
    public render() {
        if (this.rafId !== 0) {
            return;
        }
        this.rafId = requestAnimationFrame(() => {
            this.rafId = 0;
            this.executeRenderPipeline();
        });
    }

    /**
     * Executes the rendering pipeline.
     */
    private executeRenderPipeline() {
        const s = this.settings.update(this.transform);
        // Render page surface
        this.root.renderSurfaceTo(this.context, this.viewport);
        // Render root
        this.root.renderTo(this.context, this.viewport, this.settings);
        // Render debug display
        if (s.debugInfoEnabled) {
            this.root.renderDebugTo(this.context, this.viewport);
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  7. Animations  ////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Starts an animation.
     * @param animation
     *  The animation.
     */
    public runAnimation(animation: Animation) {
        if(this.animations.has(animation.id)) {
            return;
        }
        const animations = this.settings.animationsEnabled;
        // Register animation
        if(animation.frames === Infinity) {
            // Always register continuous animations
            this.animations.set(animation.id, animation);
        } else if(!animations) {
            // If animations are disabled, render last frame
            animation.renderFrame(this.context, animation.frames);
            this.render();
        }
        // If no animations were previously running...
        if(animations && this.animations.size === 1) {
            // ...kick off animation loop
            this.runAnimationLoop();
        }
    }

    /**
     * Cancels an animation.
     * @param id
     *  The animation's identifier.
     */
    public stopAnimation(id: string) {
        this.animations.delete(id);
    }

    /**
     * Runs the animation loop.
     */
    private runAnimationLoop() {
        // Bail if animations are disabled
        if(!this.settings.animationsEnabled) {
            return;
        }
        // Schedule animation frame
        cancelAnimationFrame(this.rafId);
        this.rafId = requestAnimationFrame(() => {
            // Execute animations
            for(const animation of this.animations.values()) {
                if(!animation.nextFrame(this.context)) {
                    this.animations.delete(animation.id)
                }
            }
            // Render interface
            this.rafId = 0;
            this.executeRenderPipeline();
            // Schedule next animation frame
            if(this.animations.size) {
                this.runAnimationLoop()
            }
        })
    }


    ///////////////////////////////////////////////////////////////////////////
    //  8. Canvas Interactions  ///////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Installs one or more {@link DiagramInterfacePlugin}s.
     * @remarks 
     *  ## About Plugins 
     *  When the mouse interacts with the interface - whether by hovering, 
     *  selecting, or dragging - the interface evaluates each plugin, in order
     *  of installation, to determine which one can manage the interaction. The
     *  first plugin to indicate that it can, takes control.
     * 
     *  Only ONE plugin is selected to manage any given interaction. This is an
     *  intentional design choice meant to prevent the conflicting behaviors
     *  that could arise if multiple plugins were allowed to blindly handle the
     *  same interaction.
     * 
     *  Plugins are not designed to coordinate with each other, nor should they
     *  be, as this would unnecessarily complicate the construct.
     * 
     *  ### When Writing Plugins:
     *  Ensure that the conditions for `canHandleHover()` and
     *  `canHandleSelection()` are as specific as possible. These functions
     *  should only accept conditions that are essential for the plugin's
     *  intended behavior.
     * 
     *  ### When Installing Plugins:
     *  Plugins designed to operate under very specific conditions should be
     *  installed before those that function under broader conditions.
     * @param plugins
     *  The plugins to install.
     */
    public installPlugin(...plugins: DiagramInterfacePlugin<T>[]) {
        for(const handler of plugins) {
            // Forward commands
            handler.on("execute", cmd => this.emit("plugin-command", cmd));
            // Register plugin
            this.plugins.set(handler.constructor, handler);
        }
    }

    /**
     * Canvas hover behavior.
     * @param event
     *  The click event.
     * @param x
     *  The pointer's position on the x-axis.
     * @param y
     *  The pointer's position on the y-axis.
     */
    private onHoverSubject(event: MouseEvent, x: number, y: number) {
        x = this.transform.invertX(x);
        y = this.transform.invertY(y);
        // Select object
        const hovered = this.root.getObjectAt(x, y);
        if (this.activeHover === hovered) {
            return;
        }
        // Update hover
        this.activeHover = hovered;
        // Choose plugin
        let selectedPlugin;
        for(const plugin of this.plugins.values()) {
            if(plugin.canHandleHover(hovered, event)) {
                selectedPlugin = plugin;
                break;
            }
        }
        // Use plugin
        const cursor = selectedPlugin?.hoverStart(hovered, event);
        // Emit cursor change event
        this.emit("cursor-change", cursor ?? Cursor.Default);
    }

    /**
     * Canvas click behavior.
     * @param event
     *  The click event.
     * @returns
     *  The drag action to perform or `undefined` if no object was clicked.
     */
    private onSelectSubject(event: any): Object | undefined {
        const evt = event.sourceEvent as MouseEvent;
        const x = this.transform.invertX(event.x);
        const y = this.transform.invertY(event.y);
        const obj = this.root.getObjectAt(x, y);
        // Choose plugin
        this.activePlugin = null;
        for(const plugin of this.plugins.values()) {
            if(plugin.canHandleSelection(obj, evt)) {
                this.activePlugin = plugin;
                break;
            }
        }
        // Use plugin
        let yieldedControl = true;
        if(this.activePlugin) {
            yieldedControl = this.activePlugin.selectStart(obj, x, y, evt);
        }
        // Emit canvas click event
        this.emit("canvas-click", evt, event.x, event.y);
        // Return
        if(evt.button === MouseClick.Right) {
            if(this.activePlugin && !yieldedControl) {
                this.activePlugin.selectEnd(evt);
            }
            return undefined;
        } else {
            return yieldedControl ? undefined : {};
        }
    }

    /**
     * Object dragged behavior.
     * @param event
     *  The drag event.
     */
    private onObjectDragged(event: any) {
        this.activePlugin?.selectDrag(
            event.dx / this.transform.k,
            event.dy / this.transform.k,
            event.sourceEvent
        );
    }

    /**
     * Object drag end behavior.
     * @param event
     *  The drag event.
     */
    private onObjectDragEnded(event: any) {
        this.activePlugin?.selectEnd(event.sourceEvent);
    }

    /**
     * Canvas zoom behavior.
     * @param event
     *  The zoom event.
     */
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
            if (this.rafId === 0) {
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
        this.viewport.xMin = round(t.invertX(-padding));
        this.viewport.xMax = round(t.invertX(this.elWidth + padding));
        this.viewport.yMin = round(t.invertY(-padding));
        this.viewport.yMax = round(t.invertY(this.elHeight + padding));
        this.viewport.scale = t.k;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  9. View Controls  /////////////////////////////////////////////////////
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
        const x = round((this.elWidth / 2) - (location.x * k));
        const y = round((this.elHeight / 2) - (location.y * k));
        // Move camera
        this.canvas.transition()
            .duration(animate)
            .call(this.zoom.transform,
                d3.zoomIdentity.translate(x, y).scale(k)
            );
    }

    /**
     * Enables / Disables interface animations.
     * @param state
     *  True to enable, false to disable.
     */
    public enableAnimations(state: boolean) {
        if(this.settings.animationsEnabled === state) {
            return;
        }
        this.settings.animationsEnabled = state;
        if(state && this.animations.size) {
            this.runAnimationLoop();
        } else {
            this.render();
        }
    }

    /**
     * Enables / Disables shadows.
     * @param state
     *  True to enable, false to disable.
     */
    public enableShadows(state: boolean) {
        this.settings.requestShadows = state;
        this.render();
    }

    /**
     * Enables / Disables debug information.
     * @param state
     *  True to enable, false to disable.
     */
    public enableDebugInfo(state: boolean) {
        this.settings.debugInfoEnabled = state;
        this.render();
    }

}

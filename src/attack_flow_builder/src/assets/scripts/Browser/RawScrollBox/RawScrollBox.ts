import "./RawScrollBox.css";
import { PointerTracker, clamp } from "..";
import type { ScrollBar } from "./ScrollBar";
import type { ScrollHandle } from "./ScrollHandle";
import type { ScrollContent } from "./ScrollContent";
import type { ScrollEventHandlers } from "./ScrollEventHandlers";

export class RawScrollBox {

    /**
     * The scrollbox's class name.
     */
    private static scrollBoxClassName: string = "scroll-box";

    /**
     * The scroll content's class name.
     */
    private static scrollContentClassName: string = "scroll-content";

    /**
     * The scrollbar's class name.
     */
    private static scrollBarClassName: string = "scroll-bar";

    /**
     * The scroll handle's class name.
     */
    private static scrollHandleClassName: string = "scroll-handle";


    /**
     * True to always show the scrollbar, false otherwise.
     */
    public alwaysShowScrollBar: boolean;

    /**
     * True to forward scroll events outside of the scrollbox, false otherwise.
     */
    public propagateScroll: boolean;

    /**
     * True to reset the scrollbar's position to 0 on content change, false
     * otherwise.
     */
    public resetScrollOnChange: boolean;

    /**
     * The scrollbox's cursor tracker.
     */
    private _track: PointerTracker;

    /**
     * The scrollbox's current position.
     */
    private _scrollTop: number;

    /**
     * The scrollbox's maximum position.
     */
    private _windowMax: number;

    /**
     * The scrollbox.
     */
    private _el: HTMLElement | null;

    /**
     * The scrollbar.
     */
    private _bar: ScrollBar;

    /**
     * The scrollbar's handle.
     */
    private _handle: ScrollHandle;

    /**
     * The scrollbox's content container.
     */
    private _content: ScrollContent;

    /**
     * The scrollbox's scoped id.
     */
    private _scopeId: string | null;

    /**
     * The scrollbox's resize observer.
     */
    private _resizeObserver: ResizeObserver | null;

    /**
     * The scrollbox's mutation observer.
     */
    private _mutateObserver: MutationObserver | null;

    /**
     * The scrollbox's event handlers.
     */
    private _eventHandlers: ScrollEventHandlers;


    /**
     * Creates a new {@link RawScrollBox}.
     * @param alwaysShowScrollbar
     *  True to always show the scrollbar, false otherwise.
     *  (Default: false)
     * @param propagateScroll
     *  True to forward scroll events outside of the scrollbox, false
     *  otherwise.
     *  (Default: true)
     * @param resetScrollOnChange
     *  True to reset the scrollbar's position to 0 on content change, false
     *  otherwise.
     *  (Default: false)
     */
    constructor(
        alwaysShowScrollbar: boolean = false,
        propagateScroll: boolean = true,
        resetScrollOnChange: boolean = false
    ) {
        // Configure state
        this.alwaysShowScrollBar = alwaysShowScrollbar;
        this.propagateScroll = propagateScroll;
        this.resetScrollOnChange = resetScrollOnChange;
        this._track = new PointerTracker();
        this._scrollTop = 0;
        this._windowMax = 0;
        this._el = null;
        this._bar = {
            el: document.createElement("div"),
            shown: true
        };
        this._handle = {
            el: document.createElement("div"),
            hei: 0,
            pos: 0,
            max: 0
        };
        this._content = {
            el: document.createElement("div")
        };
        this._scopeId = null;
        this._resizeObserver = null;
        this._mutateObserver = null;
        this._eventHandlers = {
            wheel: this.onScrollWheel.bind(this),
            scroll: this.onScrollContent.bind(this),
            emitScroll: () => {},
            dragHandle: this.startDrag.bind(this)
        };
        // Configure elements
        const bar = this._bar.el;
        const hdl = this._handle.el;
        const con = this._content.el;
        bar.classList.add(RawScrollBox.scrollBarClassName);
        hdl.classList.add(RawScrollBox.scrollHandleClassName);
        con.classList.add(RawScrollBox.scrollContentClassName);
        bar.prepend(hdl);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Mount / Destroy  ///////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Mounts the scrollbox.
     * @param el
     *  The scrollbox.
     * @param content
     *  The scrollbox content.
     */
    public mount(
        el: HTMLElement,
        content: HTMLElement
    ): void;

    /**
     * Mounts the scrollbox.
     * @param el
     *  The scrollbox.
     * @param content
     *  The scrollbox content.
     * @param scopeId
     *  The scrollbox's scoped id.
     * @param onScroll
     *  Scroll event handler.
     */
    public mount(
        el: HTMLElement,
        content: HTMLElement,
        scopeId?: string | null,
        onScroll?: (scrollTop: number) => void
    ): void;
    public mount(
        el: HTMLElement,
        content: HTMLElement,
        scopeId: string | null = null,
        onScroll: (scrollTop: number) => void = () => {}
    ) {
        const bar = this._bar.el;
        const hdl = this._handle.el;
        const con = this._content.el;

        // Ensure ready to mount
        this.destroy();

        // Configure scope id
        if (this._scopeId) {
            [bar, hdl, con].forEach(o => o.removeAttribute(this._scopeId!));
        }
        this._scopeId = scopeId;
        if (this._scopeId) {
            [bar, hdl, con].forEach(o => o.setAttribute(this._scopeId!, ""));
        }

        // Configure scroll contents container
        this._content.el.innerHTML = "";
        this._content.el.prepend(content);

        // Build scrollbox
        this._el = el;
        el.classList.add(RawScrollBox.scrollBoxClassName);
        el.innerHTML = "";
        el.prepend(this._bar.el);
        el.prepend(this._content.el);

        // Configure event listeners
        con.addEventListener("scroll", this._eventHandlers.scroll);
        con.addEventListener("wheel", this._eventHandlers.wheel, { passive: true });
        bar.addEventListener("wheel", this._eventHandlers.wheel);
        hdl.addEventListener("pointerdown", this._eventHandlers.dragHandle);

        // Configure mutation observer
        const mutateOptions = { childList: true, characterData: true, subtree: true };
        this._mutateObserver = new MutationObserver(() =>
            this.recalculateScrollState(this.resetScrollOnChange)
        );

        // Configure resize observer
        this._resizeObserver = new ResizeObserver(() =>
            this.recalculateScrollState(false)
        );
        this._resizeObserver.observe(el);
        this._mutateObserver.observe(this._content.el, mutateOptions);

        // Configure emit scroll handler
        this._eventHandlers.emitScroll = onScroll;
        // Calculate scroll state
        this.recalculateScrollState(false);

    }

    /**
     * Destroys the scrollbox.
     */
    public destroy() {
        const bar = this._bar.el;
        const hdl = this._handle.el;
        const con = this._content.el;

        // Disconnect observers
        this._resizeObserver?.disconnect();
        this._mutateObserver?.disconnect();

        // Clear event listeners
        con.removeEventListener("scroll", this._eventHandlers.scroll);
        con.removeEventListener("wheel", this._eventHandlers.wheel);
        bar.removeEventListener("wheel", this._eventHandlers.wheel);
        hdl.removeEventListener("pointerdown", this._eventHandlers.dragHandle);

        // Wipe classes
        this._el?.classList.remove(RawScrollBox.scrollBoxClassName);

    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Events  ////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Scroll wheel behavior.
     * @param event
     *  The wheel event.
     */
    private onScrollWheel(event: WheelEvent) {
        this.moveScrollPosition(this._scrollTop + event.deltaY, event);
    }

    /**
     * Scroll handle drag start behavior.
     * @param event
     *  The pointer event.
     */
    private startDrag(event: PointerEvent) {
        this._track.capture(event, this.onDrag.bind(this));
    }

    /**
     * Scroll handle drag behavior.
     * @param event
     *  The pointer event.
     * @param track
     *  The mouse tracker.
     */
    private onDrag(event: PointerEvent, track: PointerTracker) {
        event.preventDefault();
        this.moveScrollPosition(
            this.handleTopToTop(this._handle.pos + track.movementY)
        );
    }

    /**
     * Scroll content behavior.
     */
    private onScrollContent() {
        const content = this._content.el;
        // If browser changed scroll position on its own, update scroll state
        if (content.scrollTop !== this._scrollTop) {
            this._scrollTop = content.scrollTop;
            this._handle.pos = this.topToHandleTop(this._scrollTop);
            this._handle.el.style.transform = `translateY(${this._handle.pos}px)`;
        }
        this._eventHandlers.emitScroll(this._scrollTop);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  3. Scroll Calculation  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Calculates and configures the parameters required to mimic scrolling.
     *
     * NOTE:
     * This function should be called anytime:
     *  - The height of the scroll box changes.
     *  - The height of the scroll content changes.
     *
     * @param resetTop
     *  [true]
     *   The scroll position will be set to 0, after recalculation.
     *  [false]
     *   The scroll position will go to its original spot, after recalculation.
     *  (Default: true)
     */
    private recalculateScrollState(resetTop: boolean = true) {
        const showScrollbar = this._bar.shown;
        const content = this._content.el;
        // Ignore scroll content with no height
        if (content.clientHeight === 0) {
            this.showScrollbar(false);
            return;
        }
        // Compute ratio
        const ratio = content.clientHeight / content.scrollHeight;
        // Compute scroll parameters
        const scrollBarSpace = this.getScrollBarHeight();
        this._handle.hei = Math.max(15, Math.round(scrollBarSpace * ratio));
        this._handle.max = scrollBarSpace - this._handle.hei;
        this._windowMax = content.scrollHeight - content.clientHeight;
        // Update scroll handle
        this.showScrollbar(ratio !== 1);
        this._handle.el.style.height = `${this._handle.hei}px`;
        // Update scroll position
        this.moveScrollPosition(resetTop ? 0 : content.scrollTop);
        // If scrollbar added, recalculate state after scrollbar applied
        if (!showScrollbar && this._bar.shown) {
            setTimeout(() => this.recalculateScrollState(resetTop), 0);
        }
    }

    /**
     * Moves the scroll position.
     * @param position
     *  The new scroll position.
     * @param event
     *  The scroll wheel event, if applicable.
     */
    public moveScrollPosition(position: number, event: WheelEvent | null = null) {
        // Calculate positions
        const scrollTop = this._scrollTop;
        this._scrollTop = clamp(Math.round(position), 0, this._windowMax);
        this._handle.pos = this.topToHandleTop(this._scrollTop);
        // Selectively propagate scroll event
        const canMove = 0 < this._scrollTop && this._scrollTop < this._windowMax;
        const hasMoved = scrollTop - this._scrollTop !== 0;
        const shouldStopPropagate = !this.propagateScroll && this._bar.shown;
        if (shouldStopPropagate || hasMoved || canMove) {
            event?.stopPropagation();
        }
        // Update DOM
        this._handle.el.style.transform = `translateY(${this._handle.pos}px)`;
        this._content.el.scrollTop = this._scrollTop;
    }

    /**
     * Calculates the scroll handle position from the scroll position.
     * @param top
     *  The current scroll position.
     * @returns
     *  The calculated scroll handle position.
     */
    private topToHandleTop(top: number): number {
        return (top / this._windowMax) * this._handle.max;
    }

    /**
     * Calculates the scroll position from the scroll handle position.
     * @param top
     *  The current scroll handle position.
     * @returns
     *  The calculated scroll position.
     */
    private handleTopToTop(top: number): number {
        return (top / this._handle.max) * this._windowMax;
    }

    /**
     * Returns the scrollbar's height (excluding padding, borders, and margin).
     * @returns
     *  The scrollbar's true height.
     */
    private getScrollBarHeight(): number {
        const cs = getComputedStyle(this._bar.el);
        const padding = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
        return this._bar.el.clientHeight - padding;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  4. View Manipulation  /////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Shows / Hides the scrollbar.
     * @param value
     *  True to show the scrollbar, false otherwise.
     */
    private showScrollbar(value: boolean) {
        if (this._bar.shown === value) {
            return;
        }
        // Set value
        this._bar.shown = value;
        // Update view
        if (this.alwaysShowScrollBar || this._bar.shown) {
            this._bar.el.style.display = "";
        } else {
            this._bar.el.style.display = "none";
        }
        if (this._bar.shown) {
            this._handle.el.style.display = "";
        } else {
            this._handle.el.style.display = "none";
        }
    }

}

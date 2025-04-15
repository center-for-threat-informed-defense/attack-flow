import "./RawCarouselScrollBox.css";
import { PointerTracker, clamp } from "..";
import type { ScrollBar } from "./ScrollBar";
import type { ScrollHandle } from "./ScrollHandle";
import type { ScrollContent } from "./ScrollContent";
import type { ScrollEventHandlers } from "./ScrollEventHandlers";
import type { ScrollState } from "./ScrollState";
import { VirtualScrollState } from "./VirtualScrollContent";
import { ref } from "vue";

export class RawCarouselScrollBox<T> {

    /**
     * The scrollbox's class name.
     */
    private static scrollBoxClassName: string = "carousel-scroll-box";

    /**
     * The scroll content's class name.
     */
    private static scrollContentClassName: string = "carousel-scroll-content";

    /**
     * The scroll content's class name.
     */
    private static scrollInnerContentClassName: string = "carousel-inner-scroll-content";

    /**
     * The scrollbar's class name.
     */
    private static scrollBarClassName: string = "carousel-scroll-bar";

    /**
     * The scroll handle's class name.
     */
    private static scrollHandleClassName: string = "carousel-scroll-handle";


    /**
     * True to always show the scrollbar, false otherwise.
     */
    public alwaysShowScrollBar: boolean;

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
     * The scrollbox's virtual scroll state.
     */
    private _state: VirtualScrollState<T>;


    /**
     * The scrollbox's visible content.
     */
    public get content(): ReadonlyArray<T> {
        return this._state.content;
    }

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
        items: T[], 
        itemHeight: number,
        itemMargin: number,
        itemNumber: number,
        alwaysShowScrollbar: boolean = false,
        resetScrollOnChange: boolean = false
    ) {
        // Configure state
        this.alwaysShowScrollBar = alwaysShowScrollbar;
        this.resetScrollOnChange = resetScrollOnChange;

        this._state = ref(new VirtualScrollState(items, itemHeight, itemMargin, itemNumber)).value;
        this._track = new PointerTracker();
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
            el: document.createElement("div"),
            height: 0
        };
        this._scopeId = null;
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
        bar.classList.add(RawCarouselScrollBox.scrollBarClassName);
        hdl.classList.add(RawCarouselScrollBox.scrollHandleClassName);
        con.classList.add(RawCarouselScrollBox.scrollContentClassName);
        bar.prepend(hdl);
    }

    public setItems(items: T[]) {
        this._state.items = items;
        this.recalculateScrollState(false);
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
        el.classList.add(RawCarouselScrollBox.scrollBoxClassName);
        el.innerHTML = "";
        el.prepend(this._bar.el);
        el.prepend(this._content.el);

        // Configure event listeners
        con.addEventListener("scroll", this._eventHandlers.scroll);
        con.addEventListener("wheel", this._eventHandlers.wheel, { passive: true });
        bar.addEventListener("wheel", this._eventHandlers.wheel);
        hdl.addEventListener("pointerdown", this._eventHandlers.dragHandle);

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

        // Clear event listeners
        con.removeEventListener("scroll", this._eventHandlers.scroll);
        con.removeEventListener("wheel", this._eventHandlers.wheel);
        bar.removeEventListener("wheel", this._eventHandlers.wheel);
        hdl.removeEventListener("pointerdown", this._eventHandlers.dragHandle);

        // Wipe classes
        this._el?.classList.remove(RawCarouselScrollBox.scrollBoxClassName);

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
        this.moveScrollPosition(this._state.scrollTop + event.deltaY, event);
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
        // Compute container height
        this._content.el.style.height = `${this._state.clientHeight}px`;
        // Ignore scroll content with no height
        if (this._state.scrollHeight === 0) {
            this.showScrollbar(false);
            return;
        }
        // Compute ratio
        const ratio = this._state.clientHeight / this._state.scrollHeight;
        // Compute scroll parameters
        const scrollBarSpace = this.getScrollBarHeight();
        this._handle.hei = Math.max(15, Math.round(scrollBarSpace * ratio));
        this._handle.max = scrollBarSpace - this._handle.hei;
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
        const lastScrollTop = this._state.scrollTop;
        this._state.scrollTop = position;
        this._handle.pos = this.topToHandleTop(this._state.scrollTop);
        const nextScrollTop = this._state.scrollTop;
        // Calculate positions
        this._state.scrollTop = position;
        this._handle.pos = this.topToHandleTop(this._state.scrollTop);
        // Selectively propagate scroll event
        
        const canMove = 0 < nextScrollTop && nextScrollTop < this._state.scrollMax;
        const hasMoved = lastScrollTop - nextScrollTop !== 0;
        if (this._bar.shown || hasMoved || canMove) {
            event?.stopPropagation();
        }
        // Update DOM
        this._handle.el.style.transform = `translateY(${this._handle.pos}px)`;
    }

    /**
     * Calculates the scroll handle position from the scroll position.
     * @param top
     *  The current scroll position.
     * @returns
     *  The calculated scroll handle position.
     */
    private topToHandleTop(top: number): number {
        return (top / this._state.scrollMax) * this._handle.max;
    }

    /**
     * Calculates the scroll position from the scroll handle position.
     * @param top
     *  The current scroll handle position.
     * @returns
     *  The calculated scroll position.
     */
    private handleTopToTop(top: number): number {
        return (top / this._handle.max) * this._state.scrollMax;
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

import { clamp, floorNearestMultiple } from "..";
import type { ScrollEventHandlers } from "./ScrollEventHandlers";

export class RawScrollListBox<T> {

    /**
     * The scroll height of each item.
     */
    private static itemScrollHeight: number = 27;

    /**
     * The amount of time (in ms) between distinct scroll actions.
     */
    private static newScrollActionPeriod: number = 100;


    /**
     * The scrollbox.
     */
    private _el: HTMLElement | null;

    /**
     * The list of items.
     */
    private _items: T[];

    /**
     * The scroll cursor.
     */
    private _cursor: number;

    /**
     * The list's range.
     */
    private _range: [number, number, number];

    /**
     * The visible content.
     */
    private _content: T[];

    /**
     * The time of the last scroll event.
     */
    private _lastScroll: Date;

    /**
     * The id of the last reset cursor callback.
     */
    private _resetCursorId: number;

    /**
     * The scrollbox's event handlers.
     */
    private _eventHandlers: ScrollEventHandlers;

    /**
     * The number of items to display.
     */
    public readonly itemDisplayCount: number;

    /**
     * True to forward scroll events outside of the scrollbox, false otherwise.
     */
    public propagateScroll: boolean;


    ///////////////////////////////////////////////////////////////////////////
    //  1. List Dimensions  ///////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * The content's client height.
     */
    public get clientHeight(): number {
        const height = Math.min(this._items.length, this.itemDisplayCount);
        return height * RawScrollListBox.itemScrollHeight;
    }


    /**
     * The content's scroll height.
     */
    public get scrollHeight(): number {
        const height = this._items.length;
        return height * RawScrollListBox.itemScrollHeight;
    }


    /**
     * The content's max scroll position.
     */
    public get scrollMax(): number {
        return this.scrollHeight - this.clientHeight;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. List Content  //////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * The active item index.
     */
    public get index(): number {
        return this._range[1];
    }

    /**
     * The active item.
     */
    public get item(): T {
        return this._items[this.index];
    }

    /**
     * The scroll content.
     */
    public get items(): ReadonlyArray<T> {
        return this._items;
    }

    /**
     * The scroll content.
     */
    public set items(value: T[]) {
        this._cursor = 0;
        // Set items
        this._items = value;
        // Recalculate visible
        this.updateContent();
    }

    /**
     * The visible content.
     */
    public get content(): ReadonlyArray<T> {
        return this._content;
    }

    /**
     * The list's range.
     */
    public get range(): ReadonlyArray<number> {
        return this._range;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  3. List Controls  /////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * The content's cursor.
     */
    public get cursor(): number {
        return this._cursor;
    }

    /**
     * The content's cursor.
     */
    public set cursor(value: number) {
        // Set cursor
        this._cursor = value;
        // Update content
        this.updateContent();
    }


    /**
     * Creates a new {@link RawScrollListBox}.
     * @param items
     *  The list of items.
     * @param itemDisplayCount
     *  The number of items to display.
     * @param reactive
     *  A function that wraps any object in a reactive context.
     */
    constructor(items: T[], itemDisplayCount: number, reactive: <T>(o: T) => T = o => o) {
        // Configure state
        this._el = null;
        this._items = [];
        this._cursor = 0;
        this._range = [0, 0, 0];
        this._content = [];
        this._lastScroll = new Date();
        this._resetCursorId = 0;
        this._eventHandlers = {
            wheel: this.onScrollWheel.bind(reactive(this)),
            emitScroll: () => {}
        };
        this.itemDisplayCount = itemDisplayCount;
        this.propagateScroll = false;
        // Configure items
        this.items = items;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  4. Content Management  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Jump to item.
     * @param index
     *  The item's index.
     */
    public jumpToItem(index: number) {
        const center = Math.floor(RawScrollListBox.itemScrollHeight / 2);
        // Update cursor
        this._cursor = index * RawScrollListBox.itemScrollHeight + center;
        // Update content
        this.updateContent();
    }

    /**
     * Updates the scroll content.
     */
    private updateContent() {
        const r = this._range;
        const l = this._items.length;
        const m = RawScrollListBox.itemScrollHeight;
        // Set cursor
        this._cursor = clamp(Math.round(this._cursor), 0, this.scrollHeight);
        // Calculate range
        const r0 = r[0];
        const r2 = r[2];
        r[1] = Math.min(floorNearestMultiple(this._cursor, m) / m, l - 1);
        if (r[1] < r[0]) {
            r[2] = Math.min(r[1] + this.itemDisplayCount, l);
            r[0] = Math.max(r[2] - this.itemDisplayCount, 0);
        }
        if (r[2] <= r[1]) {
            r[0] = Math.max(r[1] - this.itemDisplayCount + 1, 0);
            r[2] = Math.min(r[0] + this.itemDisplayCount, l);
        }
        // Update content
        if (r0 !== r[0] || r2 !== r[2]) {
            this._content = this._items.slice(r[0], r[2]);
        }
        // Emit scroll
        this._eventHandlers.emitScroll(this.index);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  5. Scroll Element Management  /////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Mounts the scrollbox.
     * @param el
     *  The scrollbox.
     */
    public mount(
        el: HTMLElement
    ): void;

    /**
     * Mounts the scrollbox.
     * @param el
     *  The scrollbox.
     * @param onScroll
     *  Scroll event handler.
     */
    public mount(
        el: HTMLElement,
        onScroll?: (scrollTop: number) => void
    ): void;
    public mount(
        el: HTMLElement,
        onScroll: (scrollTop: number) => void = () => {}
    ) {
        // Ensure ready to mount
        this.destroy();
        // Set scrollbox
        this._el = el;
        // Configure event listeners
        this._el.addEventListener("wheel", this._eventHandlers.wheel, { passive: true });
        // Configure emit scroll handler
        this._eventHandlers.emitScroll = onScroll;
    }

    /**
     * Destroys the scrollbox.
     */
    public destroy() {
        this._el?.removeEventListener("wheel", this._eventHandlers.wheel);
    }

    /**
     * Scroll wheel behavior.
     * @remarks
     *  To ensure a natural scrolling experience, mouse scrolling and trackpad
     *  scrolling are handled differently.
     *
     *  ## Intended Behavior
     *   - Mouse: Each click of the mouse wheel moves the selection up or down
     *     one item.
     *   - Trackpad: Scrolling on the trackpad smoothly moves the selection
     *     through the list at a controlled pace.
     *
     *  ## Scrolling Heuristic
     *  Unfortunately, there is no way to reliably identify the input device
     *  (mouse vs. trackpad). Instead, this function implements a heuristic
     *  that attempts to treat these devices differently.
     *
     *  1. **Initial Scroll Detection**: The function checks if the current
     *  scroll event (`event`) is the first in a series of scroll events by
     *  comparing the time elapsed (`timeDelta`) since the last scroll event.
     *
     *  2. **Device Heuristic**: If the scroll event is the first in a series,
     *  the function evaluates the scroll distance:
     *
     *   - For physical distance (`wheelDeltaY`), a threshold of ±13 is used.
     *   - For digital distance (`deltaY`), a threshold of ±3 is used.
     *
     *  If the scroll distance exceeds these thresholds, the input is likely
     *  from a mouse, and the selection jumps to the adjacent item.
     *
     *  3. **Continuous Scrolling**: For subsequent scroll events in the series,
     *  the cursor is moved incrementally based on `deltaY`. To prevent abrupt
     *  jumps, the movement is clamped so that a single event never scrolls
     *  more than one item at a time.
     *
     * 4. **Cursor Reset**: At the end of the scroll action, the cursor is
     * automatically centered on the current item.
     * @param event
     *  The wheel event.
     */
    private onScrollWheel(event: WheelEvent) {
        // Update time delta
        const nextScroll = new Date();
        const lastScroll = this._lastScroll;
        this._lastScroll = nextScroll;
        const height = RawScrollListBox.itemScrollHeight;
        // Determine if first mouse wheel
        const timeDelta = nextScroll.getTime() - lastScroll.getTime();
        let isFirstMouseWheel = timeDelta > RawScrollListBox.newScrollActionPeriod;
        if ("wheelDeltaY" in event && typeof event.wheelDeltaY === "number") {
            isFirstMouseWheel &&= event.wheelDeltaY <= -12 || 12 <= event.wheelDeltaY;
        } else {
            isFirstMouseWheel &&= event.deltaY < -3 || 3 < event.deltaY;
        }
        // Move cursor
        const cursor = this.cursor;
        if (isFirstMouseWheel) {
            // Jump to adjacent item
            this.jumpToItem(this.index + Math.sign(event.deltaY));
        } else {
            // Move cursor
            this.cursor += clamp(event.deltaY, -height, height);
            // Clear cursor reset
            clearTimeout(this._resetCursorId);
            // Reset cursor on item
            this._resetCursorId = window.setTimeout(() => {
                this.jumpToItem(this.index);
            }, RawScrollListBox.newScrollActionPeriod);
        }
        // Selectively propagate scroll event
        const canMove = 0 < this.cursor && this.cursor < this.scrollHeight;
        const hasMoved = cursor - this.cursor !== 0;
        const isScrollable = this.scrollHeight > this.clientHeight;
        const shouldStopPropagate = !this.propagateScroll && isScrollable;
        if (shouldStopPropagate || hasMoved || canMove) {
            event?.stopPropagation();
        }
        // Emit scroll
        this._eventHandlers.emitScroll(this.index);
    }

}

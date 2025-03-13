import "./RawFocusBox.css";
import type { FocusEventHandlers } from "./FocusEventHandlers";

export class RawFocusBox {

    /**
     * The focus box's class name.
     */
    private static focusBoxClassName: string = "raw-focus-box-container";


    /**
     * The focus box's {@link HTMLElement}.
     */
    private _el: HTMLElement | null;

    /**
     * True if the box is focused, false otherwise.
     */
    private _focused: boolean;

    /**
     * The focus box's tab index.
     */
    private _tabIndex: number;

    /**
     * The focus box's pointer event.
     */
    private _pointerEvent: "click" | "pointerdown" | null;

    /**
     * The focus box's event handlers.
     */
    private _eventHandlers: FocusEventHandlers;

    /**
     * Indicates if an exit item has just been clicked or not.
     */
    private _lastTarget: HTMLElement | null;


    /**
     * Creates a new {@link RawFocusBox}.
     */
    constructor();

    /**
     * Creates a new {@link RawFocusBox}.
     * @param pointerEvent
     *  The focus box's pointer event.
     * @param tabIndex
     *  The focus box's tab index.
     */
    constructor(
        pointerEvent?: "click" | "pointerdown" | null,
        tabIndex?: number
    );
    constructor(
        pointerEvent: "click" | "pointerdown" | null = null,
        tabIndex: number = -1
    ) {
        this._el = null;
        this._focused = false;
        this._tabIndex = tabIndex;
        this._pointerEvent = pointerEvent;
        this._eventHandlers = {
            focusIn: this.onFocusIn.bind(this),
            emitFocusIn: () => {},
            focusOut: this.onFocusOut.bind(this),
            emitFocusOut: () => {},
            pointerdown: this.onPointerEvent.bind(this),
            targetUpdate: this.onTargetUpdate.bind(this)
        };
        this._lastTarget = null;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Mount / Destroy  ///////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Mounts the focus box.
     * @param el
     *  The focus box.
     */
    public mount(
        el: HTMLElement
    ): void;

    /**
     * Mounts the focus box.
     * @param el
     *  The focus box.
     * @param focusIn
     *  Focus in event handler.
     * @param focusOut
     *  Focus out event handler.
     */
    public mount(
        el: HTMLElement,
        focusIn?: () => void,
        focusOut?: () => void
    ): void;
    public mount(
        el: HTMLElement,
        focusIn: () => void = () => {},
        focusOut: () => void = () => {}
    ) {
        this._el = el;
        this._el.classList.add(RawFocusBox.focusBoxClassName);
        this._el.setAttribute("tabindex", `${this._tabIndex}`);
        this._el.addEventListener("focusin", this._eventHandlers.focusIn);
        this._el.addEventListener("focusout", this._eventHandlers.focusOut);
        if (this._pointerEvent) {
            this._el.addEventListener("pointerdown", this._eventHandlers.targetUpdate);
            this._el.addEventListener(this._pointerEvent, this._eventHandlers.pointerdown);
        }
        this._eventHandlers.emitFocusIn = focusIn;
        this._eventHandlers.emitFocusOut = focusOut;
    }

    public destroy() {
        this._el?.classList.remove(RawFocusBox.focusBoxClassName);
        this._el?.removeAttribute("tabindex");
        this._el?.removeEventListener("focusin", this._eventHandlers.focusIn);
        this._el?.removeEventListener("focusout", this._eventHandlers.focusOut);
        if (this._pointerEvent) {
            this._el?.removeEventListener("pointerdown", this._eventHandlers.targetUpdate);
            this._el?.removeEventListener(this._pointerEvent, this.onPointerEvent);
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Events  ////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Focus in behavior.
     */
    private onFocusIn() {
        // If target currently focused, do nothing
        if (this._focused) {
            return;
        }
        // If last target was inside an element with an exit flag...
        else if (this.isTargetInExitElement(this._lastTarget)) {
            // ...force container out of focus
            this._el!.blur();
        }
        // If last target was inside container...
        else {
            // ...emit focus
            this._focused = true;
            this._eventHandlers.emitFocusIn();
        }
    }

    /**
     * Focus out behavior.
     * @param event
     *  The focus event.
     */
    private onFocusOut(event: FocusEvent) {
        // If target is not a child of this container, unfocus.
        const target = event.relatedTarget as Node | null;
        if (this._focused && !this._el!.contains(target)) {
            this._focused = false;
            this._eventHandlers.emitFocusOut();
        }
    }

    /**
     * Target update behavior.
     * @param event
     *  The pointer event.
     */
    private onTargetUpdate(event: PointerEvent) {
        this._lastTarget = event.target as HTMLElement;
    }

    /**
     * Pointer event behavior.
     * @param event
     *  The pointer event.
     */
    private onPointerEvent() {
        // If target is inside an element with an exit flag...
        if (this.isTargetInExitElement(this._lastTarget)) {
            // ...emit unfocus...
            this._focused = false;
            this._eventHandlers.emitFocusOut();
            // ...and force the container out of focus
            this._el!.blur();
        }
    }

    /**
     * Tests if an element has (or is contained within an element that has) the
     * `exit-focus-box` attribute.
     * @param el
     *  The element to test.
     * @returns
     *  True if the element has (or is contained within an element that has)
     *  the `exit-focus-box` attribute, false otherwise.
     */
    private isTargetInExitElement(el: HTMLElement | null) {
        while (el && this._el !== el) {
            if (el.hasAttribute("exit-focus-box")) {
                return true;
            }
            el = el.parentElement!;
        }
        return false;
    }

}

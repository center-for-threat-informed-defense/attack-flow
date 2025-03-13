export type FocusEventHandlers = {

    /**
     * Focus in handler.
     */
    focusIn: () => void;

    /**
     * Emit focus in handler.
     */
    emitFocusIn: () => void;

    /**
     * Focus out handler.
     * @param event
     *  The pointer event.
     */
    focusOut: (event: FocusEvent) => void;

    /**
     * Emit focus out handler.
     */
    emitFocusOut: () => void;

    /**
     * Pointer down handler.
     * @param event
     *  The pointer event.
     */
    pointerdown: (event: PointerEvent | MouseEvent) => void;

    /**
     * Target update handler.
     * @param event
     *  The pointer event.
     */
    targetUpdate: (event: PointerEvent) => void;


};

export type ScrollEventHandlers = {

    /**
     * Wheel event handler.
     * @param event
     *  The wheel event.
     */
    wheel: (event: WheelEvent) => void;

    /**
     * Scroll event handler.
     * @param event
     *  The wheel event.
     */
    scroll: () => void;

    /**
     * Emit scroll handler.
     * @param scrollTop
     *  The scroll's current position.
     */
    emitScroll: (scrollTop: number) => void;

    /**
     * Drag scroll handle event handler.
     * @param event
     *  The pointer event.
     */
    dragHandle: (event: PointerEvent) => void;

};

export type ScrollEventHandlers = {

    /**
     * Wheel event handler.
     * @param event
     *  The wheel event.
     */
    wheel: (event: WheelEvent) => void;

    /**
     * Emit scroll handler.
     * @param index
     *  The active item.
     */
    emitScroll: (index: number) => void;

};

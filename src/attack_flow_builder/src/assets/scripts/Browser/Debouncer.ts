export class Debouncer {

    /**
     * The debouncer's timer id.
     */
    private timer: number;

    /**
     * The number of seconds the debouncer should hold before firing.
     */
    private seconds: number;


    /**
     * Creates a {@link Debouncer}.
     * @param seconds
     *  The number of seconds the debouncer should hold before firing.
     */
    constructor(seconds: number) {
        this.timer = -1;
        this.seconds = seconds;
    }


    /**
     * Debounces the provided function call.
     * @remarks
     *  `callback` is only invoked if not superseded by another call before the
     *  debounce duration elapses.
     * @param callback
     *  The function to call.
     */
    public call(callback: () => void) {
        clearTimeout(this.timer);
        this.timer = window.setTimeout(callback, this.seconds * 1000);
    }

}

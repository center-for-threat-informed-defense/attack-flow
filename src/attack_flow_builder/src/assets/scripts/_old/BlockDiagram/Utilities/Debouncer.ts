export default class Debouncer {
    private timer: number | null;
    private seconds: number;

    /**
     * Creates a {@link Debouncer}.
     * @param duration
     *  The number of seconds that the debouncer waits before calling its target function.
     */
    constructor(seconds: number) {
        this.timer = null;
        this.seconds = seconds;
    }

    /**
     * Debounce a function call.
     * @param fn
     *  The function to call. This is only called if not superseded by another call before the debounce
     *  duration elapses.
     */
    public call(fn: TimerHandler) {
        if (this.timer !== null) {
            clearTimeout(this.timer);
        }

        this.timer = setTimeout(fn, this.seconds * 1000);
    }
}

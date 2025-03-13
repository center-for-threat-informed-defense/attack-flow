/* eslint-disable @typescript-eslint/no-explicit-any */
export class EventEmitter<T extends object> {

    /**
     * The event listeners.
     */
    private _listeners: Map<string, { callback: Callback, ctx?: object }[]>;


    /**
     * Creates a new {@link EventEmitter}.
     */
    constructor() {
        this._listeners = new Map();
    }


    /**
     * Adds a listener function for the named event.
     * @param event
     *  The name of the event.
     * @param callback
     *  The function to call when the event is raised.
     * @param ctx
     *  The function's execution context.
     */
    public on<K extends keyof T>(event: K, callback: T[K]): void;

    /**
     * Adds a listener function for the named event.
     * @param event
     *  The name of the event.
     * @param callback
     *  The function to call when the event is raised.
     * @param ctx
     *  The function's execution context.
     */
    public on<K extends keyof T>(event: K, callback: T[K], ctx?: object): void;
    public on(event: string, callback: Callback, ctx?: object) {
        if (!this._listeners.has(event)) {
            this._listeners.set(event, []);
        }
        this._listeners.get(event)!.unshift({ callback, ctx });
    }

    /**
     * Adds a one-time listener function for the named event.
     * @param event
     *  The name of the event.
     * @param callback
     *  The function to call when the event is raised.
     */
    public once<K extends keyof T>(event: K, callback: Callback): void;
    public once(event: string, callback: Callback) {
        const once = (...args: any[]) => {
            // Remove this function
            const actions = this._listeners.get(event)!;
            const index = actions.findIndex(
                o => o.callback === once
            );
            actions.splice(index, 1);
            // Invoke callback
            callback(...args);
        };
        if (!this._listeners.has(event)) {
            this._listeners.set(event, []);
        }
        this._listeners.get(event)!.unshift({ callback: once });
    }

    /**
     * Dispatches the listener functions associated with a given event.
     * @param event
     *  The name of the event to raise.
     * @param args
     *  The arguments to pass to the listener functions.
     */
    protected emit<K extends keyof T>(event: K, ...args: any[]): void;
    protected emit(event: string, ...args: any[]) {
        if (this._listeners.has(event)) {
            const listeners = this._listeners.get(event)!;
            for (let i = listeners.length - 1; 0 <= i; i--) {
                if (listeners[i].ctx) {
                    listeners[i].callback.apply(listeners[i].ctx, args);
                } else {
                    listeners[i].callback(...args);
                }
            }
        }
    }

    /**
     * Removes an event listener function associated with a given event.
     * @param event
     *  The name of the event.
     * @param callback
     *  The function to remove.
     */
    public removeEventListener<K extends keyof T>(event: K, callback: T[K]): void;

    /**
     * Removes an event listener function associated with a given event.
     * @param event
     *  The name of the event.
     * @param callback
     *  The function to remove.
     * @param ctx
     *  The function's execution context.
     */
    public removeEventListener<K extends keyof T>(event: K, callback: T[K], ctx?: object): void;
    public removeEventListener(event: string, callback: Callback, ctx?: object) {
        if (this._listeners.has(event)) {
            const actions = this._listeners.get(event)!;
            const index = actions.findIndex(
                o => o.callback === callback && o.ctx === ctx
            );
            actions.splice(index, 1);
        }
    }

    /**
     * Removes all event listeners associated with a given execution context.
     * @param ctx
     *  The execution context.
     */
    public removeEventListenersWithContext(ctx: object) {
        for (const event of this._listeners.keys()) {
            const listeners = this._listeners.get(event)!.filter(o => o.ctx !== ctx);
            this._listeners.set(event, listeners);
        }
    }

    /**
     * Removes the listener functions associated with all events.
     */
    protected removeAllListeners(): void;

    /**
     * Removes the listener functions associated with a given event.
     * @param event
     *  The name of the event.
     */
    protected removeAllListeners<K extends keyof T>(event?: K): void;
    protected removeAllListeners(event?: string) {
        if (event) {
            this._listeners.delete(event);
        } else {
            this._listeners.clear();
        }
    }

}

type Callback = (...args: any[]) => void;

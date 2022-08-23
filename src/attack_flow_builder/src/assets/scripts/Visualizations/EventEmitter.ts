export class EventEmitter {
    
    private _listeners: Map<string, Function[]>;

    /**
     * Creates a new EventEmitter. 
     */
    constructor(){
        this._listeners = new Map();
    }

    /**
     * Adds a listener function for the named event.
     * @param event
     *  The name of the event.
     * @param callback
     *  The function to call when the event is raised.
     */
    public on(event: string, callback: Function) {
        if(!this._listeners.has(event))
            this._listeners.set(event, []);
        this._listeners.get(event)!.unshift(callback);
    }

    /**
     * Adds a one-time listener function for the named event.
     * @param event
     *  The name of the event.
     * @param callback
     *  The function to call when the event is raised.
     */
    public once(event: string, callback: Function) {
        let once = (...args: any[]) => {
            let actions = this._listeners.get(event)!;
            actions.splice(actions.indexOf(once), 1);
            callback(...args);
        }
        if(!this._listeners.has(event))
            this._listeners.set(event, []);
        this._listeners.get(event)!.unshift(once);
    }

    /**
     * Dispatches the listener functions associated with a given event.
     * @param event
     *  The name of the event to raise.
     * @param args
     *  The arguments to pass to the listener functions.
     */
    public emit(event: string, ...args: any[]) {
        if(this._listeners.has(event)) {
            let listeners = this._listeners.get(event)!;
            for(let i = listeners.length - 1; 0 <= i; i--) {
                listeners[i](...args);
            }
        }
    }

    /**
     * Removes the listener functions associated with a given event.
     * @param event
     *  The name of the event.
     */
    public removeAllListeners(event: string) {
        this._listeners.delete(event);
    }

}

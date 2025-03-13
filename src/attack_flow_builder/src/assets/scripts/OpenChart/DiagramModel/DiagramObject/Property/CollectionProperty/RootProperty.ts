import { Crypto } from "@OpenChart/Utilities";
import { DictionaryProperty } from "..";

export class RootProperty extends DictionaryProperty {

    /**
     * The property's event listeners.
     */
    private listeners: Map<string, () => void>;


    /**
     * Creates a new {@link RootProperty}.
     */
    constructor() {
        super(Crypto.randomUUID());
        this.listeners = new Map();
    }


    /**
     * Subscribes an event listener to property updates.
     * @param id
     *  The event listener's id.
     * @param handler
     *  The event listener.
     */
    public subscribe(id: string, handler: () => void) {
        this.listeners.set(id, handler);
    }

    /**
     * Unsubscribes an event listener from property updates.
     * @param id
     *  The event listener's id.
     */
    public unsubscribe(id: string) {
        this.listeners.delete(id);
    }

    /**
     * Updates the property's parent.
     */
    protected updateParentProperty() {
        for (const handler of this.listeners.values()) {
            handler();
        }
    }

}

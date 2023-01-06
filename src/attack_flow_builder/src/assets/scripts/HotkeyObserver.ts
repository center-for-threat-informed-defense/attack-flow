///////////////////////////////////////////////////////////////////////////////
//  1. HotkeyObserver  ////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export class HotkeyObserver<T> {

    /**
     * The advance key state function, bound to the current object.
     */
    private _boundAdvanceKeyState: (e: KeyboardEvent) => void;

     /**
      * The reverse key state function, bound to the current object.
      */
    private _boundReverseKeyState: (e: KeyboardEvent) => void;

    /**
     * The function to call when a hotkey sequence is matched.
     */
    private _callback: (command: T) => void;

    /**
     * The DOM element the hotkey observer is watching.
     */
    private _container: HTMLElement | null;

    /**
     * The hotkey observer's hotkey-id-to-item map.
     */
    private _hotkeyIdMap: Map<string, Hotkey<T>>;

    /**
     * The current key state.
     */
    private _keyState: string;


    /**
     * Creates a new {@link HotkeyObserver}.
     * @param callback
     *  The function to call once a hotkey sequence is triggered.
     * @param recognitionDelay
     *  The time to wait (in milliseconds) before firing the hotkey callback.
     */
    constructor(callback: (command: T) => void, recognitionDelay: number) {
        this._boundAdvanceKeyState = this.advanceKeyState.bind(this);
        this._boundReverseKeyState = this.reverseKeyState.bind(this);
        this._callback = callback;
        this._container = null;
        this._hotkeyIdMap = new Map();
        this._keyState = ".";
    }


    /**
     * Binds the HotkeyObserver to an HTML element.
     * @param container
     *  The HTML element to bind to.
     */
    public observe(container: HTMLElement) {
        this._container = container;
        this._container.addEventListener("keydown", this._boundAdvanceKeyState);
        this._container.addEventListener("keyup", this._boundReverseKeyState);
    }

    /**
     * Unbinds the HotkeyObserver from the HTML element.
     */
    public disconnect() {
        this._container?.removeEventListener("keydown", this._boundAdvanceKeyState);
        this._container?.removeEventListener("keyup", this._boundReverseKeyState);
    }

    /**
     * Configures the hotkeys to listen for.
     * @param keyMap
     *  An array of hotkeys.
     * @throws { OverlappingHotkeysError }
     *  If any hotkey sequences overlap with each other.
     */
    public setHotkeys(keyMap: Hotkey<T>[]) {
        this._hotkeyIdMap = new Map<string, Hotkey<T>>();
        for (let item of keyMap) {
            if (item.shortcut === "") continue;
            // Derive hotkey id
            let hotkeyId = this.keySequenceToHotKeyId(item.shortcut);
            // Ensure hotkey id doesn't overlap with others 
            for (let id of this._hotkeyIdMap.keys()) {
                if (id.startsWith(hotkeyId) || hotkeyId.startsWith(id)) {
                    throw new OverlappingHotkeysError(
                        `Overlapping key sequences ('${
                            id
                        }' and '${
                            hotkeyId
                        }') are not allowed.`
                    );
                }
            }
            // Add hotkey
            this._hotkeyIdMap.set(hotkeyId, item);
        }
    }

    /**
     * Tests if a hotkey sequence is active.
     * @param sequence
     *  The hotkey sequence.
     * @param strict
     *  [true]
     *   The active keys must match the provided hotkey sequence exactly.
     *  [false]
     *   The active keys only need to contain the provided hotkey sequence.
     *  (Default: true)
     * @returns
     *  True if the provided hotkey sequence is active, false otherwise.
     */
    public isHotkeyActive(sequence: string, strict: boolean = true): boolean {
        let id = this.keySequenceToHotKeyId(sequence);
        return strict ? this._keyState === id : this._keyState.includes(id);
    }

    /**
     * Adds a key event to the current key state.
     * @param e
     *  The keydown event.
     */
    private advanceKeyState(e: KeyboardEvent) {
        let key = e.key.toLocaleLowerCase();
        
        // If inside input field, ignore hotkeys
        if((e.target as any).tagName === "INPUT") {
            return;
        }

        // Advanced current key state
        let isRepeat = this._keyState.endsWith(`.${ key }.`);
        if(!isRepeat) {
            this._keyState += `${ key }.`
        }
        
        // Check key state
        if (this._hotkeyIdMap.has(this._keyState)) {
            let hotkey = this._hotkeyIdMap.get(this._keyState)!;
            // If in repeat state and hotkey is not repeatable:
            if(isRepeat && !hotkey.repeatable) {
                // Prevent all browser behavior
                e.preventDefault();
                // Bail
                return;    
            }
            // Disable browser default behavior if not requested
            if (!hotkey.allowBrowserBehavior) {
                e.preventDefault();
            }
            // Execute shortcut
            this._callback(hotkey.data!);
        } else {
            // If no key matched, block browser behavior by default
            e.preventDefault();
        }

    }

    /**
     * Removes a key event from the current key state. 
     * @param e
     *  The keyup event.
     */
    private reverseKeyState(e: KeyboardEvent) {
        let key = e.key.toLocaleLowerCase();
        this._keyState = this._keyState.replace(`.${ key }.`, ".");
    }

    /**
     * Converts a key sequence to its hotkey id.
     * @param sequence
     *  The sequence to evaluate.
     * @returns
     *  The sequence's hotkey id.
     */
    private keySequenceToHotKeyId(sequence: string): string {
        let hotkeyId = sequence
            .toLocaleLowerCase()
            .replace(/\s+/g, '')
            .split("+")
            .join(".");
        return `.${hotkeyId}.`
    }

}

export class OverlappingHotkeysError extends Error {

    /**
     * Creates a new OverlappingHotkeysError.
     * @param message
     *  The error message.
     */
    constructor(message: string) {
        super(message);
    }

}


///////////////////////////////////////////////////////////////////////////////
//  2. Hotkey  ////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export interface Hotkey<T> {

    /**
     * The hotkey's shortcut.
     */
    shortcut: string

    /**
     * The hotkey's data.
     */
    data?: T

    /**
     * If the hotkey is repeatable.
     */
    repeatable: boolean

    /**
     * If the hotkey is disabled.
     */
    disabled?: boolean

    /**
     * If the browser's default behavior should be permitted.
     */
    allowBrowserBehavior?: boolean

}

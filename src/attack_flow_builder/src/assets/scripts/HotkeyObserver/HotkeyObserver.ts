import { Hotkey, RunTaskHotkey, HotkeyAction } from "./";

export class HotkeyObserver {

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
    private _callback: (id: string, data?: any) => void;

    /**
     * The hotkey observer's call loop.
     */
    private _callLoop: NodeJS.Timeout | undefined;

    /**
     * The DOM element the hotkey observer is watching.
     */
    private _container: HTMLElement | null;

    /**
     * A file <input> element used for loading files.
     */
    private _fileInput: HTMLInputElement;

    /**
     * The hotkey observer's hotkey-id-to-item map.
     */
    private _hotkeyIdMap: Map<string, Hotkey>;

    /**
     * The current key state.
     */
    private _keyState: string;
    
    /**
     * The amount of time (in milliseconds) a hotkey sequence needs to be held
     * before its raised.
     */
    private _recognitionDelay: number;

    /**
     * The id of the hotkey item that triggered the last file read.
     */
    private _selectedFileId: string | null;


    /**
     * Creates a new {@link HotkeyObserver}.
     * @param callback
     *  The function to call once a hotkey sequence is triggered.
     * @param recognitionDelay
     *  The time to wait (in milliseconds) before firing the hotkey callback.
     */
    constructor(callback: (id: string) => void, recognitionDelay: number) {
        
        // Configure state
        this._boundAdvanceKeyState = this.advanceKeyState.bind(this);
        this._boundReverseKeyState = this.reverseKeyState.bind(this);
        this._callback = callback;
        this._callLoop = undefined;
        this._container = null;
        this._hotkeyIdMap = new Map();
        this._keyState = ".";
        this._recognitionDelay = recognitionDelay;
        this._selectedFileId = null;
        
        // Configure file input element
        this._fileInput = document.createElement("input");
        this._fileInput.type = "file";
        this._fileInput.addEventListener("change", this.readFile.bind(this));
        
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
    public setHotkeys(keyMap: Hotkey[]) {
        this._hotkeyIdMap = new Map<string, Hotkey>();
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
     * Sets the recognition delay for triggered hotkeys.
     * @param recognitionDelay
     *  The delay in milliseconds.
     */
    public setRecognitionDelay(recognitionDelay: number) {
        this._recognitionDelay = recognitionDelay;
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
        // Only acknowledge a key once
        if (this._keyState.endsWith(`.${ key }.`))
            return;
        // Advanced current key state
        clearTimeout(this._callLoop);
        this._keyState += `${ key }.`
        // If inside input field, ignore hotkeys
        if((e.target as any).tagName === "INPUT")
            return;
        // Check key state
        if (this._hotkeyIdMap.has(this._keyState)) {
            let hotkey = this._hotkeyIdMap.get(this._keyState)!;
            // Disable browser default behavior if not requested
            if (!hotkey.allowBrowserBehavior)
                e.preventDefault();
            // Execute shortcut
            this.triggerHotkey(hotkey);
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
        clearTimeout(this._callLoop);
        let key = e.key.toLocaleLowerCase();
        this._keyState = this._keyState.replace(`.${ key }.`, ".");
    }

    /**
     * Triggers the provided hotkey.
     * @param hotkey
     *  The hotkey item to trigger.
     */
    private triggerHotkey(hotkey: Hotkey) {
        if (hotkey.disabled)
            return;
        this._callLoop = setTimeout(() => {
            switch (hotkey.action) {
                case HotkeyAction.RunTask:
                    this._callback(hotkey.id);
                    if (hotkey.repeat)
                        this.runRepeat(hotkey);
                    break;
                case HotkeyAction.ToggleValue:
                    this._callback(hotkey.id, { value: hotkey.value });
                    break;
                case HotkeyAction.OpenLink:
                    window.open(hotkey.link, "_blank");
                    this._keyState = ".";
                    this._callback(hotkey.id);
                    break;
                case HotkeyAction.OpenFile:
                    this._fileInput.click();
                    this._selectedFileId = hotkey.id;
                    this._callback(`__preload_${hotkey.id}`);
                    break;
            }
        }, this._recognitionDelay);
    }

    /**
     * Fires the provided {@link RunTaskHotkey} at its configured interval.
     * @param info
     *  The hotkey item.
     */
    private runRepeat(info: RunTaskHotkey) {
        let repeat = function (this: any) {
            // Call hotkey callback
            this._callback(info.id);
            // Schedule next call
            this._callLoop = setTimeout(repeat, info.repeat!.interval);
        }.bind(this);
        // Kick off call loop
        this._callLoop = setTimeout(repeat, info.repeat!.delay);
    }

    /**
     * Completes a file hotkey trigger. 
     * @param event
     *  The file read event.
     */
    private readFile(event: Event) {
        let file = (event.target as any).files[0];
        let reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            this._callback(this._selectedFileId!, {
                filename: file.name,
                file: e.target?.result
            })
            this._selectedFileId = null;
        }
        reader.readAsText(file);
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

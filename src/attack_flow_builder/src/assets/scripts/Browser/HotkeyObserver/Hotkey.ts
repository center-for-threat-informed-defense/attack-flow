export interface Hotkey<T> {

    /**
     * The hotkey's shortcut.
     */
    shortcut: string;

    /**
     * The hotkey's data.
     */
    data?: T;

    /**
     * If the hotkey is repeatable.
     */
    repeatable: boolean;

    /**
     * If the hotkey is disabled.
     */
    disabled?: boolean;

    /**
     * If the browser's default behavior should be permitted.
     */
    allowBrowserBehavior?: boolean;

}

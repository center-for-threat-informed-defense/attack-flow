/**
 * Tests if a hotkey was active during a mouse event.
 * @param event
 *  The mouse event.
 * @param hotkey
 *  The hotkey.
 * @returns
 *  True if the hotkey was active, false otherwise.
 */
export function wasHotkeyActive(event: MouseEvent, hotkey: string): boolean {
    switch(hotkey.toLocaleLowerCase()) {
        case "alt":
            return event.altKey;
        case "control":
            return event.ctrlKey;
        case "shift":
            return event.shiftKey;
        case "meta":
            return event.metaKey;
        default:
            throw new Error(`Cannot check '${hotkey}'.`)
    }
}

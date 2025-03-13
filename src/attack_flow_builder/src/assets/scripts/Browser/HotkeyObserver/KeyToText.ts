/**
 * Maps Windows modifier keys to text.
 */
export const KeyToTextWin: { [key: string]: string } = {
    Control    : "Ctrl",
    Escape     : "Esc",
    ArrowLeft  : "←",
    ArrowUp    : "↑",
    ArrowRight : "→",
    ArrowDown  : "↓",
    Delete     : "Del",
    Meta       : "Win"
}

/**
 * Maps MacOS modifier keys to text.
 */
export const KeyToTextMacOS: { [key: string]: string } = {
    Control    : "⌃",
    Escape     : "Esc",
    ArrowLeft  : "←",
    ArrowUp    : "↑",
    ArrowRight : "→",
    ArrowDown  : "↓",
    Delete     : "Del",
    Meta       : "⌘",
    Shift      : "⇧",
    Alt        : "⌥"
}
  
namespace Types {

    interface HotkeyRepeatOptions {
        delay: number,
        interval: number
    }

    export interface HotkeyItem {
        id: string,
        shortcut: string,
        disabled?: boolean,
        repeat?: HotkeyRepeatOptions
        browserShortcut?: boolean
    }

}
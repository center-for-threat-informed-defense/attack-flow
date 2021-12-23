namespace Types {

    type ContextMenuItemType = "submenu" | "action" | "file" | "link" | "toggle"

    interface ContextMenuBase<T extends ContextMenuItemType> {
        id   : string,
        text : string,
        type : T,
        disabled?: boolean
    }

    interface ContextMenuSubMenu extends ContextMenuBase<"submenu"> {
        sections : Array<ContextMenuSection>
    }

    interface ContextMenuAction extends ContextMenuBase<"action"> {
        shortcut?: string
    }

    interface ContextMenuFileAction extends ContextMenuBase<"file"> {
        shortcut?: string
    }
    
    interface ContextMenuLinkAction extends ContextMenuBase<"link"> {
        link: string
    }

    interface ContextMenuToggleAction extends ContextMenuBase<"toggle"> {
        shortcut?: string
        value: boolean
    }

    export interface ContextMenuSection {
        id: string,
        items: Array<ContextMenuItem>
    }

    export type ContextMenuItem = ContextMenuSubMenu | ContextMenuAction | ContextMenuFileAction | ContextMenuLinkAction | ContextMenuToggleAction

}
///////////////////////////////////////////////////////////////////////////////
//  1. Menu Types  ////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Context menu types.
 */
export enum MenuType {
    Action  = "action",
    Toggle  = "toggle",
    Submenu = "submenu"
}

/**
 * Item menu types.
 */
type ItemMenuTypes
    = MenuType.Action
    | MenuType.Toggle;


///////////////////////////////////////////////////////////////////////////////
//  2. Base Context Menu  /////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * The base context menu upon which all others are based.
 */
type ContextMenuBase<T extends MenuType> = {

    /**
     * The context menu's type.
     */
    type: T;

    /**
     * The context menu's display text.
     */
    text: string;

    /**
     * Whether the context menu is disabled or not.
     */
    disabled?: boolean;

};


///////////////////////////////////////////////////////////////////////////////
//  3. Context Submenu  ///////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * A context submenu.
 */
export type ContextMenuSubmenu<D> = ContextMenuBase<MenuType.Submenu> & {

    /**
     * The submenu's sections.
     */
    sections : ContextMenuSection<D>[];

};

/**
 * A context submenu's sections.
 */
export type ContextMenuSection<D> = {

    /**
     * The section's id.
     */
    id: string;

    /**
     * The section's context menus.
     */
    items: ContextMenu<D>[];

};


///////////////////////////////////////////////////////////////////////////////
//  4. Context Menu Items  ////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * A generic context menu item.
 */
export type GenericContextMenuItem<D, T extends ItemMenuTypes = ItemMenuTypes> = ContextMenuBase<T> & {

    /**
     * The item's data.
     */
    data: D;

    /**
     * The item's shortcut key.
     */
    shortcut?: string;

    /**
     * Whether the parent submenu should remain open upon selection.
     */
    keepMenuOpenOnSelect?: boolean;

};

/**
 * An action context menu item.
 */
export type ContextMenuActionItem<D> = GenericContextMenuItem<D, MenuType.Action>;

/**
 * A toggle context menu item.
 */
export type ContextMenuToggleItem<D> = GenericContextMenuItem<D, MenuType.Toggle> & {

    /**
     * The item's toggle state.
     */
    value: boolean;

};

/**
 * A context menu item.
 */
export type ContextMenuItem<T>
    = ContextMenuActionItem<T>
    | ContextMenuToggleItem<T>;


///////////////////////////////////////////////////////////////////////////////
//  5. Context Menu  //////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export type ContextMenu<T>
    = ContextMenuItem<T>
    | ContextMenuSubmenu<T>;

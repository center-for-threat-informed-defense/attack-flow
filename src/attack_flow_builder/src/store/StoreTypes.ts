import { Finder } from "./Finder"
import { PageEditor } from "@/store/PageEditor"
import { DiagramValidator } from "@/assets/scripts/DiagramValidator/DiagramValidator"
import { DiagramPublisher } from "@/assets/scripts/DiagramPublisher/DiagramPublisher"
import { DiagramProcessor } from "@/assets/scripts/DiagramProcessor/DiagramProcessor"
import { PageRecoveryBank } from "./PageRecoveryBank"
import { BlockDiagramSchema } from "@/assets/scripts/BlockDiagram/DiagramFactory"
import { DiagramObjectModel } from "@/assets/scripts/BlockDiagram"


///////////////////////////////////////////////////////////////////////////////
//  1. Stores  ////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Central Module Store
 */
export type ModuleStore = {
    ApplicationStore: ApplicationStore,
    ContextMenuStore: ContextMenuStore,
    HotkeyStore: HotkeyStore
}


/**
 * Application Store
 */
export type ApplicationStore = {
    settings: AppSettings,
    clipboard: DiagramObjectModel[],
    processor: DiagramProcessor | undefined,
    publisher: DiagramPublisher | undefined,
    activePage: PageEditor,
    finder: Finder,
    recoveryBank: PageRecoveryBank,
}

/**
 * Context Menu Store
 */
export type ContextMenuStore = {}

/**
 * Hotkey Store
 */
export type HotkeyStore = {}


///////////////////////////////////////////////////////////////////////////////
//  2. App Settings  //////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Base App Settings
 */
export const BaseAppSettings: AppSettings = {
    file: {
        image_export: {
            padding: 0,
        }
    },
    edit: {
        clone_offset: [0, 0]
    },
    view: {
        diagram: {
            display_grid: true,
            display_shadows: true,
            display_debug_mode: false,
            render_high_quality: true,
            disable_shadows_at: 0
        },
        splash_menu: {
            display_menu: true
        }
    },
    hotkeys: {
        file: { 
            new_file: "",
            open_file: "",
            save_file: "",
            save_image: "",
            save_select_image: "",
            publish_file: "",
            open_library: "",
            save_library: ""
        },
        edit: {
            undo: "",
            redo: "",
            cut: "",
            copy: "",
            paste: "",
            delete: "",
            duplicate: "",
            find: "",
            find_next: "",
            find_previous: "",
            select_all: ""
        },
        layout: {
            selection_to_front: "",
            selection_to_back: "",
            bring_selection_forward: "",
            send_selection_backward: "",
            align_left: "",
            align_center: "",
            align_right: "",
            align_top: "",
            align_middle: "",
            align_bottom: "",
            group: "",
            ungroup: "",
            open_group: "",
            close_group: ""
        },
        view: {
            toggle_grid: "",
            toggle_shadows: "",
            reset_view: "",
            zoom_in: "",
            zoom_out: "",
            fullscreen: "",
            jump_to_selection: "",
            jump_to_parents: "",
            jump_to_children: "",
            toggle_debug_view: "",
        },
        select: {
            many: ""
        }
    }
}

/**
 * App Settings File
 */
export type AppSettings = {
    file: {
        image_export: {
            padding: number
        }
    },
    edit: {
        clone_offset: [number, number]
    },
    view: {
        diagram: DiagramDisplaySettings,
        splash_menu: {
            display_menu: boolean
        }
    },
    hotkeys: {
        file: FileHotkeys,
        edit: EditHotkeys,
        layout: LayoutHotkeys,
        view: ViewHotkeys,
        select: SelectHotkeys
    }
}

/**
 * Diagram display settings
 */
export type DiagramDisplaySettings = {
    display_grid: boolean,
    display_shadows: boolean,
    display_debug_mode: boolean,
    render_high_quality: boolean,
    disable_shadows_at: number
}

/**
 * File hotkeys
 */
export type FileHotkeys = { 
    new_file: string,
    open_file: string,
    save_file: string,
    save_image: string,
    save_select_image: string,
    publish_file: string,
    open_library: string,
    save_library: string
}

/**
 * Edit hotkeys
 */
export type EditHotkeys = {
    undo: string,
    redo: string,
    cut: string,
    copy: string,
    paste: string,
    delete: string,
    duplicate: string,
    find: string,
    find_next: string,
    find_previous: string,
    select_all: string
}

/**
 * Layout hotkeys
 */
export type LayoutHotkeys = {
    selection_to_front: string,
    selection_to_back: string,
    bring_selection_forward: string,
    send_selection_backward: string,
    align_left: string,
    align_center: string,
    align_right: string,
    align_top: string,
    align_middle: string,
    align_bottom: string,
    group: string,
    ungroup: string,
    open_group: string,
    close_group: string
}

/**
 * View hotkeys
 */
export type ViewHotkeys = {
    toggle_grid: string,
    toggle_shadows: string,
    reset_view: string,
    zoom_in: string,
    zoom_out: string,
    jump_to_selection: string,
    jump_to_parents: string,
    jump_to_children: string,
    fullscreen: string,
    toggle_debug_view: string
}

/**
 * Select hotkeys
 */
export type SelectHotkeys = {
    many: string
}


///////////////////////////////////////////////////////////////////////////////
//  3. App Configuration  /////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Configuration for a splash button.
 */
export type SplashButton = {
    title: string;
    description: string;
    url?: string;
}

/**
 * App Configuration File
 */
export type AppConfiguration = {
    is_web_hosted: boolean,
    application_name: string,
    application_icon: string,
    splash: {
        organization: string,
        new_file: SplashButton
        open_file: SplashButton
        help_links: SplashButton[]
    },
    file_type_name: string,
    file_type_extension: string,
    schema: BlockDiagramSchema,
    menus: {
        help_menu: {
            help_links: { text: string, url: string }[]
        }
    },
    validator?: typeof DiagramValidator,
    publisher?: typeof DiagramPublisher,
    processor?: typeof DiagramProcessor
}


///////////////////////////////////////////////////////////////////////////////
//  4. Type Helpers  //////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Returns all keys of object type `T` whose value matches type `V`.
 * 
 * Typescript Reference: 
 *  - {@link https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#mapping-modifiers Mapped Type Modifiers}
 *  - {@link https://www.typescriptlang.org/docs/handbook/2/conditional-types.html Conditional Types}
 *  - {@link https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html Index Access Types} 
 */
export type ObjectKeysOfType<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];


/**
 * Returns all valid key/value pairs from type `T`.
 */
export type KeyValuePairs<T> = {
    [K in keyof T] : {
        key: K,
        value: T[K]
    }
}[keyof T];


///////////////////////////////////////////////////////////////////////////////
//  5. Page Editor  ///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export * from "./PageEditor";

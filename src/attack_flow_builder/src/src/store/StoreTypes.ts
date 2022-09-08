import { DiagramValidator } from "@/assets/scripts/DiagramValidator/DiagramValidator"
import { DiagramPublisher } from "@/assets/scripts/DiagramPublisher/DiagramPublisher"
import { BlockDiagramSchema } from "@/assets/scripts/BlockDiagram/DiagramFactory"
import { BlockDiagramDocument } from "@/assets/scripts/BlockDiagram/BlockDiagramDocument"
import { 
    DiagramObjectModel,
    PageEditor,
    PageModel
} from "@/assets/scripts/BlockDiagram"


///////////////////////////////////////////////////////////////////////////////
//  1. Stores  ////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Central Module Store
 */
export type ModuleStore = {
    ActiveDocumentStore: ActiveDocumentStore
    ActivePageStore: ActivePageStore,
    AppActionsStore: AppActionsStore,
    AppSettingsStore: AppSettingsStore,
    ContextMenuStore: ContextMenuStore,
    HotkeyStore: HotkeyStore
}

/**
 * Active Document Store
 */
export type ActiveDocumentStore = {
    document: BlockDiagramDocument,
    clipboard: DiagramObjectModel[],
    publisher: DiagramPublisher | undefined
}

/**
 * Active Page Store
 */
export type ActivePageStore = {
    page: {
        trigger: number,
        editor: PageEditor,
        ref: PageModel
    },
    hovers: DiagramObjectModel[],
    selects: { 
        trigger: number, 
        ref: Map<string, DiagramObjectModel>
    },
    transform: {
        x: number,
        y: number,
        k: number
    },
    validator: DiagramValidator | undefined
}

/**
 * App Actions Store
 */
export type AppActionsStore = {}

/**
 * App Settings Store
 */
export type AppSettingsStore = {
    settings: AppSettings
}

/**
 * Hotkey Store
 */
export type HotkeyStore = {}

/**
 * Context Menu Store
 */
export type ContextMenuStore = {}


///////////////////////////////////////////////////////////////////////////////
//  2. App Settings  //////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * App Settings file
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
        diagram: DiagramDisplaySettings
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
export type DiagramDisplaySetting = KeyValuePairs<DiagramDisplaySettings>;

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
 * The application's configuration
 */
export type AppConfiguration = {
    file_type_name: string,
    file_type_extension: string,
    schema: BlockDiagramSchema,
    help_links: { text: string, url: string }[],
    validator?: typeof DiagramValidator,
    publisher?: typeof DiagramPublisher
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

/**
 * Marks all types and subtypes of `T` as readonly.
 */
type DeepReadonly<T> = {
    readonly [P in keyof T]: DeepReadonly<T[P]>
}

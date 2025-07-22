/**
 * Base App Settings
 */
export const BaseAppSettings: AppSettings = {
    file: {
        image_export: {
            padding: 0,
            include_background: true
        }
    },
    edit: {
        clone_offset: [0, 0],
        anchor_line_template: ""
    },
    view: {
        diagram: {
            display_animations: true,
            display_shadows: true,
            display_debug_info: false,
            theme: ""
        },
        search: {
            display: false
        },
        splash_menu: {
            display_menu: true
        }
    },
    hotkeys: {
        file: {
            new_file: "",
            open_file: "",
            open_stix_file: "",
            import_file: "",
            import_stix_file: "",
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
            select_all: "",
            unselect_all: "",
            select_many: "",
            select_marquee: ""
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
            toggle_animations: "",
            toggle_shadows: "",
            reset_view: "",
            zoom_in: "",
            zoom_out: "",
            fullscreen: "",
            jump_to_selection: "",
            jump_to_parents: "",
            jump_to_children: "",
            toggle_debug_info: ""
        }
    }
};

/**
 * App Settings File
 */
export type AppSettings = {
    file: {
        image_export: {
            padding: number;
            include_background: boolean;
        };
    };
    edit: {
        clone_offset: [number, number];
        anchor_line_template: string;
    };
    view: {
        diagram: DiagramDisplaySettings;
        search: {
            display: boolean;
        };
        splash_menu: {
            display_menu: boolean;
        };
    };
    hotkeys: {
        file: FileHotkeys;
        edit: EditHotkeys;
        layout: LayoutHotkeys;
        view: ViewHotkeys;
    };
};

/**
 * Diagram display settings
 */
export type DiagramDisplaySettings = {
    display_shadows: boolean;
    display_debug_info: boolean;
    display_animations: boolean;
    theme: string;
};

/**
 * File hotkeys
 */
export type FileHotkeys = {
    new_file: string;
    open_file: string;
    open_stix_file: string;
    import_file: string;
    import_stix_file: string;
    save_file: string;
    save_image: string;
    save_select_image: string;
    publish_file: string;
    open_library: string;
    save_library: string;
};

/**
 * Edit hotkeys
 */
export type EditHotkeys = {
    undo: string;
    redo: string;
    cut: string;
    copy: string;
    paste: string;
    delete: string;
    duplicate: string;
    find: string;
    find_next: string;
    find_previous: string;
    select_all: string;
    unselect_all: string;
    select_many: string;
    select_marquee: string;
};

/**
 * Layout hotkeys
 */
export type LayoutHotkeys = {
    selection_to_front: string;
    selection_to_back: string;
    bring_selection_forward: string;
    send_selection_backward: string;
    align_left: string;
    align_center: string;
    align_right: string;
    align_top: string;
    align_middle: string;
    align_bottom: string;
    group: string;
    ungroup: string;
    open_group: string;
    close_group: string;
};

/**
 * View hotkeys
 */
export type ViewHotkeys = {
    toggle_animations: string;
    toggle_shadows: string;
    reset_view: string;
    zoom_in: string;
    zoom_out: string;
    jump_to_selection: string;
    jump_to_parents: string;
    jump_to_children: string;
    fullscreen: string;
    toggle_debug_info: string;
};

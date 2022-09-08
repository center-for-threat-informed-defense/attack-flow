import { Module } from "vuex"
import { Hotkey, HotkeyAction } from "@/assets/scripts/HotkeyObserver"
import { HotkeyStore, ModuleStore } from "../StoreTypes";

export default {
    namespaced: true,
    getters: {

        /**
         * Returns the native hotkeys.
         * @returns
         *  The supported native hotkeys.
         */
        nativeHotkeys(): Hotkey[] {
            return [
                {
                    id: "refresh",
                    action: HotkeyAction.RunTask,
                    shortcut: "Control+R",
                    allowBrowserBehavior: true
                },
                {
                    id: "hard-refresh",
                    action: HotkeyAction.RunTask,
                    shortcut: "Control+Shift+R",
                    allowBrowserBehavior: true
                }
            ]
        },

        /**
         * Returns the file hotkeys.
         * @param _s
         *  The Vuex state. (Unused)
         * @param _g
         *  The Vuex getters. (Unused)
         * @param rootState
         *  The Vuex root state.
         * @returns
         *  The file hotkeys.
         */
        fileHotkeys(_s, _g, rootState): Hotkey[] {
            let { file } = rootState.AppSettingsStore.settings.hotkeys;
            return [
                {
                    id: "new_file",
                    action: HotkeyAction.RunTask,
                    shortcut: file.new_file,
                },
                {
                    id: "open_file",
                    action: HotkeyAction.OpenFile,
                    shortcut: file.open_file,
                },
                {
                    id: "save_file",
                    action: HotkeyAction.RunTask,
                    shortcut: file.save_file
                },
                {
                    id: "save_image",
                    action: HotkeyAction.RunTask,
                    shortcut: file.save_image,
                },
                {
                    id: "save_select_image",
                    action: HotkeyAction.RunTask,
                    shortcut: file.save_select_image
                },
                {
                    id: "publish_file",
                    action: HotkeyAction.RunTask,
                    shortcut: file.publish_file,
                },
                {
                    id: "open_library",
                    action: HotkeyAction.OpenFile,
                    shortcut: file.open_library,
                },
                {
                    id: "save_library",
                    action: HotkeyAction.RunTask,
                    shortcut: file.save_library,
                }
            ];
        },

        /**
         * Returns the edit hotkeys.
         * @param _s
         *  The Vuex state. (Unused)
         * @param _g
         *  The Vuex getters. (Unused)
         * @param rootState
         *  The Vuex root state.
         * @returns
         *  The edit hotkeys.
         */
        editHotKeys(_s, _g, rootState): Hotkey[] {
            let repeat = { delay: 400, interval: 50 };
            let { edit } = rootState.AppSettingsStore.settings.hotkeys;
            return [
                {
                    id: "undo",
                    action: HotkeyAction.RunTask,
                    shortcut: edit.undo,
                    repeat
                },
                {
                    id: "redo",
                    action: HotkeyAction.RunTask,
                    shortcut: edit.redo,
                    repeat
                },
                {
                    id: "cut",
                    action: HotkeyAction.RunTask,
                    shortcut: edit.cut,
                },
                {
                    id: "copy",
                    action: HotkeyAction.RunTask,
                    shortcut: edit.copy,
                },
                {
                    id: "paste",
                    action: HotkeyAction.RunTask,
                    shortcut: edit.paste,
                },
                {
                    id: "delete",
                    action: HotkeyAction.RunTask,
                    shortcut: edit.delete
                },
                {
                    id: "duplicate",
                    action: HotkeyAction.RunTask,
                    shortcut: edit.duplicate
                },
                {
                    id: "select_all",
                    action: HotkeyAction.RunTask,
                    shortcut: edit.select_all
                }
            ];
        },

        /**
         * Returns the layout hotkeys.
         * @param _s
         *  The Vuex state. (Unused)
         * @param _g
         *  The Vuex getters. (Unused)
         * @param rootState
         *  The Vuex root state.
         * @returns
         *  The layout hotkeys.
         */
        layoutHotkeys(_s, _g, rootState): Hotkey[] {
            let { layout } = rootState.AppSettingsStore.settings.hotkeys;
            return [
                {
                    id: "selection_to_front",
                    action: HotkeyAction.RunTask,
                    shortcut: layout.selection_to_front
                },
                {
                    id: "selection_to_back",
                    action: HotkeyAction.RunTask,
                    shortcut: layout.selection_to_back
                },
                {
                    id: "bring_selection_forward",
                    action: HotkeyAction.RunTask,
                    shortcut: layout.bring_selection_forward
                },
                {
                    id: "send_selection_backward",
                    action: HotkeyAction.RunTask,
                    shortcut: layout.send_selection_backward
                },
                {
                    id: "align_left",
                    action: HotkeyAction.RunTask,
                    shortcut: layout.align_left
                },
                {
                    id: "align_center",
                    action: HotkeyAction.RunTask,
                    shortcut: layout.align_center
                },
                {
                    id: "align_right",
                    action: HotkeyAction.RunTask,
                    shortcut: layout.align_right
                },
                {
                    id: "align_top",
                    action: HotkeyAction.RunTask,
                    shortcut: layout.align_top
                },
                {
                    id: "align_middle",
                    action: HotkeyAction.RunTask,
                    shortcut: layout.align_middle
                },
                {
                    id: "align_bottom",
                    action: HotkeyAction.RunTask,
                    shortcut: layout.align_bottom
                },
                {
                    id: "group",
                    action: HotkeyAction.RunTask,
                    shortcut: layout.group
                },
                {
                    id: "ungroup",
                    action: HotkeyAction.RunTask,
                    shortcut: layout.ungroup
                },
                {
                    id: "open_group",
                    action: HotkeyAction.RunTask,
                    shortcut: layout.open_group
                },
                {
                    id: "close_group",
                    action: HotkeyAction.RunTask,
                    shortcut: layout.close_group
                }
            ];
        },

        /**
         * Returns the view hotkeys.
         * @param _s
         *  The Vuex state. (Unused)
         * @param _g
         *  The Vuex getters. (Unused)
         * @param rootState
         *  The Vuex root state.
         * @returns
         *  The view hotkeys.
         */
        viewHotkeys(_s, _g, rootState): Hotkey[] {
            let { view } = rootState.AppSettingsStore.settings.hotkeys;
            let {
                display_grid,
                display_shadows,
                display_debug_mode
            } = rootState.AppSettingsStore.settings.view.diagram;
            return  [
                {
                    id: "toggle_grid",
                    action: HotkeyAction.ToggleValue,
                    shortcut: view.toggle_grid,
                    value: display_grid
                },
                {
                    id: "toggle_shadows",
                    action: HotkeyAction.ToggleValue,
                    shortcut: view.toggle_shadows,
                    value: display_shadows
                },
                {
                    id: "reset_view",
                    action: HotkeyAction.RunTask,
                    shortcut: view.reset_view
                },
                {
                    id: "zoom_in",
                    action: HotkeyAction.RunTask,
                    shortcut: view.zoom_in
                },
                {
                    id: "zoom_out",
                    action: HotkeyAction.RunTask,
                    shortcut: view.zoom_out
                },
                {
                    id: "jump_to_selection",
                    action: HotkeyAction.RunTask,
                    shortcut: view.jump_to_selection
                },
                {
                    id: "jump_to_parents",
                    action: HotkeyAction.RunTask,
                    shortcut: view.jump_to_parents
                },
                {
                    id: "jump_to_children",
                    action: HotkeyAction.RunTask,
                    shortcut: view.jump_to_children
                },
                {
                    id: "fullscreen",
                    action: HotkeyAction.RunTask,
                    shortcut: view.fullscreen
                },
                {
                    id: "toggle_debug_view",
                    action: HotkeyAction.ToggleValue,
                    shortcut: view.toggle_debug_view,
                    value: display_debug_mode
                }
            ];
        }

    }

} as Module<HotkeyStore, ModuleStore>

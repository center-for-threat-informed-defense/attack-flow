import * as App from "@/store/Commands/AppCommands";
import * as Page from "@/store/Commands/PageCommands";
import { Module } from "vuex"
import { Hotkey } from "@/assets/scripts/HotkeyObserver"
import { CommandEmitter } from "../Commands/Command";
import { HotkeyStore, ModuleStore } from "../StoreTypes";

export default {
    namespaced: true,
    getters: {

        /**
         * Returns the native hotkeys.
         * @returns
         *  The supported native hotkeys.
         */
        nativeHotkeys(): Hotkey<CommandEmitter>[] {
            return [
                {
                    shortcut: "Control+R",
                    allowBrowserBehavior: true
                },
                {
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
         * @param rootGetters
         *  The Vuex root getters.
         * @returns
         *  The file hotkeys.
         */
        fileHotkeys(_s, _g, rootState, rootGetters): Hotkey<CommandEmitter>[] {
            let ctx = rootState.ApplicationStore;
            let page = ctx.activePage.page;
            let file = ctx.settings.hotkeys.file;
            let isValid = rootGetters["ApplicationStore/isValid"];
            return [
                {
                    data: () => App.LoadFile.fromNew(ctx),
                    shortcut: file.new_file,
                },
                {
                    data: () => App.LoadFile.fromFileSystem(ctx),
                    shortcut: file.open_file,
                },
                {
                    data: () => new App.SavePageToDevice(ctx, page.id),
                    shortcut: file.save_file
                },
                {
                    data: () => new App.SavePageImageToDevice(ctx, page.id),
                    shortcut: file.save_image,
                },
                {
                    data: () => new App.SaveSelectionImageToDevice(ctx, page.id),
                    shortcut: file.save_select_image
                },
                {
                    data: () => new App.PublishPageToDevice(ctx, page.id),
                    shortcut: file.publish_file,
                    disabled: !ctx.publisher || !isValid
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
        editHotKeys(_s, _g, rootState): Hotkey<CommandEmitter>[] {
            let ctx = rootState.ApplicationStore;
            let page = ctx.activePage.page;
            let edit = ctx.settings.hotkeys.edit;
            let repeat = { delay: 400, interval: 50 };
            return [
                {
                    data: () => new Page.UndoPageCommand(ctx, page.id),
                    shortcut: edit.undo,
                    repeat
                },
                {
                    data: () => new Page.RedoPageCommand(ctx, page.id),
                    shortcut: edit.redo,
                    repeat
                },
                {
                    data: () => new Page.CutSelectedChildren(ctx, page),
                    shortcut: edit.cut,
                },
                {
                    data: () => new App.CopySelectedChildren(ctx, page),
                    shortcut: edit.copy,
                },
                {
                    data: () => new Page.PasteToObject(ctx, page),
                    shortcut: edit.paste,
                },
                {
                    data: () => new Page.RemoveSelectedChildren(page),
                    shortcut: edit.delete
                },
                {
                    data: () => new Page.DuplicateSelectedChildren(ctx, page),
                    shortcut: edit.duplicate
                },
                {
                    data: () => new Page.SelectChildren(page),
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
        layoutHotkeys(_s, _g, rootState): Hotkey<CommandEmitter>[] {
            let ctx = rootState.ApplicationStore;
            let page = ctx.activePage.page;
            let layout = ctx.settings.hotkeys.layout;
            return [
                {
                    data: () => new Page.RelayerSelection(page, Page.Order.Top),
                    shortcut: layout.selection_to_front
                },
                {
                    data: () => new Page.RelayerSelection(page, Page.Order.OneBelow),
                    shortcut: layout.selection_to_back
                },
                {
                    data: () => new Page.RelayerSelection(page, Page.Order.OneAbove),
                    shortcut: layout.bring_selection_forward
                },
                {
                    data: () => new Page.RelayerSelection(page, Page.Order.Bottom),
                    shortcut: layout.send_selection_backward
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
        viewHotkeys(_s, _g, rootState): Hotkey<CommandEmitter>[] {
            let ctx = rootState.ApplicationStore;
            let page = ctx.activePage.page;
            let view = ctx.settings.hotkeys.view;
            return  [
                {
                    data: () => new App.ToggleGridDisplay(ctx),
                    shortcut: view.toggle_grid,
                },
                {
                    data: () => new App.ToggleShadowDisplay(ctx),
                    shortcut: view.toggle_shadows,
                },
                {
                    data: () => new Page.ResetCamera(ctx, page),
                    shortcut: view.reset_view
                },
                {
                    data: () => new Page.ZoomCamera(ctx, page, 0.25),
                    shortcut: view.zoom_in
                },
                {
                    data: () => new Page.ZoomCamera(ctx, page, -0.25),
                    shortcut: view.zoom_out
                },
                {
                    data: () => new Page.MoveCameraToSelection(ctx, page),
                    shortcut: view.jump_to_selection
                },
                {
                    data: () => new Page.MoveCameraToParents(ctx, page),
                    shortcut: view.jump_to_parents
                },
                {
                    data: () => new Page.MoveCameraToChildren(ctx, page),
                    shortcut: view.jump_to_children
                },
                {
                    data: () => new App.SwitchToFullscreen(ctx),
                    shortcut: view.fullscreen
                },
                {
                    data: () => new App.ToggleDebugDisplay(ctx),
                    shortcut: view.toggle_debug_view,
                }
            ];
        }

    }

} as Module<HotkeyStore, ModuleStore>

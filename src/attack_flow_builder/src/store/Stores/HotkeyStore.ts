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
                    repeatable: true,
                    allowBrowserBehavior: true
                },
                {
                    shortcut: "Control+Shift+R",
                    repeatable: true,
                    allowBrowserBehavior: true
                },
                {
                    shortcut: "Meta+R",
                    repeatable: true,
                    allowBrowserBehavior: true
                },
                {
                    shortcut: "Meta+Shift+R",
                    repeatable: true,
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
                    data: () => App.PrepareEditorWithFile.fromNew(ctx),
                    shortcut: file.new_file,
                    repeatable: false
                },
                {
                    data: () => App.PrepareEditorWithFile.fromFileSystem(ctx),
                    shortcut: file.open_file,
                    repeatable: false
                },
                {
                    data: () => new App.SavePageToDevice(ctx),
                    shortcut: file.save_file,
                    repeatable: false
                },
                {
                    data: () => new App.SavePageImageToDevice(ctx),
                    shortcut: file.save_image,
                    repeatable: false
                },
                {
                    data: () => new App.SaveSelectionImageToDevice(ctx),
                    shortcut: file.save_select_image,
                    repeatable: false
                },
                {
                    data: () => new App.PublishPageToDevice(ctx),
                    shortcut: file.publish_file,
                    repeatable: false,
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
            return [
                {
                    data: () => new Page.UndoPageCommand(ctx, page.id),
                    shortcut: edit.undo,
                    repeatable: true
                },
                {
                    data: () => new Page.RedoPageCommand(ctx, page.id),
                    shortcut: edit.redo,
                    repeatable: true
                },
                {
                    data: () => new Page.CutSelectedChildren(ctx, page),
                    shortcut: edit.cut,
                    repeatable: false
                },
                {
                    data: () => new App.CopySelectedChildren(ctx, page),
                    shortcut: edit.copy,
                    repeatable: false,
                    allowBrowserBehavior: true
                },
                {
                    data: () => new Page.PasteToObject(ctx, page),
                    shortcut: edit.paste,
                    repeatable: true
                },
                {
                    data: () => new Page.RemoveSelectedChildren(page),
                    shortcut: edit.delete,
                    repeatable: false
                },
                {
                    data: () => new Page.DuplicateSelectedChildren(ctx, page),
                    shortcut: edit.duplicate,
                    repeatable: false
                },
                {
                    data: () => new App.ShowFindDialog(ctx),
                    shortcut: edit.find,
                    repeatable: false
                },
                {
                    data: () => new App.MoveToNextFindResult(ctx),
                    shortcut: edit.find_next,
                    repeatable: true
                },
                {
                    data: () => new App.MoveToPreviousFindResult(ctx),
                    shortcut: edit.find_previous,
                    repeatable: true
                },
                {
                    data: () => new Page.SelectChildren(page),
                    shortcut: edit.select_all,
                    repeatable: false
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
                    shortcut: layout.selection_to_front,
                    repeatable: false
                },
                {
                    data: () => new Page.RelayerSelection(page, Page.Order.OneBelow),
                    shortcut: layout.selection_to_back,
                    repeatable: true
                },
                {
                    data: () => new Page.RelayerSelection(page, Page.Order.OneAbove),
                    shortcut: layout.bring_selection_forward,
                    repeatable: true
                },
                {
                    data: () => new Page.RelayerSelection(page, Page.Order.Bottom),
                    shortcut: layout.send_selection_backward,
                    repeatable: false
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
                    repeatable: false
                },
                {
                    data: () => new App.ToggleShadowDisplay(ctx),
                    shortcut: view.toggle_shadows,
                    repeatable: false
                },
                {
                    data: () => new Page.ResetCamera(ctx, page),
                    shortcut: view.reset_view,
                    repeatable: false
                },
                {
                    data: () => new Page.ZoomCamera(ctx, page, 0.25),
                    shortcut: view.zoom_in,
                    repeatable: true
                },
                {
                    data: () => new Page.ZoomCamera(ctx, page, -0.25),
                    shortcut: view.zoom_out,
                    repeatable: true
                },
                {
                    data: () => new Page.MoveCameraToSelection(ctx, page),
                    shortcut: view.jump_to_selection,
                    repeatable: false
                },
                {
                    data: () => new Page.MoveCameraToParents(ctx, page),
                    shortcut: view.jump_to_parents,
                    repeatable: true
                },
                {
                    data: () => new Page.MoveCameraToChildren(ctx, page),
                    shortcut: view.jump_to_children,
                    repeatable: true
                },
                {
                    data: () => new App.SwitchToFullscreen(ctx),
                    shortcut: view.fullscreen,
                    repeatable: false
                },
                {
                    data: () => new App.ToggleDebugDisplay(ctx),
                    shortcut: view.toggle_debug_view,
                    repeatable: false
                }
            ];
        }

    }

} as Module<HotkeyStore, ModuleStore>

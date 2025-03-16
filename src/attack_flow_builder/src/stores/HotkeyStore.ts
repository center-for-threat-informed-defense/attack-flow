import * as AppCommands from "@/assets/scripts/Application/Commands";
import { defineStore } from "pinia";
import { useApplicationStore } from "./ApplicationStore";
import type { Hotkey } from "@/assets/scripts/Browser";
import type { CommandEmitter } from "@/assets/scripts/Application/Commands";

export const useHotkeyStore = defineStore("hotkeyStore", {
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
            ];
        },

        /**
         * Returns the file hotkeys.
         * @returns
         *  The file hotkeys.
         */
        fileHotkeys(): Hotkey<CommandEmitter>[] {
            const app = useApplicationStore();
            const file = app.settings.hotkeys.file;
            return [
                {
                    // data: () => App.PrepareEditorWithFile.fromNew(ctx),
                    data: () => AppCommands.loadNewFile(app),
                    shortcut: file.new_file,
                    repeatable: false
                },
                {
                    // data: () => App.PrepareEditorWithFile.fromFileSystem(ctx),
                    data: () => AppCommands.loadFileFromFileSystem(app),
                    shortcut: file.open_file,
                    repeatable: false
                },
                {
                    data: () => AppCommands.saveActiveFileToDevice(app),
                    shortcut: file.save_file,
                    repeatable: false
                },
                // {
                //     data: () => new App.SavePageImageToDevice(ctx),
                //     shortcut: file.save_image,
                //     repeatable: false
                // },
                // {
                //     data: () => new App.SaveSelectionImageToDevice(ctx),
                //     shortcut: file.save_select_image,
                //     repeatable: false
                // },
                // {
                //     data: () => new App.PublishPageToDevice(ctx),
                //     shortcut: file.publish_file,
                //     repeatable: false,
                //     disabled: !ctx.publisher || !ctx.isValid
                // }
            ];
        },

        /**
         * Returns the edit hotkeys.
         * @returns
         *  The edit hotkeys.
         */
        editHotKeys(): Hotkey<CommandEmitter>[] {
            const app = useApplicationStore();
            const editor = app.activeEditor;
            const edit = app.settings.hotkeys.edit;
            return [
                {
                    data: () => AppCommands.undoEditorCommand(editor),
                    shortcut: edit.undo,
                    repeatable: true
                },
                {
                    data: () => AppCommands.redoEditorCommand(editor),
                    shortcut: edit.redo,
                    repeatable: true
                },
                // {
                //     data: () => new Page.CutSelectedChildren(ctx, page),
                //     shortcut: edit.cut,
                //     repeatable: false
                // },
                // {
                //     data: () => new App.CopySelectedChildren(ctx, page),
                //     shortcut: edit.copy,
                //     repeatable: false,
                //     allowBrowserBehavior: true
                // },
                // {
                //     data: () => new Page.PasteToObject(ctx, page),
                //     shortcut: edit.paste,
                //     repeatable: true
                // },
                // {
                //     data: () => new Page.RemoveSelectedChildren(page),
                //     shortcut: edit.delete,
                //     repeatable: false
                // },
                // {
                //     data: () => new Page.DuplicateSelectedChildren(ctx, page),
                //     shortcut: edit.duplicate,
                //     repeatable: false
                // },
                // {
                //     data: () => new App.ShowFindDialog(ctx),
                //     shortcut: edit.find,
                //     repeatable: false
                // },
                // {
                //     data: () => new App.MoveToNextFindResult(ctx),
                //     shortcut: edit.find_next,
                //     repeatable: true
                // },
                // {
                //     data: () => new App.MoveToPreviousFindResult(ctx),
                //     shortcut: edit.find_previous,
                //     repeatable: true
                // },
                // {
                //     data: () => new Page.SelectChildren(page),
                //     shortcut: edit.select_all,
                //     repeatable: false
                // },
                // {
                //     data: () => new Page.UnselectDescendants(page),
                //     shortcut: edit.unselect_all,
                //     repeatable: false
                // }
            ];
        },

        /**
         * Returns the layout hotkeys.
         * @returns
         *  The layout hotkeys.
         */
        layoutHotkeys(): Hotkey<CommandEmitter>[] {
            const app = useApplicationStore();
            // const page = ctx.activePage.page;
            const layout = app.settings.hotkeys.layout;
            return [
                // {
                //     data: () => new Page.RelayerSelection(page, Page.Order.Top),
                //     shortcut: layout.selection_to_front,
                //     repeatable: false
                // },
                // {
                //     data: () => new Page.RelayerSelection(page, Page.Order.OneBelow),
                //     shortcut: layout.selection_to_back,
                //     repeatable: true
                // },
                // {
                //     data: () => new Page.RelayerSelection(page, Page.Order.OneAbove),
                //     shortcut: layout.bring_selection_forward,
                //     repeatable: true
                // },
                // {
                //     data: () => new Page.RelayerSelection(page, Page.Order.Bottom),
                //     shortcut: layout.send_selection_backward,
                //     repeatable: false
                // }
            ];
        },

        /**
         * Returns the view hotkeys.
         * @returns
         *  The view hotkeys.
         */
        viewHotkeys(): Hotkey<CommandEmitter>[] {
            const app = useApplicationStore();
            const view = app.settings.hotkeys.view;
            return  [
                // {
                //     data: () => new App.ToggleGridDisplay(ctx),
                //     shortcut: view.toggle_grid,
                //     repeatable: false
                // },
                // {
                //     data: () => new App.ToggleShadowDisplay(ctx),
                //     shortcut: view.toggle_shadows,
                //     repeatable: false
                // },
                // {
                //     data: () => new Page.ResetCamera(ctx, page),
                //     shortcut: view.reset_view,
                //     repeatable: false
                // },
                // {
                //     data: () => new Page.ZoomCamera(ctx, page, 0.25),
                //     shortcut: view.zoom_in,
                //     repeatable: true
                // },
                // {
                //     data: () => new Page.ZoomCamera(ctx, page, -0.25),
                //     shortcut: view.zoom_out,
                //     repeatable: true
                // },
                // {
                //     data: () => new Page.MoveCameraToSelection(ctx, page),
                //     shortcut: view.jump_to_selection,
                //     repeatable: false
                // },
                // {
                //     data: () => new Page.MoveCameraToParents(ctx, page),
                //     shortcut: view.jump_to_parents,
                //     repeatable: true
                // },
                // {
                //     data: () => new Page.MoveCameraToChildren(ctx, page),
                //     shortcut: view.jump_to_children,
                //     repeatable: true
                // },
                {
                    data: () => AppCommands.switchToFullscreen(),
                    shortcut: view.fullscreen,
                    repeatable: false
                },
                // {
                //     data: () => new App.ToggleDebugDisplay(ctx),
                //     shortcut: view.toggle_debug_view,
                //     repeatable: false
                // }
            ];
        }

    }
});


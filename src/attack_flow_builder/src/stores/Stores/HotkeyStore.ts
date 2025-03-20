import * as App from "@/stores/Commands/AppCommands";
import * as Page from "@/stores/Commands/PageCommands";
import { defineStore } from "pinia";
import { useApplicationStore } from "./ApplicationStore";
import type { Hotkey } from "@/assets/scripts/HotkeyObserver";
import type { CommandEmitter } from "../Commands/Command";

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
            const ctx = useApplicationStore();
            const file = ctx.settings.hotkeys.file;
            return [
                ...file.new_file.map((key: string): Hotkey<CommandEmitter> => ({
                    data: () => App.PrepareEditorWithFile.fromNew(ctx),
                    shortcut: key,
                    repeatable: false
                })),
                ...file.open_file.map((key: string): Hotkey<CommandEmitter> => ({
                    data: () => App.PrepareEditorWithFile.fromFileSystem(ctx),
                    shortcut: key,
                    repeatable: false
                })),
                ...file.save_image.map((key: string): Hotkey<CommandEmitter> => ({
                    data: () => new App.SavePageToDevice(ctx),
                    shortcut: key,
                    repeatable: false
                })),
                ...file.save_select_image.map((key: string): Hotkey<CommandEmitter> => ({
                    data: () => new App.SavePageImageToDevice(ctx),
                    shortcut: key,
                    repeatable: false
                })),
                ...file.save_select_image.map((key: string): Hotkey<CommandEmitter> => ({
                    data: () => new App.SaveSelectionImageToDevice(ctx),
                    shortcut: key,
                    repeatable: false
                })),
                ...file.publish_file.map((key: string): Hotkey<CommandEmitter> => ({
                    data: () => new App.PublishPageToDevice(ctx),
                    shortcut: key,
                    repeatable: false,
                    disabled: !ctx.publisher || !ctx.isValid
                }))
            ];
        },

        /**
         * Returns the edit hotkeys.
         * @returns
         *  The edit hotkeys.
         */
        editHotKeys(): Hotkey<CommandEmitter>[] {
            const ctx = useApplicationStore();
            const page = ctx.activePage.page;
            const edit = ctx.settings.hotkeys.edit;
            return [
                ...edit.undo.map((key: string): Hotkey<CommandEmitter> => ({
                    data: () => new Page.UndoPageCommand(ctx, page.id),
                    shortcut: key,
                    repeatable: true
                })),
                ...edit.redo.map((key: string): Hotkey<CommandEmitter> => ({
                    data: () => new Page.RedoPageCommand(ctx, page.id),
                    shortcut: key,
                    repeatable: true
                },
                {
                    data: () => new App.CutSelectedChildren(ctx, page),
                    shortcut: edit.cut,
                    repeatable: false
                })),
                ...edit.copy.map((key: string): Hotkey<CommandEmitter> => ({
                    data: () => new App.CopySelectedChildren(ctx, page),
                    shortcut: key,
                    repeatable: false,
                    allowBrowserBehavior: true
                })),
                ...edit.paste.map((key: string): Hotkey<CommandEmitter>=>({
                    data: () => Page.PasteToObject.fromClipboard(ctx, page),
                    shortcut: key,
                    repeatable: true
                })),
                ...edit.delete.map((key: string): Hotkey<CommandEmitter> => ({
                    data: () => new Page.RemoveSelectedChildren(page),
                    shortcut: key,
                    repeatable: false
                })),
                ...edit.duplicate.map((key: string): Hotkey<CommandEmitter> => ({
                    data: () => new Page.DuplicateSelectedChildren(ctx, page),
                    shortcut: key,
                    repeatable: false
                })),
                ...edit.find.map((key: string): Hotkey<CommandEmitter> => ({
                    data: () => new App.ShowFindDialog(ctx),
                    shortcut: key,
                    repeatable: false
                })),
                ...edit.find_next.map((key: string): Hotkey<CommandEmitter> => ({
                    data: () => new App.MoveToNextFindResult(ctx),
                    shortcut: key,
                    repeatable: true
                })),
                ...edit.find_previous.map((key: string): Hotkey<CommandEmitter> => ({
                    data: () => new App.MoveToPreviousFindResult(ctx),
                    shortcut: key,
                    repeatable: true
                })),
                ...edit.select_all.map((key: string): Hotkey<CommandEmitter> => ({
                    data: () => new Page.SelectChildren(page),
                    shortcut: key,
                    repeatable: false
                },
                {
                    data: () => new Page.UnselectDescendants(page),
                    shortcut: edit.unselect_all,
                    repeatable: false
                }
            ];
        },

        /**
         * Returns the layout hotkeys.
         * @returns
         *  The layout hotkeys.
         */
        layoutHotkeys(): Hotkey<CommandEmitter>[] {
            const ctx = useApplicationStore();
            const page = ctx.activePage.page;
            const layout = ctx.settings.hotkeys.layout;
            return [
                ...layout.selection_to_front.map((key: string): Hotkey<CommandEmitter> => ({
                    data: () => new Page.RelayerSelection(page, Page.Order.Top),
                    shortcut: key,
                    repeatable: false
                })),
                ...layout.selection_to_back.map((key: string): Hotkey<CommandEmitter> => ({
                    data: () => new Page.RelayerSelection(page, Page.Order.OneBelow),
                    shortcut: key,
                    repeatable: true
                })),
                ...layout.bring_selection_forward.map((key: string): Hotkey<CommandEmitter> => ({
                    data: () => new Page.RelayerSelection(page, Page.Order.OneAbove),
                    shortcut: key,
                    repeatable: true
                })),
                ...layout.send_selection_backward.map((key: string): Hotkey<CommandEmitter> => ({
                    data: () => new Page.RelayerSelection(page, Page.Order.Bottom),
                    shortcut: key,
                    repeatable: false
                }))
            ];
        },

        /**
         * Returns the view hotkeys.
         * @returns
         *  The view hotkeys.
         */
        viewHotkeys(): Hotkey<CommandEmitter>[] {
            const ctx = useApplicationStore();
            const page = ctx.activePage.page;
            const view = ctx.settings.hotkeys.view;
            return  [
                ...view.toggle_grid.map((key: string): Hotkey<CommandEmitter> => ({
                    data: () => new App.ToggleGridDisplay(ctx),
                    shortcut: key,
                    repeatable: false
                })),
                ...view.toggle_shadows.map((key: string): Hotkey<CommandEmitter> => ({
                    data: () => new App.ToggleShadowDisplay(ctx),
                    shortcut: key,
                    repeatable: false
                })),
                ...view.reset_view.map((key: string): Hotkey<CommandEmitter> => ({
                    data: () => new Page.ResetCamera(ctx, page),
                    shortcut: key,
                    repeatable: false
                })),
                ...view.zoom_in.map((key: string): Hotkey<CommandEmitter> => ({
                    data: () => new Page.ZoomCamera(ctx, page, 0.25),
                    shortcut: key,
                    repeatable: true
                })),
                ...view.zoom_out.map((key: string): Hotkey<CommandEmitter> => ({
                    data: () => new Page.ZoomCamera(ctx, page, -0.25),
                    shortcut: key,
                    repeatable: true
                })),
                ...view.jump_to_selection.map((key: string): Hotkey<CommandEmitter> => ({
                    data: () => new Page.MoveCameraToSelection(ctx, page),
                    shortcut: key,
                    repeatable: false
                })),
                ...view.jump_to_parents.map((key: string): Hotkey<CommandEmitter> => ({
                    data: () => new Page.MoveCameraToParents(ctx, page),
                    shortcut: key,
                    repeatable: true
                })),
                ...view.jump_to_children.map((key: string): Hotkey<CommandEmitter> => ({
                    data: () => new Page.MoveCameraToChildren(ctx, page),
                    shortcut: key,
                    repeatable: true
                })),
                ...view.fullscreen.map((key: string): Hotkey<CommandEmitter> => ({
                    data: () => new App.SwitchToFullscreen(ctx),
                    shortcut: key,
                    repeatable: false
                })),
                ...view.toggle_debug_view.map((key: string): Hotkey<CommandEmitter> => ({
                    data: () => new App.ToggleDebugDisplay(ctx),
                    shortcut: key,
                    repeatable: false
                }))
            ];
        }

    }
});

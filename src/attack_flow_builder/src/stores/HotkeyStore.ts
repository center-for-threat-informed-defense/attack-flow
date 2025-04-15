import * as AppCommands from "@/assets/scripts/Application/Commands";
import * as EditorCommands from "@OpenChart/DiagramEditor/Commands";
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
            const edit = app.settings.hotkeys.edit;
            const editor = app.activeEditor;
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
                {
                    data: () => EditorCommands.removeSelectedChildren(editor),
                    shortcut: edit.delete,
                    repeatable: false
                },
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
                {
                    data: () => EditorCommands.selectAllObjects(editor),
                    shortcut: edit.select_all,
                    repeatable: false
                },
                {
                    data: () => EditorCommands.unselectAllObjects(editor),
                    shortcut: edit.unselect_all,
                    repeatable: false
                }
            ];
        },

        /**
         * Returns the view hotkeys.
         * @returns
         *  The view hotkeys.
         */
        viewHotkeys(): Hotkey<CommandEmitter>[] {
            const app = useApplicationStore();
            const editor = app.activeEditor;
            const view = app.settings.hotkeys.view;
            const {
                display_animations,
                display_shadows,
                display_debug_info
            } = app.settings.view.diagram;
            return  [
                {
                    data: () => AppCommands.enableAnimations(app, !display_animations),
                    shortcut: view.toggle_animations,
                    repeatable: false
                },
                {
                    data: () => AppCommands.enableShadows(app, !display_shadows),
                    shortcut: view.toggle_shadows,
                    repeatable: false
                },
                {
                    data: () => AppCommands.resetCamera(editor),
                    shortcut: view.reset_view,
                    repeatable: false
                },
                {
                    data: () => AppCommands.zoomCamera(editor, 0.25),
                    shortcut: view.zoom_in,
                    repeatable: true
                },
                {
                    data: () => AppCommands.zoomCamera(editor, -0.25),
                    shortcut: view.zoom_out,
                    repeatable: true
                },
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
                {
                    data: () => AppCommands.enableDebugInfo(app, display_debug_info),
                    shortcut: view.toggle_debug_info,
                    repeatable: false
                }
            ];
        }

    }
});


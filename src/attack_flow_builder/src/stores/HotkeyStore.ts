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
            const editor = app.activeEditor;
            const file = app.settings.hotkeys.file;
            return [
                {
                    data: () => AppCommands.prepareEditorFromNewFile(app),
                    shortcut: file.new_file,
                    repeatable: false
                },
                {
                    data: () => AppCommands.prepareEditorFromFileSystem(app),
                    shortcut: file.open_file,
                    repeatable: false
                },
                {
                    data: () => AppCommands.prepareEditorFromStixFileSystem(app),
                    shortcut: file.open_stix_file,
                    repeatable: false
                },
                {
                    data: () => AppCommands.importFileFromFilesystem(app, editor),
                    shortcut: file.import_file,
                    repeatable: false
                },
                {
                    data: () => AppCommands.importStixFileFromFilesystem(app, editor),
                    shortcut: file.import_stix_file,
                    repeatable: false
                },
                {
                    data: () => AppCommands.saveActiveFileToDevice(app),
                    shortcut: file.save_file,
                    repeatable: false
                },
                {
                    data: () => AppCommands.saveDiagramImageToDevice(app),
                    shortcut: file.save_image,
                    repeatable: false
                },
                {
                    data: () => AppCommands.saveSelectionImageToDevice(app),
                    shortcut: file.save_select_image,
                    repeatable: false
                },
                {
                    data: () => AppCommands.publishActiveFileToDevice(app),
                    shortcut: file.publish_file,
                    repeatable: false,
                    disabled: !app.activePublisher || !app.isValid
                }
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
            const finder = app.activeFinder;
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
                {
                    data: () => AppCommands.cutActiveSelectionToClipboard(app),
                    shortcut: edit.cut,
                    repeatable: false
                },
                {
                    data: () => AppCommands.copyActiveSelectionToClipboard(app),
                    shortcut: edit.copy,
                    repeatable: false,
                    allowBrowserBehavior: true
                },
                {
                    data: () => AppCommands.pasteFileFromClipboard(app),
                    shortcut: edit.paste,
                    repeatable: true
                },
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
                {
                    data: () => AppCommands.showSearchMenu(app),
                    shortcut: edit.find,
                    repeatable: false
                },
                {
                    data: () => AppCommands.toNextSearchResult(finder),
                    shortcut: edit.find_next,
                    disabled: !finder.hasResults,
                    repeatable: true
                },
                {
                    data: () => AppCommands.toPreviousSearchResult(finder),
                    shortcut: edit.find_previous,
                    disabled: !finder.hasResults,
                    repeatable: true
                },
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
                {
                    data: () => EditorCommands.moveCameraToSelection(editor),
                    shortcut: view.jump_to_selection,
                    repeatable: false
                },
                {
                    data: () => EditorCommands.moveCameraToParents(editor),
                    shortcut: view.jump_to_parents,
                    repeatable: true
                },
                {
                    data: () => EditorCommands.moveCameraToChildren(editor),
                    shortcut: view.jump_to_children,
                    repeatable: true
                },
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


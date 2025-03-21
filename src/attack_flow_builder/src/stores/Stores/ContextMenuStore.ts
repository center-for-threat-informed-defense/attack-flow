import Configuration from "@/assets/configuration/builder.config";
import * as App from "@/stores/Commands/AppCommands";
import * as Page from "@/stores/Commands/PageCommands";
import { version } from "@/../package.json";
import { MenuType } from "@/assets/scripts/ContextMenuTypes";
import { defineStore } from "pinia";
import { useApplicationStore } from "./ApplicationStore";
import { type Namespace, titleCase } from "@/assets/scripts/BlockDiagram";
import type { CommandEmitter } from "../Commands/Command";
import type { ContextMenu, ContextMenuSection, ContextMenuSubmenu } from "@/assets/scripts/ContextMenuTypes";


export const useContextMenuStore = defineStore("contextMenuStore", {
    getters: {

        ///////////////////////////////////////////////////////////////////////
        //  1. File Menu  /////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Returns the file menu.
         * @returns
         *  The file menu.
         */
        fileMenu(): ContextMenuSubmenu<CommandEmitter> {
            const ctx = useApplicationStore();
            // Sections
            const sections: ContextMenuSection<CommandEmitter>[] = [
                this.openFileMenu,
                this.isRecoverFileMenuShown ? this.recoverFileMenu : null,
                this.saveFileMenu,
                ctx.publisher ? this.publishFileMenu : null
            ].filter(Boolean) as ContextMenuSection<CommandEmitter>[];
            // Menu
            return { text: "File", type: MenuType.Submenu, sections };
        },

        /**
         * Returns the 'open file' menu section.
         * @returns
         *  The 'open file' menu section.
         */
        openFileMenu(): ContextMenuSection<CommandEmitter> {
            const ctx = useApplicationStore();
            const file = ctx.settings.hotkeys.file;
            return {
                id: "open_file_options",
                items: [
                    {
                        text: "New File",
                        type: MenuType.Item,
                        data: () => App.PrepareEditorWithFile.fromNew(ctx),
                        shortcuts: file.new_file
                    },
                    {
                        text: "Open File...",
                        type: MenuType.Item,
                        data: () => App.PrepareEditorWithFile.fromFileSystem(ctx),
                        shortcuts: file.open_file
                    }
                ]
            };
        },

        /**
         * Returns the 'recover file' menu section.
         * @returns
         *  The 'recover file' menu section.
         */
        recoverFileMenu(): ContextMenuSection<CommandEmitter> {
            const ctx = useApplicationStore();
            const pages = ctx.recoveryBank.pages;

            // Build page list
            const items: ContextMenu<CommandEmitter>[] = [];
            for (const [id, page] of pages.entries()) {
                // Ignore active page
                if (id === ctx.activePage.id) {
                    continue;
                }
                // Add page
                items.push({
                    text: page.name,
                    type: MenuType.Item,
                    data: () => App.PrepareEditorWithFile.fromFile(ctx, page.file)
                });
            }
            if (items.length === 0) {
                items.push({
                    text: "No Recovered Files",
                    type: MenuType.Item,
                    data: () => new App.NullCommand(ctx),
                    disabled: true
                });
            }

            // Build submenu
            const submenu: ContextMenu<CommandEmitter> = {
                text: "Open Recovered Files",
                type: MenuType.Submenu,
                sections: [
                    {
                        id: "recovered_files",
                        items
                    },
                    {
                        id: "bank_controls",
                        items: [
                            {
                                text: "Delete Recovered Files",
                                type: MenuType.Item,
                                data: () => new App.ClearPageRecoveryBank(ctx)
                            }
                        ]
                    }
                ]
            };

            // Return menu
            return {
                id: "recover_file_options",
                items: [submenu]
            };

        },

        /**
         * Returns the 'save file' menu section.
         * @returns
         *  The 'save file' menu section.
         */
        saveFileMenu(): ContextMenuSection<CommandEmitter> {
            const ctx = useApplicationStore();
            const file = ctx.settings.hotkeys.file;
            return {
                id: "save_file_options",
                items: [
                    {
                        text: "Save",
                        type: MenuType.Item,
                        data: () => new App.SavePageToDevice(ctx),
                        shortcuts: file.save_file
                    },
                    {
                        text: "Save as Image",
                        type: MenuType.Item,
                        data: () => new App.SavePageImageToDevice(ctx),
                        shortcuts: file.save_image
                    },
                    {
                        text: "Save Selection as Image",
                        type: MenuType.Item,
                        data: () => new App.SaveSelectionImageToDevice(ctx),
                        shortcuts: file.save_select_image,
                        disabled: !ctx.hasSelection
                    }
                ]
            };
        },

        /**
         * Returns the 'publish file' menu section.
         * @returns
         *  The 'publish file' menu section.
         */
        publishFileMenu(): ContextMenuSection<CommandEmitter> {
            const ctx = useApplicationStore();
            const file = ctx.settings.hotkeys.file;
            return {
                id: "publish_options",
                items: [
                    {
                        text: `Publish ${Configuration.file_type_name}`,
                        type: MenuType.Item,
                        data: () => new App.PublishPageToDevice(ctx),
                        shortcuts: file.publish_file,
                        disabled: !ctx.isValid
                    }
                ]
            };
        },

        /**
         * Tests if the 'recovery file' menu should be displayed.
         * @returns
         *  True if the menu should be displayed, false otherwise.
         */
        isRecoverFileMenuShown(): boolean {
            const ctx = useApplicationStore();
            const editor = ctx.activePage;
            const ids = [...ctx.recoveryBank.pages.keys()];
            return (ids.length === 1 && ids[0] !== editor.id) || 1 < ids.length;
        },


        ///////////////////////////////////////////////////////////////////////
        //  2. Edit Menus  ////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Returns the edit menu.
         * @returns
         *  The edit menu.
         */
        editMenu(): ContextMenuSubmenu<CommandEmitter> {
            return {
                text: "Edit",
                type: MenuType.Submenu,
                sections: [
                    this.undoRedoMenu,
                    this.clipboardMenu,
                    this.deleteMenu,
                    this.duplicateMenu,
                    this.findMenu,
                    this.createMenu,
                    this.selectAllMenu,
                    this.unselectAllMenu
                ]
            };
        },

        /**
         * Returns the undo/redo menu section.
         * @returns
         *  The undo/redo menu section.
         */
        undoRedoMenu(): ContextMenuSection<CommandEmitter> {
            const ctx = useApplicationStore();
            const page = ctx.activePage.page;
            const edit = ctx.settings.hotkeys.edit;
            return {
                id: "undo_redo_options",
                items: [
                    {
                        text: "Undo",
                        type: MenuType.Item,
                        data: () => new Page.UndoPageCommand(ctx, page.id),
                        shortcuts: edit.undo,
                        disabled: !ctx.canUndo
                    },
                    {
                        text: "Redo",
                        type: MenuType.Item,
                        data: () => new Page.RedoPageCommand(ctx, page.id),
                        shortcuts: edit.redo,
                        disabled: !ctx.canRedo
                    }
                ]
            };
        },

        /**
         * Returns the clipboard menu section.
         * @returns
         *  The clipboard menu section.
         */
        clipboardMenu(): ContextMenuSection<CommandEmitter> {
            const ctx = useApplicationStore();
            const page = ctx.activePage.page;
            const edit = ctx.settings.hotkeys.edit;
            const canPaste = true; // TODO: make context menus async to read system clipboard
            const hasSelection = ctx.hasSelection;
            return {
                id: "clipboard_options",
                items: [
                    {
                        text: "Cut",
                        type: MenuType.Item,
                        data: () => new App.CutSelectedChildren(ctx, page),
                        shortcuts: edit.cut,
                        disabled: !hasSelection
                    },
                    {
                        text: "Copy",
                        type: MenuType.Item,
                        data: () => new App.CopySelectedChildren(ctx, page),
                        shortcuts: edit.copy,
                        disabled: !hasSelection
                    },
                    {
                        text: "Paste",
                        type: MenuType.Item,
                        data: () => Page.PasteToObject.fromClipboard(ctx, page),
                        shortcuts: edit.paste,
                        disabled: !canPaste
                    }
                ]
            };
        },

        /**
         * Returns the delete menu section.
         * @returns
         *  The delete menu section.
         */
        deleteMenu(): ContextMenuSection<CommandEmitter> {
            const ctx = useApplicationStore();
            const page = ctx.activePage.page;
            const edit = ctx.settings.hotkeys.edit;
            return {
                id: "delete_options",
                items: [
                    {
                        text: "Delete",
                        type: MenuType.Item,
                        data: () => new Page.RemoveSelectedChildren(page),
                        shortcuts: edit.delete,
                        disabled: !ctx.hasSelection
                    }
                ]
            };
        },

        /**
         * Returns the duplicate menu section.
         * @returns
         *  The duplicate menu section.
         */
        duplicateMenu(): ContextMenuSection<CommandEmitter> {
            const ctx = useApplicationStore();
            const page = ctx.activePage.page;
            const edit = ctx.settings.hotkeys.edit;
            return {
                id: "duplicate_options",
                items: [
                    {
                        text: "Duplicate",
                        type: MenuType.Item,
                        data: () => new Page.DuplicateSelectedChildren(ctx, page),
                        shortcuts: edit.duplicate,
                        disabled: !ctx.hasSelection
                    }
                ]
            };
        },

        /**
         * Returns the find menu section.
         * @returns
         *  The undo/redo menu section.
         */
        findMenu(): ContextMenuSection<CommandEmitter> {
            const ctx = useApplicationStore();
            const edit = ctx.settings.hotkeys.edit;
            const hasFindResults = ctx.hasFindResults;
            return {
                id: "find_options",
                items: [
                    {
                        text: "Find…",
                        type: MenuType.Item,
                        data: () => new App.ShowFindDialog(ctx),
                        shortcuts: edit.find
                    },
                    {
                        text: "Find Next",
                        type: MenuType.Item,
                        data: () => new App.MoveToNextFindResult(ctx),
                        shortcuts: edit.find_next,
                        disabled: !hasFindResults
                    },
                    {
                        text: "Find Previous",
                        type: MenuType.Item,
                        data: () => new App.MoveToPreviousFindResult(ctx),
                        shortcuts: edit.find_previous,
                        disabled: !hasFindResults
                    }
                ]
            };
        },


        /**
         * Returns the 'select all' menu section.
         * @returns
         *  The 'select all' menu section.
         */
        selectAllMenu(): ContextMenuSection<CommandEmitter> {
            const ctx = useApplicationStore();
            const page = ctx.activePage.page;
            const edit = ctx.settings.hotkeys.edit;
            return {
                id: "select_options",
                items: [
                    {
                        text: "Select All",
                        type: MenuType.Item,
                        data: () => new Page.SelectChildren(page),
                        shortcuts: edit.select_all
                    }
                ]
            };
        },

        /**
         * Returns the 'unselect all' menu section.
         * @returns
         *  The 'unselect all' menu section.
         */
        unselectAllMenu(): ContextMenuSection<CommandEmitter> {
            const ctx = useApplicationStore();
            const page = ctx.activePage.page;
            const edit = ctx.settings.hotkeys.edit;
            return {
                id: "unselect_options",
                items: [
                    {
                        text: "Unselect All",
                        type: MenuType.Item,
                        data: () => new Page.UnselectDescendants(page),
                        shortcuts: edit.unselect_all
                    }
                ]
            };
        },

        /**
         * Returns the create menu section.
         * @returns
         *  The create menu section.
         */
        createMenu(): ContextMenuSection<CommandEmitter> {
            const ctx = useApplicationStore();
            const page = ctx.activePage.page;

            // Build menu
            const root = page.factory.getNamespace().get("@")! as Namespace;
            const menu = generateCreateMenu(
                "@", root, (id) => new Page.SpawnObject(ctx, page, id)
            );

            // Return menu
            return {
                id: "create_options",
                items: [
                    {
                        text: "Create",
                        type: MenuType.Submenu,
                        sections: menu.sections
                    }
                ]
            };

        },

        /**
         * Returns the create at menu section.
         * @returns
         *  The create at menu section.
         */
        createAtMenu(): ContextMenuSection<CommandEmitter> {
            const ctx = useApplicationStore();
            const page = ctx.activePage.page;
            const x = ctx.activePage.pointer.value.x;
            const y = ctx.activePage.pointer.value.y;

            // Build menu
            const root = page.factory.getNamespace().get("@")! as Namespace;
            const menu = generateCreateMenu(
                "@", root, (id) => new Page.SpawnObject(ctx, page, id, x, y)
            );

            // Return menu
            return {
                id: "create_options",
                items: [
                    {
                        text: "Create",
                        type: MenuType.Submenu,
                        sections: menu.sections
                    }
                ]
            };

        },


        ///////////////////////////////////////////////////////////////////////
        //  3. Layout Menus  //////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Returns the time menu.
         * @returns
         *  The time menu.
         */
        layoutMenu(): ContextMenuSubmenu<CommandEmitter> {
            return {
                text: "Layout",
                type: MenuType.Submenu,
                sections: [
                    this.layeringMenu
                ]
            };
        },


        /**
         * Returns the layering menu section.
         * @returns
         *  The layering menu section.
         */
        layeringMenu(): ContextMenuSection<CommandEmitter> {
            const ctx = useApplicationStore();
            const page = ctx.activePage.page;
            const layout = ctx.settings.hotkeys.layout;
            return {
                id: "layering_options",
                items: [
                    {
                        text: "To Front",
                        type: MenuType.Item,
                        data: () => new Page.RelayerSelection(page, Page.Order.Top),
                        shortcuts: layout.selection_to_front
                    },
                    {
                        text: "To Back",
                        type: MenuType.Item,
                        data: () => new Page.RelayerSelection(page, Page.Order.Bottom),
                        shortcuts: layout.selection_to_back
                    },
                    {
                        text: "Bring Forward",
                        type: MenuType.Item,
                        data: () => new Page.RelayerSelection(page, Page.Order.OneAbove),
                        shortcuts: layout.bring_selection_forward
                    },
                    {
                        text: "Send Backward",
                        type: MenuType.Item,
                        data: () => new Page.RelayerSelection(page, Page.Order.OneBelow),
                        shortcuts: layout.send_selection_backward
                    }
                ]
            };
        },


        ///////////////////////////////////////////////////////////////////////
        //  4. View Menus  ////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Returns the view menu.
         * @returns
         *  The view menu.
         */
        viewMenu(): ContextMenuSubmenu<CommandEmitter> {
            return {
                text: "View",
                type: MenuType.Submenu,
                sections: [
                    this.diagramViewMenu,
                    this.diagramRenderMenu,
                    this.zoomMenu,
                    this.jumpMenu,
                    this.fullscreenMenu,
                    this.developerViewMenu
                ]
            };
        },


        /**
         * Returns the diagram view menu section.
         * @returns
         *  The diagram view menu section.
         */
        diagramViewMenu(): ContextMenuSection<CommandEmitter> {
            const ctx = useApplicationStore();
            const view = ctx.settings.hotkeys.view;
            const {
                display_grid,
                display_shadows
            } = ctx.settings.view.diagram;
            return {
                id: "diagram_view_options",
                items: [
                    {
                        text: "Grid",
                        type: MenuType.Toggle,
                        data: () => new App.ToggleGridDisplay(ctx),
                        shortcuts: view.toggle_grid,
                        value: display_grid,
                        keepMenuOpenOnSelect: true
                    },
                    {
                        text: "Shadows",
                        type: MenuType.Toggle,
                        data: () => new App.ToggleShadowDisplay(ctx),
                        shortcuts: view.toggle_shadows,
                        value: display_shadows,
                        keepMenuOpenOnSelect: true
                    }
                ]
            };
        },

        /**
         * Returns the diagram render menu section.
         * @returns
         *  The diagram render menu section.
         */
        diagramRenderMenu(): ContextMenuSection<CommandEmitter> {
            const ctx = useApplicationStore();
            const render_high_quality = ctx.settings.view.diagram.render_high_quality;
            return {
                id: "diagram_render_quality",
                items: [
                    {
                        text: "Rendering – High Quality",
                        type: MenuType.Toggle,
                        data: () => new App.SetRenderQuality(ctx, true),
                        value: render_high_quality,
                        keepMenuOpenOnSelect: true
                    },
                    {
                        text: "Rendering – Fast",
                        type: MenuType.Toggle,
                        data: () => new App.SetRenderQuality(ctx, false),
                        value: !render_high_quality,
                        keepMenuOpenOnSelect: true
                    }
                ]
            };
        },

        /**
         * Returns the zoom menu section.
         * @returns
         *  The zoom menu section.
         */
        zoomMenu(): ContextMenuSection<CommandEmitter> {
            const ctx = useApplicationStore();
            const page = ctx.activePage.page;
            const view = ctx.settings.hotkeys.view;
            return {
                id: "zoom_options",
                items: [
                    {
                        text: "Reset View",
                        type: MenuType.Item,
                        data: () => new Page.ResetCamera(ctx, page),
                        shortcuts: view.reset_view
                    },
                    {
                        text: "Zoom In",
                        type: MenuType.Item,
                        data: () => new Page.ZoomCamera(ctx, page, 0.25),
                        shortcuts: view.zoom_in
                    },
                    {
                        text: "Zoom Out",
                        type: MenuType.Item,
                        data: () => new Page.ZoomCamera(ctx, page, -0.25),
                        shortcuts: view.zoom_out
                    }
                ]
            };
        },

        /**
         * Returns the jump menu section.
         * @returns
         *  The jump menu section.
         */
        jumpMenu(): ContextMenuSection<CommandEmitter> {
            const ctx = useApplicationStore();
            const page = ctx.activePage.page;
            const view = ctx.settings.hotkeys.view;
            const hasSelection = ctx.hasSelection;
            return {
                id: "jump_options",
                items: [
                    {
                        text: "Zoom to Selection",
                        type: MenuType.Item,
                        data: () => new Page.MoveCameraToSelection(ctx, page),
                        shortcuts: view.jump_to_selection,
                        disabled: !hasSelection
                    },
                    {
                        text: "Jump to Parents",
                        type: MenuType.Item,
                        data: () => new Page.MoveCameraToParents(ctx, page),
                        shortcuts: view.jump_to_parents,
                        disabled: !hasSelection
                    },
                    {
                        text: "Jump to Children",
                        type: MenuType.Item,
                        data: () => new Page.MoveCameraToChildren(ctx, page),
                        shortcuts: view.jump_to_children,
                        disabled: !hasSelection
                    }
                ]
            };
        },

        /**
         * Returns the fullscreen menu section.
         * @returns
         *  The fullscreen menu section.
         */
        fullscreenMenu(): ContextMenuSection<CommandEmitter> {
            const ctx = useApplicationStore();
            const view = ctx.settings.hotkeys.view;
            return {
                id: "fullscreen_options",
                items: [
                    {
                        text: "Fullscreen",
                        type: MenuType.Item,
                        data: () => new App.SwitchToFullscreen(ctx),
                        shortcuts: view.fullscreen
                    }
                ]
            };
        },

        /**
         * Returns the developer view menu section.
         * @returns
         *  The developer view menu section.
         */
        developerViewMenu(): ContextMenuSection<CommandEmitter> {
            const ctx = useApplicationStore();
            const view = ctx.settings.hotkeys.view;
            const { display_debug_mode } = ctx.settings.view.diagram;
            return {
                id: "developer_view_options",
                items: [
                    {
                        text: "Debug Mode",
                        type: MenuType.Toggle,
                        data: () => new App.ToggleDebugDisplay(ctx),
                        shortcuts: view.toggle_debug_view,
                        value: display_debug_mode,
                        keepMenuOpenOnSelect: true
                    }
                ]
            };
        },


        ///////////////////////////////////////////////////////////////////////
        //  5. Help Menu  /////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Returns the help menu.
         * @returns
         *  The help menu.
         */
        helpMenu(): ContextMenuSubmenu<CommandEmitter> {
            const ctx = useApplicationStore();
            const name = Configuration.application_name;
            const links = Configuration.menus.help_menu.help_links;
            // Links
            const items: ContextMenu<CommandEmitter>[] = links.map(link => ({
                text: link.text,
                type: MenuType.Item,
                data: () => new App.OpenHyperlink(ctx, link.url)
            }));
            // Menu
            return {
                text: "Help",
                type: MenuType.Submenu,
                sections: [
                    { id: "help_links", items },
                    {
                        id: "version_info",
                        items: [
                            {
                                text: `${name} v${version}`,
                                type: MenuType.Item,
                                data: () => new App.NullCommand(ctx),
                                disabled: true
                            }
                        ]
                    }
                ]
            };
        }

    }
});

/**
 * Generates a create submenu from a namespace.
 * @param key
 *  The namespace's key.
 * @param value
 *  The namespace.
 * @param spawn
 *  A callback that produces a {@link SpawnObject} from a template id.
 * @returns
 *  The formatted submenu.
 */
function generateCreateMenu(
    key: string,
    value: Namespace,
    spawn: (id: string) => Page.SpawnObject
): ContextMenuSubmenu<CommandEmitter> {
    const sm: ContextMenuSubmenu<CommandEmitter> = {
        text: titleCase(key),
        type: MenuType.Submenu,
        sections: [
            { id: "submenus", items: [] },
            { id: "options", items: [] }
        ]
    };
    for (const [k, v] of value) {
        if (typeof v !== "string") {
            sm.sections[0].items.push(
                generateCreateMenu(k, v, spawn)
            );
        } else {
            sm.sections[1].items.push({
                text: titleCase(k),
                type: MenuType.Item,
                data: () => spawn(v as string)
            });
        }
    }
    sm.sections = sm.sections.filter(s => 0 < s.items.length);
    return sm;
}

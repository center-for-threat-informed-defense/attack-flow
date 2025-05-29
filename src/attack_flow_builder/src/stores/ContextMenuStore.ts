import Configuration from "@/assets/configuration/app.configuration";
import * as AppCommands from "@/assets/scripts/Application/Commands";
import * as EditorCommands from "@OpenChart/DiagramEditor/Commands";
import { version } from "@/../package.json";
import { defineStore } from "pinia";
import { PhantomEditor } from "./PhantomEditor";
import { useApplicationStore } from "./ApplicationStore";
import { MenuType, titleCase } from "@/assets/scripts/Browser";
import type { SpawnObject } from "@OpenChart/DiagramEditor/Commands/ViewFile/index.commands";
import type { CommandEmitter } from "@/assets/scripts/Application";
import type { DiagramObjectTemplate } from "@OpenChart/DiagramModel";
import type { ContextMenu, ContextMenuItem, ContextMenuSection, ContextMenuSubmenu } from "@/assets/scripts/Browser";

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
            const app = useApplicationStore();
            // Sections
            const sections: ContextMenuSection<CommandEmitter>[] = [
                this.openFileMenu,
                this.isRecoverFileMenuShown ? this.recoverFileMenu : null,
                this.saveFileMenu
                // ctx.publisher ? this.publishFileMenu : null
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
            const app = useApplicationStore();
            const file = app.settings.hotkeys.file;
            return {
                id: "open_file_options",
                items: [
                    {
                        text: "New File",
                        type: MenuType.Action,
                        data: () => AppCommands.prepareEditorFromNewFile(app),
                        shortcut: file.new_file
                    },
                    {
                        text: "Open File...",
                        type: MenuType.Action,
                        data: () => AppCommands.prepareEditorFromFileSystem(app),
                        shortcut: file.open_file
                    },
                    {
                        text: "Open STIX File...",
                        type: MenuType.Action,
                        data: () => AppCommands.prepareEditorFromStixFileSystem(app)
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
            const app = useApplicationStore();
            const files = app.fileRecoveryBank.files;

            // Build file list
            const items: ContextMenu<CommandEmitter>[] = [];
            for (const [id, { name, date, contents }] of files) {
                // Ignore active file
                if (id === app.activeEditor.id) {
                    continue;
                }
                // Add file
                items.push({
                    text: `${name} (${date.toLocaleString()})`,
                    type: MenuType.Action,
                    data: () => AppCommands.prepareEditorFromExistingFile(app, contents, name)
                });
            }
            if (items.length === 0) {
                items.push({
                    text: "No Recovered Files",
                    type: MenuType.Action,
                    data: () => AppCommands.doNothing(),
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
                        items: [{
                            text: "Delete Recovered Files",
                            type: MenuType.Action,
                            data: () => AppCommands.clearFileRecoveryBank(app)
                        }]
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
            const app = useApplicationStore();
            const file = app.settings.hotkeys.file;
            const editor = app.activeEditor;
            return {
                id: "save_file_options",
                items: [
                    {
                        text: "Save",
                        type: MenuType.Action,
                        data: () => AppCommands.saveActiveFileToDevice(app),
                        shortcut: file.save_file,
                        disabled: editor.id === PhantomEditor.id
                    }
                    // {
                    //     text: "Save as Image",
                    //     type: MenuType.Action,
                    //     data: () => new App.SavePageImageToDevice(ctx),
                    //     shortcut: file.save_image
                    // },
                    // {
                    //     text: "Save Selection as Image",
                    //     type: MenuType.Action,
                    //     data: () => new App.SaveSelectionImageToDevice(ctx),
                    //     shortcut: file.save_select_image,
                    //     disabled: !ctx.hasSelection
                    // }
                ]
            };
        },

        // /**
        //  * Returns the 'publish file' menu section.
        //  * @returns
        //  *  The 'publish file' menu section.
        //  */
        // publishFileMenu(): ContextMenuSection<CommandEmitter> {
        //     const ctx = useApplicationStore();
        //     const file = ctx.settings.hotkeys.file;
        //     return {
        //         id: "publish_options",
        //         items: [
        //             {
        //                 text: `Publish ${Configuration.file_type_name}`,
        //                 type: MenuType.Action,
        //                 data: () => new App.PublishPageToDevice(ctx),
        //                 shortcut: file.publish_file,
        //                 disabled: !ctx.isValid
        //             }
        //         ]
        //     };
        // },

        /**
         * Tests if the 'recovery file' menu should be displayed.
         * @returns
         *  True if the menu should be displayed, false otherwise.
         */
        isRecoverFileMenuShown(): boolean {
            const app = useApplicationStore();
            const editor = app.activeEditor;
            const ids = [...app.fileRecoveryBank.files.keys()];
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
                    // this.clipboardMenu,
                    this.deleteMenu,
                    // this.duplicateMenu,
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
            const app = useApplicationStore();
            const edit = app.settings.hotkeys.edit;
            const editor = app.activeEditor;
            return {
                id: "undo_redo_options",
                items: [
                    {
                        text: "Undo",
                        type: MenuType.Action,
                        data: () => AppCommands.undoEditorCommand(editor),
                        shortcut: edit.undo,
                        disabled: !app.canUndo
                    },
                    {
                        text: "Redo",
                        type: MenuType.Action,
                        data: () => AppCommands.redoEditorCommand(editor),
                        shortcut: edit.redo,
                        disabled: !app.canRedo
                    }
                ]
            };
        },

        // /**
        //  * Returns the clipboard menu section.
        //  * @returns
        //  *  The clipboard menu section.
        //  */
        // clipboardMenu(): ContextMenuSection<CommandEmitter> {
        //     const ctx = useApplicationStore();
        //     const page = ctx.activePage.page;
        //     const edit = ctx.settings.hotkeys.edit;
        //     const canPaste = ctx.clipboard.length;
        //     const hasSelection = ctx.hasSelection;
        //     return {
        //         id: "clipboard_options",
        //         items: [
        //             {
        //                 text: "Cut",
        //                 type: MenuType.Action,
        //                 data: () => new Page.CutSelectedChildren(ctx, page),
        //                 shortcut: edit.cut,
        //                 disabled: !hasSelection
        //             },
        //             {
        //                 text: "Copy",
        //                 type: MenuType.Action,
        //                 data: () => new App.CopySelectedChildren(ctx, page),
        //                 shortcut: edit.copy,
        //                 disabled: !hasSelection
        //             },
        //             {
        //                 text: "Paste",
        //                 type: MenuType.Action,
        //                 data: () => new Page.PasteToObject(ctx, page),
        //                 shortcut: edit.paste,
        //                 disabled: !canPaste
        //             }
        //         ]
        //     };
        // },

        /**
         * Returns the delete menu section.
         * @returns
         *  The delete menu section.
         */
        deleteMenu(): ContextMenuSection<CommandEmitter> {
            const app = useApplicationStore();
            const edit = app.settings.hotkeys.edit;
            const editor = app.activeEditor;
            return {
                id: "delete_options",
                items: [
                    {
                        text: "Delete",
                        type: MenuType.Action,
                        data: () => EditorCommands.removeSelectedChildren(editor),
                        shortcut: edit.delete,
                        disabled: !app.hasSelection
                    }
                ]
            };
        },

        // /**
        //  * Returns the duplicate menu section.
        //  * @returns
        //  *  The duplicate menu section.
        //  */
        // duplicateMenu(): ContextMenuSection<CommandEmitter> {
        //     const ctx = useApplicationStore();
        //     const page = ctx.activePage.page;
        //     const edit = ctx.settings.hotkeys.edit;
        //     return {
        //         id: "duplicate_options",
        //         items: [
        //             {
        //                 text: "Duplicate",
        //                 type: MenuType.Action,
        //                 data: () => new Page.DuplicateSelectedChildren(ctx, page),
        //                 shortcut: edit.duplicate,
        //                 disabled: !ctx.hasSelection
        //             }
        //         ]
        //     };
        // },

        /**
         * Returns the find menu section.
         * @returns
         *  The undo/redo menu section.
         */
        findMenu(): ContextMenuSection<CommandEmitter> {
            const app = useApplicationStore();
            const edit = app.settings.hotkeys.edit;
            const finder = app.activeFinder;
            return {
                id: "find_options",
                items: [
                    {
                        text: "Find…",
                        type: MenuType.Action,
                        data: () => AppCommands.showSearchMenu(app),
                        shortcut: edit.find
                    },
                    {
                        text: "Find Next",
                        type: MenuType.Action,
                        data: () => AppCommands.toNextSearchResult(finder),
                        shortcut: edit.find_next,
                        disabled: !finder.hasResults
                    },
                    {
                        text: "Find Previous",
                        type: MenuType.Action,
                        data: () => AppCommands.toPreviousSearchResult(finder),
                        shortcut: edit.find_previous,
                        disabled: !finder.hasResults
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
            const app = useApplicationStore();
            const edit = app.settings.hotkeys.edit;
            const editor = app.activeEditor;
            return {
                id: "select_options",
                items: [
                    {
                        text: "Select All",
                        type: MenuType.Action,
                        data: () => EditorCommands.selectAllObjects(editor),
                        shortcut: edit.select_all
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
            const app = useApplicationStore();
            const edit = app.settings.hotkeys.edit;
            const editor = app.activeEditor;
            return {
                id: "unselect_options",
                items: [
                    {
                        text: "Unselect All",
                        type: MenuType.Action,
                        data: () => EditorCommands.unselectAllObjects(editor),
                        shortcut: edit.unselect_all
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
            const app = useApplicationStore();
            const editor = app.activeEditor;
            const templates = editor.file.factory.templates;
            const { spawnObjectAtInterfaceCenter: spawn } = EditorCommands;
            // Return menu
            return {
                id: "create_options",
                items: [
                    prepareCreateMenu(templates, id => spawn(editor, id))
                ]
            };

        },

        /**
         * Returns the create at menu section.
         * @returns
         *  The create at menu section.
         */
        createAtMenu(): ContextMenuSection<CommandEmitter> {
            const app = useApplicationStore();
            const editor = app.activeEditor;
            const templates = editor.file.factory.templates;
            const { spawnObjectAtPointer: spawn } = EditorCommands;
            // Return menu
            return {
                id: "create_options",
                items: [
                    prepareCreateMenu(templates, id => spawn(editor, id))
                ]
            };

        },


        ///////////////////////////////////////////////////////////////////////
        //  3. View Menus  ////////////////////////////////////////////////////
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
                    // this.diagramRenderMenu,
                    this.zoomMenu,
                    // this.jumpMenu,
                    this.themeMenu,
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
            const app = useApplicationStore();
            const view = app.settings.hotkeys.view;
            const {
                display_animations,
                display_shadows
            } = app.settings.view.diagram;
            return {
                id: "diagram_view_options",
                items: [
                    {
                        text: "Animations",
                        type: MenuType.Toggle,
                        data: () => AppCommands.enableAnimations(app, !display_animations),
                        shortcut: view.toggle_animations,
                        value: display_animations,
                        keepMenuOpenOnSelect: true
                    },
                    {
                        text: "Shadows",
                        type: MenuType.Toggle,
                        data: () => AppCommands.enableShadows(app, !display_shadows),
                        shortcut: view.toggle_shadows,
                        value: display_shadows,
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
            const app = useApplicationStore();
            const editor = app.activeEditor;
            const view = app.settings.hotkeys.view;
            return {
                id: "zoom_options",
                items: [
                    {
                        text: "Reset Zoom",
                        type: MenuType.Action,
                        data: () => AppCommands.resetCamera(editor),
                        shortcut: view.reset_view
                    },
                    {
                        text: "Zoom In",
                        type: MenuType.Action,
                        data: () => AppCommands.zoomCamera(editor, 0.25),
                        shortcut: view.zoom_in
                    },
                    {
                        text: "Zoom Out",
                        type: MenuType.Action,
                        data: () => AppCommands.zoomCamera(editor, -0.25),
                        shortcut: view.zoom_out
                    }
                ]
            };
        },

        // /**
        //  * Returns the jump menu section.
        //  * @returns
        //  *  The jump menu section.
        //  */
        // jumpMenu(): ContextMenuSection<CommandEmitter> {
        //     const ctx = useApplicationStore();
        //     const page = ctx.activePage.page;
        //     const view = ctx.settings.hotkeys.view;
        //     const hasSelection = ctx.hasSelection;
        //     return {
        //         id: "jump_options",
        //         items: [
        //             {
        //                 text: "Zoom to Selection",
        //                 type: MenuType.Action,
        //                 data: () => new Page.MoveCameraToSelection(ctx, page),
        //                 shortcut: view.jump_to_selection,
        //                 disabled: !hasSelection
        //             },
        //             {
        //                 text: "Jump to Parents",
        //                 type: MenuType.Action,
        //                 data: () => new Page.MoveCameraToParents(ctx, page),
        //                 shortcut: view.jump_to_parents,
        //                 disabled: !hasSelection
        //             },
        //             {
        //                 text: "Jump to Children",
        //                 type: MenuType.Action,
        //                 data: () => new Page.MoveCameraToChildren(ctx, page),
        //                 shortcut: view.jump_to_children,
        //                 disabled: !hasSelection
        //             }
        //         ]
        //     };
        // },


        /**
         * Returns the theme menu section.
         * @returns
         *  The theme menu section.
         */
        themeMenu(): ContextMenuSection<CommandEmitter> {
            const app = useApplicationStore();
            const active = app.activeEditor.file.factory.theme;
            // List themes
            const items: ContextMenu<CommandEmitter>[] = [];
            for (const theme of app.themeRegistry.listThemes()) {
                items.push({
                    text: theme.name,
                    type: MenuType.Toggle,
                    value: active.id === theme.id,
                    data: () => AppCommands.setTheme(app, theme.id)
                });
            }
            // Return menu
            return {
                id: "theme_options",
                items: [
                    {
                        text: "Modes",
                        type: MenuType.Submenu,
                        sections: [
                            {
                                id: "modes",
                                items
                            }
                        ]
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
            const app = useApplicationStore();
            const view = app.settings.hotkeys.view;
            return {
                id: "fullscreen_options",
                items: [
                    {
                        text: "Fullscreen",
                        type: MenuType.Action,
                        data: () => AppCommands.switchToFullscreen(),
                        shortcut: view.fullscreen
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
            const app = useApplicationStore();
            const view = app.settings.hotkeys.view;
            const { display_debug_info } = app.settings.view.diagram;
            return {
                id: "developer_view_options",
                items: [
                    {
                        text: "Debug Mode",
                        type: MenuType.Toggle,
                        data: () => AppCommands.enableDebugInfo(app, !display_debug_info),
                        shortcut: view.toggle_debug_info,
                        value: display_debug_info,
                        keepMenuOpenOnSelect: true
                    }
                ]
            };
        },


        ///////////////////////////////////////////////////////////////////////
        //  4. Help Menu  /////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Returns the help menu.
         * @returns
         *  The help menu.
         */
        helpMenu(): ContextMenuSubmenu<CommandEmitter> {
            const name = Configuration.application_name;
            const links = Configuration.menus.help_menu.help_links;
            // Links
            const items: ContextMenu<CommandEmitter>[] = links.map(link => ({
                text: link.text,
                type: MenuType.Action,
                data: () => AppCommands.openHyperlink(link.url)
            }));
            // Menu
            return {
                text: "Help",
                type: MenuType.Submenu,
                sections: [
                    { id: "help_links", items },
                    {
                        id: "version",
                        items: [
                            {
                                text: `${name} v${version}`,
                                type: MenuType.Action,
                                data: () => AppCommands.doNothing(),
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
function prepareCreateMenu(
    templates: ReadonlyMap<string, DiagramObjectTemplate>,
    spawn: (id: string) => SpawnObject
): ContextMenuSubmenu<CommandEmitter> {
    type MenuMap<T> = {
        menu: T;
        submenus: Map<string, MenuMap<ContextMenuSubmenu<CommandEmitter>>>;
        subitems: Map<string, MenuMap<ContextMenuItem<CommandEmitter>>>;
    };
    // Define main menu
    const main: MenuMap<ContextMenuSubmenu<CommandEmitter>> = {
        menu: {
            text: "Create",
            type: MenuType.Submenu,
            sections: []
        },
        submenus: new Map(),
        subitems: new Map()
    };
    // Enumerate templates
    for (const template of templates.values()) {
        const ns = template.namespace;
        if (!ns) {
            continue;
        }
        // Construct submenus
        let i = 0, current = main, id, section;
        for (id = ns[i]; i < ns.length - 1; id = ns[++i]) {
            const space = ns[i];
            const { menu, submenus } = current;
            if (submenus.size === 0) {
                menu.sections.unshift({
                    id: "namespace",
                    items: []
                });
            }
            if (!submenus.has(space)) {
                const submenu: ContextMenu<CommandEmitter> = {
                    text: titleCase(space),
                    type: MenuType.Submenu,
                    sections: []
                };
                section = menu.sections[0];
                section.items.push(submenu);
                submenus.set(space, {
                    menu: submenu,
                    submenus: new Map(),
                    subitems: new Map()
                });
            }
            current = submenus.get(space)!;
        }
        // Construct create menu
        const { menu, subitems } = current;
        if (subitems.size === 0) {
            menu.sections.push({
                id: "templates",
                items: []
            });
        }
        if (subitems.has(id)) {
            throw new Error(`Menu defines '${ns.join(".")}' twice.`);
        }
        const item: ContextMenu<CommandEmitter> = {
            text: titleCase(id),
            type: MenuType.Action,
            data: () => spawn(id)
        };
        section = (menu.sections[1] ?? menu.sections[0]);
        section.items.push(item);
        subitems.set(id, {
            menu: item,
            submenus: new Map(),
            subitems: new Map()
        });
    }
    return main.menu;
}

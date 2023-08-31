import Configuration from "@/assets/configuration/builder.config";
import * as App from "@/store/Commands/AppCommands";
import * as Page from "@/store/Commands/PageCommands";
import { Module } from "vuex";
import { version } from "@/../package.json";
import { Namespace, titleCase } from "@/assets/scripts/BlockDiagram";
import { ContextMenuStore, ModuleStore } from "../StoreTypes";
import { ContextMenu, ContextMenuSection, ContextMenuSubmenu, MenuType } from "@/assets/scripts/ContextMenuTypes";

export default {
    namespaced: true,
    getters: {


        ///////////////////////////////////////////////////////////////////////
        //  1. File Menu  /////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Returns the file menu.
         * @param _s
         *  The Vuex state. (Unused)
         * @param getters
         *  The Vuex getters. (Unused)
         * @param rootState
         *  The Vuex root state.
         * @returns
         *  The file menu.
         */
        fileMenu(_s, getters, rootState): ContextMenu {
            let ctx = rootState.ApplicationStore;
            // Sections
            let sections: ContextMenuSection[] = [
                getters.openFileMenu,
                getters.isRecoverFileMenuShown ? getters.recoverFileMenu : null,
                getters.saveFileMenu,
                ctx.publisher ? getters.publishFileMenu : null
            ].filter(Boolean);
            // Menu
            return { text: "File", type: MenuType.Submenu, sections };
        },

        /**
         * Returns the 'open file' menu section.
         * @param _s
         *  The Vuex state. (Unused)
         * @param _g
         *  The Vuex getters. (Unused)
         * @param rootState
         *  The Vuex root state.
         * @returns
         *  The 'open file' menu section.
         */
        openFileMenu(_s, _g, rootState): ContextMenuSection {
            let ctx = rootState.ApplicationStore;
            let file = ctx.settings.hotkeys.file;
            return {
                id: "open_file_options",
                items: [
                    {
                        text: "New File",
                        type: MenuType.Item,
                        data: () => App.PrepareEditorWithFile.fromNew(ctx),
                        shortcut: file.new_file,
                    },
                    {
                        text: `Open File...`,
                        type: MenuType.Item,
                        data: () => App.PrepareEditorWithFile.fromFileSystem(ctx),
                        shortcut: file.open_file,
                    }
                ],
            }
        },

        /**
         * Returns the 'recover file' menu section.
         * @param _s
         *  The Vuex state. (Unused)
         * @param _g
         *  The Vuex getters. (Unused)
         * @param rootState
         *  The Vuex root state.
         * @returns
         *  The 'recover file' menu section.
         */
        recoverFileMenu(_s, _g, rootState): ContextMenuSection {
            let ctx = rootState.ApplicationStore;
            let pages = ctx.recoveryBank.pages;
            
            // Build page list
            let items: ContextMenu[] = [];
            for(let [id, page] of pages.entries()) {
                // Ignore active page
                if(id === ctx.activePage.id) {
                    continue;
                }
                // Add page
                items.push({
                    text: page.name,
                    type: MenuType.Item,
                    data: () => App.PrepareEditorWithFile.fromFile(ctx, page.file)
                })
            }
            if(items.length === 0) {
                items.push({
                    text: "No Recovered Files",
                    type: MenuType.Item,
                    data: () => new App.NullCommand(ctx),
                    disabled: true
                });
            }

            // Build submenu
            let submenu: ContextMenu = {
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
            }

            // Return menu
            return { 
                id: "recover_file_options",
                items: [ submenu ]
            };

        },
        
        /**
         * Returns the 'save file' menu section.
         * @param _s
         *  The Vuex state. (Unused)
         * @param _g
         *  The Vuex getters. (Unused)
         * @param rootState
         *  The Vuex root state.
         * @param rootGetters
         *  The Vuex root getters.
         * @returns
         *  The 'save file' menu section.
         */
        saveFileMenu(_s, _g, rootState, rootGetters): ContextMenuSection {
            let ctx = rootState.ApplicationStore;
            let file = ctx.settings.hotkeys.file;
            let page = ctx.activePage.page;
            return {
                id: "save_file_options",
                items: [
                    {
                        text: "Save",
                        type: MenuType.Item,
                        data: () => new App.SavePageToDevice(ctx),
                        shortcut: file.save_file
                    },
                    {
                        text: "Save as Image",
                        type: MenuType.Item,
                        data: () => new App.SavePageImageToDevice(ctx),
                        shortcut: file.save_image
                    },
                    {
                        text: "Save Selection as Image",
                        type: MenuType.Item,
                        data: () => new App.SaveSelectionImageToDevice(ctx),
                        shortcut: file.save_select_image,
                        disabled: !rootGetters["ApplicationStore/hasSelection"],
                    }
                ]
            }
        },

        /**
         * Returns the 'publish file' menu section.
         * @param _s
         *  The Vuex state. (Unused)
         * @param _g
         *  The Vuex getters. (Unused)
         * @param rootState
         *  The Vuex root state.
         * @param rootGetters
         *  The Vuex root getters.
         * @returns
         *  The 'publish file' menu section.
         */
        publishFileMenu(_s, _g, rootState, rootGetters): ContextMenuSection {
            let ctx = rootState.ApplicationStore;
            let file = ctx.settings.hotkeys.file;
            let page = ctx.activePage.page;
            return {
                id: "publish_options",
                items: [
                    {
                        text: `Publish ${ Configuration.file_type_name }`,
                        type: MenuType.Item,
                        data: () => new App.PublishPageToDevice(ctx),
                        shortcut: file.publish_file,
                        disabled: !rootGetters["ApplicationStore/isValid"]
                    }
                ]
            }
        },

        /**
         * Tests if the 'recovery file' menu should be displayed.
         * @param _s
         *  The Vuex state. (Unused)
         * @param _g
         *  The Vuex getters. (Unused)
         * @param rootState
         *  The Vuex root state.
         * @returns
         *  True if the menu should be displayed, false otherwise.
         */
        isRecoverFileMenuShown(_s, _g, rootState): boolean {
            let ctx = rootState.ApplicationStore;
            let editor = ctx.activePage;
            let ids = [...ctx.recoveryBank.pages.keys()];
            return (ids.length === 1 && ids[0] !== editor.id) || 1 < ids.length;
        },


        ///////////////////////////////////////////////////////////////////////
        //  2. Edit Menus  ////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Returns the edit menu.
         * @param _s
         *  The Vuex state. (Unused)
         * @param getters
         *  The Vuex getters.
         * @returns
         *  The edit menu.
         */
        editMenu(_s, getters): ContextMenu {
            return {
                text: "Edit",
                type: MenuType.Submenu,
                sections: [
                    getters.undoRedoMenu,
                    getters.clipboardMenu,
                    getters.deleteMenu,
                    getters.duplicateMenu,
                    getters.findMenu,
                    getters.createMenu,
                    getters.selectAllMenu
                ]
            }
        },

        /**
         * Returns the undo/redo menu section.
         * @param _s
         *  The Vuex state. (Unused)
         * @param _g
         *  The Vuex getters. (Unused)
         * @param rootState
         *  The Vuex root state.
         * @param rootGetters
         *  The Vuex root getters.
         * @returns
         *  The undo/redo menu section.
         */
        undoRedoMenu(_s, _g, rootState, rootGetters): ContextMenuSection {
            let ctx = rootState.ApplicationStore;
            let page = ctx.activePage.page;
            let edit = ctx.settings.hotkeys.edit;
            let canUndo = rootGetters["ApplicationStore/canUndo"];
            let canRedo = rootGetters["ApplicationStore/canRedo"];
            return {
                id: "undo_redo_options",
                items: [
                    {
                        text: "Undo",
                        type: MenuType.Item,
                        data: () => new Page.UndoPageCommand(ctx, page.id),
                        shortcut: edit.undo,
                        disabled: !canUndo
                    },
                    {
                        text: "Redo",
                        type: MenuType.Item,
                        data: () => new Page.RedoPageCommand(ctx, page.id),
                        shortcut: edit.redo,
                        disabled: !canRedo
                    }
                ],
            }
        },

        /**
         * Returns the clipboard menu section.
         * @param _s
         *  The Vuex state. (Unused)
         * @param _g
         *  The Vuex getters. (Unused)
         * @param rootState
         *  The Vuex root state.
         * @param rootGetters
         *  The Vuex root getters.
         * @returns
         *  The clipboard menu section.
         */
        clipboardMenu(_s, _g, rootState, rootGetters): ContextMenuSection {
            let ctx = rootState.ApplicationStore;
            let page = ctx.activePage.page;
            let edit = ctx.settings.hotkeys.edit;
            let canPaste = ctx.clipboard.length;
            let hasSelection = rootGetters["ApplicationStore/hasSelection"];
            return {
                id: "clipboard_options",
                items: [
                    {
                        text: "Cut",
                        type: MenuType.Item,
                        data: () => new Page.CutSelectedChildren(ctx, page),
                        shortcut: edit.cut,
                        disabled: !hasSelection
                    },
                    {
                        text: "Copy",
                        type: MenuType.Item,
                        data: () => new App.CopySelectedChildren(ctx, page),
                        shortcut: edit.copy,
                        disabled: !hasSelection
                    },
                    {
                        text: "Paste",
                        type: MenuType.Item,
                        data: () => new Page.PasteToObject(ctx, page),
                        shortcut: edit.paste,
                        disabled: !canPaste
                    }
                ],
            }
        },

        /**
         * Returns the delete menu section.
         * @param _s
         *  The Vuex state. (Unused)
         * @param _g
         *  The Vuex getters. (Unused)
         * @param rootState
         *  The Vuex root state.
         * @param rootGetters
         *  The Vuex root getters.
         * @returns
         *  The delete menu section.
         */
        deleteMenu(_s, _g, rootState, rootGetters): ContextMenuSection {
            let ctx = rootState.ApplicationStore;
            let page = ctx.activePage.page;
            let edit = ctx.settings.hotkeys.edit;
            let hasSelection = rootGetters["ApplicationStore/hasSelection"];
            return {
                id: "delete_options",
                items: [
                    {
                        text: "Delete",
                        type: MenuType.Item,
                        data: () => new Page.RemoveSelectedChildren(page),
                        shortcut: edit.delete,
                        disabled: !hasSelection
                    }
                ]
            };
        },

        /**
         * Returns the duplicate menu section.
         * @param _s
         *  The Vuex state. (Unused)
         * @param _g
         *  The Vuex getters. (Unused)
         * @param rootState
         *  The Vuex root state.
         * @param rootGetters
         *  The Vuex root getters.
         * @returns
         *  The duplicate menu section.
         */
        duplicateMenu(_s, _g, rootState, rootGetters): ContextMenuSection {
            let ctx = rootState.ApplicationStore;
            let page = ctx.activePage.page;
            let edit = ctx.settings.hotkeys.edit;
            let hasSelection = rootGetters["ApplicationStore/hasSelection"];
            return {
                id: "duplicate_options",
                items: [
                    {
                        text: "Duplicate",
                        type: MenuType.Item,
                        data: () => new Page.DuplicateSelectedChildren(ctx, page),
                        shortcut: edit.duplicate,
                        disabled: !hasSelection
                    }
                ]
            };
        },

        /**
         * Returns the find menu section.
         * @param _s
         *  The Vuex state. (Unused)
         * @param _g
         *  The Vuex getters. (Unused)
         * @param rootState
         *  The Vuex root state.
         * @param rootGetters
         *  The Vuex root getters.
         * @returns
         *  The undo/redo menu section.
         */
        findMenu(_s, _g, rootState, rootGetters): ContextMenuSection {
            let ctx = rootState.ApplicationStore;
            let edit = ctx.settings.hotkeys.edit;
            let hasFindResults = rootGetters["ApplicationStore/hasFindResults"];
            return {
                id: "find_options",
                items: [
                    {
                        text: "Find…",
                        type: MenuType.Item,
                        data: () => new App.ShowFindDialog(ctx),
                        shortcut: edit.find
                    },
                    {
                        text: "Find Next",
                        type: MenuType.Item,
                        data: () => new App.MoveToNextFindResult(ctx),
                        shortcut: edit.find_next,
                        disabled: !hasFindResults
                    },
                    {
                        text: "Find Previous",
                        type: MenuType.Item,
                        data: () => new App.MoveToPreviousFindResult(ctx),
                        shortcut: edit.find_previous,
                        disabled: !hasFindResults
                    },
                ],
            }
        },

                
        /**
         * Returns the 'select all' menu section.
         * @param _s
         *  The Vuex state. (Unused)
         * @param _g
         *  The Vuex getters. (Unused)
         * @param rootState
         *  The Vuex root state.
         * @returns
         *  The 'select all' menu section.
         */
        selectAllMenu(_s, _g, rootState): ContextMenuSection {
            let ctx = rootState.ApplicationStore;
            let page = ctx.activePage.page;
            let edit = ctx.settings.hotkeys.edit;
            return {
                id: "select_options",
                items: [
                    {
                        text: "Select All",
                        type: MenuType.Item,
                        data: () => new Page.SelectChildren(page),
                        shortcut: edit.select_all,
                    }
                ],
            };
        },

        /**
         * Returns the create menu section.
         * @param _s
         *  The Vuex state. (Unused)
         * @param _g
         *  The Vuex getters. (Unused)
         * @param rootState
         *  The Vuex root state.
         * @returns
         *  The create menu section.
         */
        createMenu(_s, _g, rootState): ContextMenuSection {
            let ctx = rootState.ApplicationStore;
            let page = ctx.activePage.page;
            
            // Build menu
            let root = page.factory.getNamespace().get("@")! as Namespace;
            let menu = generateCreateMenu(
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
         * @param _s
         *  The Vuex state. (Unused)
         * @param _g
         *  The Vuex getters. (Unused)
         * @param rootState
         *  The Vuex root state.
         * @returns
         *  The create at menu section.
         */
        createAtMenu(_s, _g, rootState): ContextMenuSection {
            let ctx = rootState.ApplicationStore;
            let page = ctx.activePage.page;
            let x = ctx.activePage.pointer.value.x;
            let y = ctx.activePage.pointer.value.y;
            
            // Build menu
            let root = page.factory.getNamespace().get("@")! as Namespace;
            let menu = generateCreateMenu(
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
         * @param _s
         *  The Vuex state. (Unused)
         * @param getters
         *  The Vuex getters.
         * @returns
         *  The time menu.
         */
        layoutMenu(_s, getters): ContextMenu {
            return {
                text: "Layout",
                type: MenuType.Submenu,
                sections: [
                    getters.layeringMenu
                ]
            };
        },


        /**
         * Returns the layering menu section.
         * @param _s
         *  The Vuex state. (Unused)
         * @param _g
         *  The Vuex getters. (Unused)
         * @param rootState
         *  The Vuex root state.
         * @returns
         *  The layering menu section.
         */
        layeringMenu(_s, _g, rootState): ContextMenuSection {
            let ctx = rootState.ApplicationStore;
            let page = ctx.activePage.page;
            let layout = ctx.settings.hotkeys.layout;
            return {
                id: "layering_options",
                items: [
                    {
                        text: "To Front",
                        type: MenuType.Item,
                        data: () => new Page.RelayerSelection(page, Page.Order.Top),
                        shortcut: layout.selection_to_front,
                    },
                    {
                        text: "To Back",
                        type: MenuType.Item,
                        data: () => new Page.RelayerSelection(page, Page.Order.Bottom),
                        shortcut: layout.selection_to_back,
                    },
                    {
                        text: "Bring Forward",
                        type: MenuType.Item,
                        data: () => new Page.RelayerSelection(page, Page.Order.OneAbove),
                        shortcut: layout.bring_selection_forward,
                    },
                    {
                        text: "Send Backward",
                        type: MenuType.Item,
                        data: () => new Page.RelayerSelection(page, Page.Order.OneBelow),
                        shortcut: layout.send_selection_backward,
                    }
                ],
            }
        },

        
        ///////////////////////////////////////////////////////////////////////
        //  4. View Menus  ////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Returns the view menu.
         * @param _s
         *  The Vuex state. (Unused)
         * @param getters
         *  The Vuex getters.
         * @returns
         *  The view menu.
         */
        viewMenu(_s, getters): ContextMenu {
            return {
                text: "View",
                type: MenuType.Submenu,
                sections: [
                    getters.diagramViewMenu,
                    getters.diagramRenderMenu,
                    getters.zoomMenu,
                    getters.jumpMenu,
                    getters.fullscreenMenu,
                    getters.developerViewMenu
                ]
            }
        },


        /**
         * Returns the diagram view menu section.
         * @param _s
         *  The Vuex state. (Unused)
         * @param _g
         *  The Vuex getters. (Unused)
         * @param rootState
         *  The Vuex root state.
         * @returns
         *  The diagram view menu section.
         */
        diagramViewMenu(_s, _g, rootState): ContextMenuSection {
            let ctx = rootState.ApplicationStore;
            let view = ctx.settings.hotkeys.view;
            let { 
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
                        shortcut: view.toggle_grid,
                        value: display_grid,
                        keepMenuOpenOnSelect: true
                    },
                    {
                        text: "Shadows",
                        type: MenuType.Toggle,
                        data: () => new App.ToggleShadowDisplay(ctx),
                        shortcut: view.toggle_shadows,
                        value: display_shadows,
                        keepMenuOpenOnSelect: true
                    }
                ]
            }
        },

        /**
         * Returns the diagram render menu section.
         * @param _s
         *  The Vuex state. (Unused)
         * @param _g
         *  The Vuex getters. (Unused)
         * @param rootState
         *  The Vuex root state.
         * @returns
         *  The diagram render menu section.
         */
        diagramRenderMenu(_s, _g, rootState): ContextMenuSection {
            let ctx = rootState.ApplicationStore;
            let render_high_quality = ctx.settings.view.diagram.render_high_quality;
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
            }
        },

        /**
         * Returns the zoom menu section.
         * @param _s
         *  The Vuex state. (Unused)
         * @param _g
         *  The Vuex getters. (Unused)
         * @param rootState
         *  The Vuex root state.
         * @returns
         *  The zoom menu section.
         */
        zoomMenu(_s, _g, rootState): ContextMenuSection {
            let ctx = rootState.ApplicationStore;
            let page = ctx.activePage.page;
            let view = ctx.settings.hotkeys.view;
            return {
                id: "zoom_options",
                items: [
                    {
                        text: "Reset View",
                        type: MenuType.Item,
                        data: () => new Page.ResetCamera(ctx, page),
                        shortcut: view.reset_view
                    },
                    {
                        text: "Zoom In",
                        type: MenuType.Item,
                        data: () => new Page.ZoomCamera(ctx, page, 0.25),
                        shortcut: view.zoom_in
                    },
                    {
                        text: "Zoom Out",
                        type: MenuType.Item,
                        data: () => new Page.ZoomCamera(ctx, page, -0.25),
                        shortcut: view.zoom_out
                    },
                ]
            }
        },

        /**
         * Returns the jump menu section.
         * @param _s
         *  The Vuex state. (Unused)
         * @param _g
         *  The Vuex getters. (Unused)
         * @param rootState
         *  The Vuex root state.
         * @param rootGetters
         *  The Vuex root getters.
         * @returns
         *  The jump menu section.
         */
        jumpMenu(_s, _g, rootState, rootGetters): ContextMenuSection {
            let ctx = rootState.ApplicationStore;
            let page = ctx.activePage.page;
            let view = ctx.settings.hotkeys.view;
            let hasSelection = rootGetters["ApplicationStore/hasSelection"];
            return {
                id: "jump_options",
                items: [
                    {
                        text: "Zoom to Selection",
                        type: MenuType.Item,
                        data: () => new Page.MoveCameraToSelection(ctx, page),
                        shortcut: view.jump_to_selection,
                        disabled: !hasSelection
                    },
                    {
                        text: "Jump to Parents",
                        type: MenuType.Item,
                        data: () => new Page.MoveCameraToParents(ctx, page),
                        shortcut: view.jump_to_parents,
                        disabled: !hasSelection
                    },
                    {
                        text: "Jump to Children",
                        type: MenuType.Item,
                        data: () => new Page.MoveCameraToChildren(ctx, page),
                        shortcut: view.jump_to_children,
                        disabled: !hasSelection
                    }
                ]
            }
        },

        /**
         * Returns the fullscreen menu section.
         * @param _s
         *  The Vuex state. (Unused)
         * @param _g
         *  The Vuex getters. (Unused)
         * @param rootState
         *  The Vuex root state.
         * @returns
         *  The fullscreen menu section.
         */
        fullscreenMenu(_s, _g, rootState): ContextMenuSection {
            let ctx = rootState.ApplicationStore;
            let view = ctx.settings.hotkeys.view;
            return {
                id: "fullscreen_options",
                items: [
                    {
                        text: "Fullscreen",
                        type: MenuType.Item,
                        data: () => new App.SwitchToFullscreen(ctx),
                        shortcut: view.fullscreen,
                    }
                ],
            };
        },

        /**
         * Returns the developer view menu section.
         * @param _s
         *  The Vuex state. (Unused)
         * @param _g
         *  The Vuex getters. (Unused)
         * @param rootState
         *  The Vuex root state.
         * @returns
         *  The developer view menu section.
         */
        developerViewMenu(_s, _g, rootState): ContextMenuSection {
            let ctx = rootState.ApplicationStore;
            let view = ctx.settings.hotkeys.view;
            let { display_debug_mode } = ctx.settings.view.diagram;
            return {
                id: "developer_view_options",
                items: [
                    {
                        text: "Debug Mode",
                        type: MenuType.Toggle,
                        data: () => new App.ToggleDebugDisplay(ctx),
                        shortcut: view.toggle_debug_view,
                        value: display_debug_mode,
                        keepMenuOpenOnSelect: true
                    }
                ],
            };
        },

        
        ///////////////////////////////////////////////////////////////////////
        //  5. Help Menu  /////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Returns the help menu.
         * @param _s
         *  The Vuex state. (Unused)
         * @param _g
         *  The Vuex getters. (Unused)
         * @param rootState
         *  The Vuex root state.
         * @returns
         *  The help menu.
         */
        helpMenu(_s, _g, rootState): ContextMenu {
            let ctx = rootState.ApplicationStore;
            let name = Configuration.application_name;
            let links = Configuration.menus.help_menu.help_links;
            // Links
            let items: ContextMenu[] = links.map(link => ({
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
                                text: `${ name } v${ version }`,
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

} as Module<ContextMenuStore, ModuleStore>

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
): ContextMenuSubmenu {
    let sm: ContextMenuSubmenu = {
        text: titleCase(key),
        type: MenuType.Submenu,
        sections: [
            { id: "submenus", items: [] },
            { id: "options", items: [] }
        ]
    }
    for (let [k, v] of value) {
        if (typeof v !== "string") {
            sm.sections[0].items.push(
                generateCreateMenu(k, v, spawn)
            );
        } else {
            sm.sections[1].items.push({
                text: titleCase(k),
                type: MenuType.Item,
                data: () => spawn(v as string),
            });
        }
    }
    sm.sections = sm.sections.filter(s => 0 < s.items.length)
    return sm;
}

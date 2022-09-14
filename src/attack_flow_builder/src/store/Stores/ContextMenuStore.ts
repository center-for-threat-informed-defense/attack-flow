import Configuration from "@/assets/builder.config";
import { Module } from "vuex"
import { ContextMenuStore, ModuleStore } from "../StoreTypes";
import {
    ContextMenu,
    ContextMenuSection,
    MenuAction
} from "@/assets/scripts/ContextMenuTypes";

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
         * @param _g
         *  The Vuex getters. (Unused)
         * @param rootState
         *  The Vuex root state.
         * @param rootGetters
         *  The Vuex root getters.
         * @returns
         *  The file menu.
         */
        fileMenu(_s, _g, rootState, rootGetters): ContextMenu | null {
            let { file } = rootState.AppSettingsStore.settings.hotkeys;
            let fileType = Configuration.file_type_name;
            let canPublish = rootGetters["ActivePageStore/isPageValid"];
            let hasSelection = rootGetters["ActivePageStore/hasSelection"];
            return filterMenuOptions({
                id: "file_menu",
                text: "File",
                action: MenuAction.OpenSubmenu,
                sections: [
                    {
                        id: "open_file_options",
                        items: [
                            {
                                id: "new_file",
                                text: `New File`,
                                action: MenuAction.RunTask,
                                shortcut: file.new_file,
                            },
                            {
                                id: "open_file",
                                text: `Open File...`,
                                action: MenuAction.OpenFile,
                                shortcut: file.open_file,
                            }
                        ],
                    },
                    {
                        id: "save_file_options",
                        items: [
                            {
                                id: "save_file",
                                text: "Save",
                                action: MenuAction.RunTask,
                                shortcut: file.save_file
                            },
                            {
                                id: "save_image",
                                text: "Save as Image",
                                action: MenuAction.RunTask,
                                shortcut: file.save_image
                            },
                            {
                                id: "save_select_image",
                                text: "Save Selection as Image",
                                action: MenuAction.RunTask,
                                shortcut: file.save_select_image,
                                disabled: !hasSelection,
                            }
                        ]
                    },
                    {
                        id: "publish_options",
                        items: [
                            {
                                id: "publish_file",
                                text: `Publish ${ fileType }`,
                                action: MenuAction.RunTask,
                                shortcut: file.publish_file,
                                disabled: !canPublish
                            }
                        ]
                    },
                    // {
                    //     id: "library_options",
                    //     items: [
                    //         {
                    //             id: "open_library",
                    //             text: "Import Library...",
                    //             action: MenuAction.OpenFile,
                    //             shortcut: file.open_library,
                    //         },
                    //         {
                    //             id: "save_library",
                    //             text: "Export Library",
                    //             action: MenuAction.RunTask,
                    //             shortcut: file.save_library
                    //         }
                    //     ]
                    // }
                ]
            }, {
                publish_options: Configuration.publisher !== undefined
            })!;
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
         * @param rootState
         *  The Vuex root state.
         * @returns
         *  The edit menu.
         */
        editMenu(_s, getters, rootState): ContextMenu {
            let { edit } = rootState.AppSettingsStore.settings.hotkeys;
            return {
                id: "edit_menu",
                text: "Edit",
                action: MenuAction.OpenSubmenu,
                sections: [
                    getters.undoRedoMenu,
                    getters.clipboardMenu,
                    getters.deleteMenu,
                    getters.duplicateMenu,
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
            let { edit } = rootState.AppSettingsStore.settings.hotkeys;
            return {
                id: "undo_redo_options",
                items: [
                    {
                        id: "undo",
                        text: "Undo",
                        action: MenuAction.RunTask,
                        shortcut: edit.undo,
                        disabled: !rootGetters["ActivePageStore/canUndo"]
                    },
                    {
                        id: "redo",
                        text: "Redo",
                        action: MenuAction.RunTask,
                        shortcut: edit.redo,
                        disabled: !rootGetters["ActivePageStore/canRedo"]
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
            let { edit } = rootState.AppSettingsStore.settings.hotkeys;
            let canPaste = rootGetters["ActiveDocumentStore/hasClipboardContents"];
            let hasSelection = rootGetters["ActivePageStore/hasSelection"];
            return {
                id: "clipboard_options",
                items: [
                    {
                        id: "cut",
                        text: "Cut",
                        action: MenuAction.RunTask,
                        shortcut: edit.cut,
                        disabled: !hasSelection
                    },
                    {
                        id: "copy",
                        text: "Copy",
                        action: MenuAction.RunTask,
                        shortcut: edit.copy,
                        disabled: !hasSelection
                    },
                    {
                        id: "paste",
                        text: "Paste",
                        action: MenuAction.RunTask,
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
            let { edit } = rootState.AppSettingsStore.settings.hotkeys;
            let hasSelection = rootGetters["ActivePageStore/hasSelection"];
            return {
                id: "delete_options",
                items: [
                    {
                        id: "delete",
                        text: "Delete",
                        action: MenuAction.RunTask,
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
            let { edit } = rootState.AppSettingsStore.settings.hotkeys;
            let hasSelection = rootGetters["ActivePageStore/hasSelection"];
            return {
                id: "duplicate_options",
                items: [
                    {
                        id: "duplicate",
                        text: "Duplicate",
                        action: MenuAction.RunTask,
                        shortcut: edit.duplicate,
                        disabled: !hasSelection
                    }
                ]
            };
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
            let { edit } = rootState.AppSettingsStore.settings.hotkeys;
            return {
                id: "select_options",
                items: [
                    {
                        id: "select_all",
                        text: "Select All",
                        action: MenuAction.RunTask,
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
            // Compile templates
            let { document } = rootState.ActiveDocumentStore;
            // Compile blocks
            let blocks: ContextMenu[] = [];
            for(let t of document.factory.getBlockTemplates()) {
                blocks.push({
                    id: "create_object",
                    text: t.name,
                    action: MenuAction.RunTask,
                    data: { template: t.id }
                })
            }
            // Compile lines
            let lines: ContextMenu[] = [];
            for(let t of document.factory.getLineTemplates()) {
                lines.push({
                    id: "create_object",
                    text: t.name,
                    action: MenuAction.RunTask,
                    data: { template: t.id }
                })
            }
            // Return menu
            return {
                id: "create_options",
                items: [
                    {
                        id: "create_menu",
                        text: "Create",
                        action: MenuAction.OpenSubmenu,
                        sections: [
                            {
                                id: "block_objects",
                                items: blocks,
                            },
                            {
                                id: "line_objects",
                                items: lines,
                            }
                        ]
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
         * @param rootState
         *  The Vuex root state.
         * @returns
         *  The time menu.
         */
        layoutMenu(_s, getters, rootState): ContextMenu {
            let { layout } = rootState.AppSettingsStore.settings.hotkeys;
            return {
                id: "layout_menu",
                text: "Layout",
                action: MenuAction.OpenSubmenu,
                sections: [
                    getters.layeringMenu,
                    // {
                    //     id: "align_options",
                    //     items: [
                    //         {
                    //             id: "align_menu",
                    //             text: "Align",
                    //             action: MenuAction.OpenSubmenu,
                    //             sections: [
                    //                 {
                    //                     id: "horizontal_alignments",
                    //                     items: [
                    //                         {
                    //                             id: "align_left",
                    //                             text: "Align Left",
                    //                             action: MenuAction.RunTask,
                    //                             shortcut: layout.align_left,
                    //                         },
                    //                         {
                    //                             id: "align_center",
                    //                             text: "Align Center",
                    //                             action: MenuAction.RunTask,
                    //                             shortcut: layout.align_center,
                    //                         },
                    //                         {
                    //                             id: "align_right",
                    //                             text: "Align Right",
                    //                             action: MenuAction.RunTask,
                    //                             shortcut: layout.align_right,
                    //                         }
                    //                     ]
                    //                 },
                    //                 {
                    //                     id: "vertical_alignments",
                    //                     items: [
                    //                         {
                    //                             id: "align_top",
                    //                             text: "Align Top",
                    //                             action: MenuAction.RunTask,
                    //                             shortcut: layout.align_top,
                    //                         },
                    //                         {
                    //                             id: "align_middle",
                    //                             text: "Align Middle",
                    //                             action: MenuAction.RunTask,
                    //                             shortcut: layout.align_middle,
                    //                         },
                    //                         {
                    //                             id: "align_bottom",
                    //                             text: "Align Bottom",
                    //                             action: MenuAction.RunTask,
                    //                             shortcut: layout.align_bottom,
                    //                         }
                    //                     ]
                    //                 }
                    //             ]
                    //         }
                    //     ]
                    // },
                    // getters.groupingMenu,
                    // getters.groupMenu,
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
            let { layout } = rootState.AppSettingsStore.settings.hotkeys;
            return {
                id: "layering_options",
                items: [
                    {
                        id: "selection_to_front",
                        text: "To Front",
                        action: MenuAction.RunTask,
                        shortcut: layout.selection_to_front,
                    },
                    {
                        id: "selection_to_back",
                        text: "To Back",
                        action: MenuAction.RunTask,
                        shortcut: layout.selection_to_back,
                    },
                    {
                        id: "bring_selection_forward",
                        text: "Bring Forward",
                        action: MenuAction.RunTask,
                        shortcut: layout.bring_selection_forward,
                    },
                    {
                        id: "send_selection_backward",
                        text: "Send Backward",
                        action: MenuAction.RunTask,
                        shortcut: layout.send_selection_backward,
                    }
                ],
            }
        },

        /**
         * Returns the grouping menu section.
         * @param _s
         *  The Vuex state. (Unused)
         * @param _g
         *  The Vuex getters. (Unused)
         * @param rootState
         *  The Vuex root state.
         * @returns
         *  The grouping menu section.
         */
        groupingMenu(_s, _g, rootState): ContextMenuSection {
            let { layout } = rootState.AppSettingsStore.settings.hotkeys;
            return {
                id: "grouping_options",
                items: [
                    {
                        id: "group",
                        text: "Group",
                        action: MenuAction.RunTask,
                        shortcut: layout.group,
                    },
                    {
                        id: "ungroup",
                        text: "Ungroup",
                        action: MenuAction.RunTask,
                        shortcut: layout.ungroup,
                    }
                ]
            }
        },

        /**
         * Returns the group menu section.
         * @param _s
         *  The Vuex state. (Unused)
         * @param _g
         *  The Vuex getters. (Unused)
         * @param rootState
         *  The Vuex root state.
         * @returns
         *  The group menu section.
         */
        groupMenu(_s, _g, rootState): ContextMenuSection {
            let { layout } = rootState.AppSettingsStore.settings.hotkeys;
            return {
                id: "group_options",
                items: [
                    {
                        id: "open_group",
                        text: "Open Group",
                        action: MenuAction.RunTask,
                        shortcut: layout.open_group,
                    },
                    {
                        id: "close_group",
                        text: "Close Group",
                        action: MenuAction.RunTask,
                        shortcut: layout.close_group,
                    }
                ]
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
         * @param rootState
         *  The Vuex root state.
         * @returns
         *  The view menu.
         */
        viewMenu(_s, getters, rootState): ContextMenu {
            return {
                id: "view_menu",
                text: "View",
                action: MenuAction.OpenSubmenu,
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
            let { view } = rootState.AppSettingsStore.settings.hotkeys;
            let { 
                display_grid,
                display_shadows
            } = rootState.AppSettingsStore.settings.view.diagram;
            return {
                id: "diagram_view_options",
                items: [
                    {
                        id: "toggle_grid",
                        text: "Grid",
                        action: MenuAction.ToggleValue,
                        shortcut: view.toggle_grid,
                        value: display_grid
                    },
                    {
                        id: "toggle_shadows",
                        text: "Shadows",
                        action: MenuAction.ToggleValue,
                        shortcut: view.toggle_shadows,
                        value: display_shadows
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
            let { render_high_quality } = rootState.AppSettingsStore.settings.view.diagram;
            return {
                id: "diagram_render_quality",
                items: [
                    {
                        id: "enable_high_quality_render",
                        text: "Rendering – High Quality",
                        action: MenuAction.ToggleValue,
                        value: render_high_quality,
                    },
                    {
                        id: "enable_low_quality_render",
                        text: "Rendering – Fast",
                        action: MenuAction.ToggleValue,
                        value: !render_high_quality,
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
            let { view } = rootState.AppSettingsStore.settings.hotkeys;
            return {
                id: "zoom_options",
                items: [
                    {
                        id: "reset_view",
                        text: "Reset View",
                        action: MenuAction.RunTask,
                        shortcut: view.reset_view
                    },
                    {
                        id: "zoom_in",
                        text: "Zoom In",
                        action: MenuAction.RunTask,
                        shortcut: view.zoom_in
                    },
                    {
                        id: "zoom_out",
                        text: "Zoom Out",
                        action: MenuAction.RunTask,
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
            let { view } = rootState.AppSettingsStore.settings.hotkeys;
            let hasSelection = rootGetters["ActivePageStore/hasSelection"];
            return {
                id: "jump_options",
                items: [
                    {
                        id: "jump_to_selection",
                        text: "Zoom to Selection",
                        action: MenuAction.RunTask,
                        shortcut: view.jump_to_selection,
                        disabled: !hasSelection
                    },
                    {
                        id: "jump_to_parents",
                        text: "Jump to Parents",
                        action: MenuAction.RunTask,
                        shortcut: view.jump_to_parents,
                        disabled: !hasSelection
                    },
                    {
                        id: "jump_to_children",
                        text: "Jump to Children",
                        action: MenuAction.RunTask,
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
            let { view } = rootState.AppSettingsStore.settings.hotkeys;
            return {
                id: "fullscreen_options",
                items: [
                    {
                        id: "fullscreen",
                        text: "Fullscreen",
                        action: MenuAction.RunTask,
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
            let { view } = rootState.AppSettingsStore.settings.hotkeys;
            let { display_debug_mode } = rootState.AppSettingsStore.settings.view.diagram;
            return {
                id: "developer_view_options",
                items: [
                    {
                        id: "toggle_debug_view",
                        text: "Debug Mode",
                        action: MenuAction.ToggleValue,
                        shortcut: view.toggle_debug_view,
                        value: display_debug_mode
                    }
                ],
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
        helpMenu(): ContextMenu {
            let links = Configuration.help_links;
            return {
                id: "help_menu",
                text: "Help",
                action: MenuAction.OpenSubmenu,
                sections: [
                    {
                        id: "help_links",
                        items: links.map(link => ({
                            id: "open_help_link",
                            text: link.text,
                            action: MenuAction.OpenLink,
                            link: link.url
                        }))
                    },
                    // {
                    //     id: "about",
                    //     items: [
                    //         {
                    //             id: "open_about_window",
                    //             text: "About",
                    //             action: MenuAction.RunTask,
                    //         }
                    //     ]
                    // }
                ]
            };
        }

    }

} as Module<ContextMenuStore, ModuleStore>


/**
 * Recursively filters out disabled and empty menus from a {@link ContextMenu}.
 * @param m
 *  The context menu item to filter.
 * @param f
 *  The features to enable / disable (specified by id).
 *  (Default: {})
 * @returns
 *  The filtered context menu item.
 */
 function filterMenuOptions(m: ContextMenu, f: { [key: string]: boolean } = {}): ContextMenu | undefined {
    // Return null if menu disabled
    if (m.id in f && !f[m.id]) return undefined;
    // Return menu if no submenus
    if (m.action !== MenuAction.OpenSubmenu) return m;
    // Filter sections
    for (let i = m.sections.length - 1; 0 <= i; i--) {
        let section: ContextMenuSection = m.sections[i];
        if (section.id in f && !f[section.id]) {
            m.sections.splice(i, 1);
        } else {
            // Filter section items
            for (let j = section.items.length - 1; 0 <= j; j--) {
                let item = section.items[j];
                if (item.id in f && !f[item.id]) {
                    section.items.splice(j, 1);
                } else if (item.action === MenuAction.OpenSubmenu) {
                    // Filter submenus
                    filterMenuOptions(item, f)
                    if (item.sections.length === 0) {
                        section.items.splice(j, 1);
                    }
                }
            }
            if (section.items.length === 0) {
                m.sections.splice(i, 1);
            }
        }
    }
    // Return filtered menu
    return m.sections.length === 0 ? undefined : m;
}

import { Module } from "vuex"
import { 
    AppSettings,
    AppSettingsStore,
    DiagramDisplaySetting,
    ModuleStore
} from "@/store/StoreTypes";

import settings from "../../../public/settings.json"

export default {
    namespaced: true,
    state: {
        settings: {
            file: {
                image_export: {
                    padding: 0,
                }
            },
            edit: {
                clone_offset: [0, 0]
            },
            view: {
                diagram: {
                    display_grid: true,
                    display_shadows: true,
                    display_debug_mode: false,
                    render_high_quality: true,
                    disable_shadows_at: 0
                }
            },
            hotkeys: {
                file: { 
                    new_file: "",
                    open_file: "",
                    save_file: "",
                    save_image: "",
                    save_select_image: "",
                    publish_file: "",
                    open_library: "",
                    save_library: ""
                },
                edit: {
                    undo: "",
                    redo: "",
                    cut: "",
                    copy: "",
                    paste: "",
                    delete: "",
                    duplicate: "",
                    select_all: ""
                },
                layout: {
                    selection_to_front: "",
                    selection_to_back: "",
                    bring_selection_forward: "",
                    send_selection_backward: "",
                    align_left: "",
                    align_center: "",
                    align_right: "",
                    align_top: "",
                    align_middle: "",
                    align_bottom: "",
                    group: "",
                    ungroup: "",
                    open_group: "",
                    close_group: ""
                },
                view: {
                    toggle_grid: "",
                    toggle_shadows: "",
                    reset_view: "",
                    zoom_in: "",
                    zoom_out: "",
                    fullscreen: "",
                    jump_to_selection: "",
                    jump_to_parents: "",
                    jump_to_children: "",
                    toggle_debug_view: "",
                },
                select: {
                    many: ""
                }
            }
        }
    },

    actions: {

        /**
         * Loads the app's default settings into the store.
         * @param ctx
         *  The Vuex context.
         */
        async loadSettings({ commit }) {
            // let json = await (await fetch("./settings.json")).json();
            let json = settings;  // Build settings in for now
            commit("loadSettings", json);
        },

        /**
         * Shows / Hides the diagram's grid.
         * @param ctx
         *  The Vuex context.
         * @param value
         *  [true]
         *   Show the grid.
         *  [false]
         *   Hide the grid.
         */
        setGridDisplay({ commit }, value: boolean) {
            commit("setDiagramSetting", { key: "display_grid", value });
        },

        /**
         * Shows / Hides the diagram's shadows.
         * @param ctx
         *  The Vuex context.
         * @param value
         *  [true]
         *   Show the diagram's shadows.
         *  [false]
         *   Hide the diagram's shadows.
         */
        setShadowsDisplay({ commit }, value: boolean) {
            commit("setDiagramSetting", { key: "display_shadows", value });
        },

        /**
         * Enables / Disables the diagram's high render quality.
         * @param ctx
         *  The Vuex context.
         * @param value
         *  [true]
         *   Enables the diagram's high render quality.
         *  [false]
         *   Disables the diagram's high render quality.
         */
        setHighRenderQuality({ commit }, value: boolean) {
            commit("setDiagramSetting", { key: "render_high_quality", value });
        },
        
        /**
         * Shows / Hides the diagram's debug display.
         * @param ctx
         *  The Vuex context.
         * @param value
         *  [true]
         *   Show the diagram's debug display.
         *  [false]
         *   Hide the diagram's debug display.
         */
        setDebugDisplay({ commit }, value: boolean) {
            commit("setDiagramSetting", { key: "display_debug_mode", value });
        }
        
    },
    
    mutations: {

        /**
         * Sets the app's settings configuration.
         * @param state
         *  The Vuex state.
         * @param settings
         *  The settings configuration.
         */
        loadSettings(state, settings: AppSettings) {
            state.settings = settings;
        },

        /**
         * Sets the specified appearance setting.
         * @param state
         *  The Vuex state.
         * @param settingParams
         *  [id]
         *   The id of the appearance setting to change.
         *  [value]
         *   The setting's new value. 
         */
        setDiagramSetting(state, { key, value }: DiagramDisplaySetting) {
            (state.settings.view.diagram as any)[key] = value;
        }

    }
} as Module<AppSettingsStore, ModuleStore>

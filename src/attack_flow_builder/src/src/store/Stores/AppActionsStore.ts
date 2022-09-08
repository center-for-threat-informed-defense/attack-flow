import Configuration from "@/assets/builder.config";
import { fullscreen } from "@/assets/scripts/Browser";
import { Module } from "vuex"
import { ModuleStore, ContextMenuStore } from "../StoreTypes";

const ROOT = { root: true };

export default {
    namespaced: true,
    actions: {

        /**
         * Executes an application action.
         * @param ctx
         *  The Vuex Context.
         * @param params
         *  [id]
         *   The action id.
         *  [data]
         *   The action's auxillary data.
         */
        async executeAppAction({ dispatch, rootState }, { id, data }: { id: string, data: any }) {
            switch(id) {
          
                ///////////////////////////////////////////////////////////////
                //  1. File  //////////////////////////////////////////////////
                ///////////////////////////////////////////////////////////////

                case "new_file":
                    await dispatch(
                        "ActiveDocumentStore/createEmptyDocument",
                        `Untitled ${ Configuration.file_type_name }`, ROOT
                    );
                    break;
                case "open_file":
                    await dispatch(
                        "ActiveDocumentStore/openDocument",
                        data.file, ROOT
                    );
                    break;
                case "save_file":
                    await dispatch(
                        "ActiveDocumentStore/saveDocumentToDevice",
                        null, ROOT
                    );
                    break;
                case "save_image":
                    await dispatch(
                        "ActiveDocumentStore/saveActivePageImageToDevice",
                        null, ROOT
                    );
                    break;
                case "save_select_image":
                    await dispatch(
                        "ActiveDocumentStore/saveActiveSelectionImageToDevice",
                        null, ROOT
                    );
                    break;
                case "publish_file":
                    await dispatch(
                        "ActiveDocumentStore/publishActivePageToDevice",
                        null, ROOT
                    );
                    break;
                case "open_library":
                    break;
                case "save_library":
                    break;
                case "close_file":
                    break;
                
                ///////////////////////////////////////////////////////////////
                //  2. Edit  //////////////////////////////////////////////////
                ///////////////////////////////////////////////////////////////
                
                case "undo":
                    await dispatch(
                        "ActivePageStore/undo",
                        null, ROOT
                    );
                    break;
                case "redo":
                    await dispatch(
                        "ActivePageStore/redo",
                        null, ROOT
                    );
                    break;
                case "cut":
                    await dispatch(
                        "ActiveDocumentStore/clipboardCut",
                        null, ROOT
                    );
                    break;
                case "copy":
                    await dispatch(
                        "ActiveDocumentStore/clipboardCopy",
                        null, ROOT
                    );
                    break;
                case "paste":
                    await dispatch(
                        "ActiveDocumentStore/clipboardPaste",
                        null, ROOT
                    );
                    break;
                case "create_object":
                    await dispatch(
                        "ActivePageStore/spawnObject",
                        { 
                            template: data.template, 
                            parent: data.parent,
                            x: data.x,
                            y: data.y
                        }, ROOT
                    );
                    break;
                case "delete":
                    await dispatch(
                        "ActivePageStore/removeSelected",
                        null, ROOT
                    );
                    break;
                case "duplicate":
                    await dispatch(
                        "ActivePageStore/duplicateSelected",
                        null, ROOT
                    );
                    break;
                case "select_all":
                    await dispatch(
                        "ActivePageStore/selectAll",
                        null, ROOT
                    );
                    break;
                
                ///////////////////////////////////////////////////////////////
                //  3. Layout  ////////////////////////////////////////////////
                ///////////////////////////////////////////////////////////////

                case "selection_to_front":
                    break;
                case "selection_to_back":
                    break;
                case "bring_selection_forward":
                    break;
                case "send_selection_backward":
                    break;
                case "align_left":
                    break;
                case "align_center":
                    break;
                case "align_right":
                    break;
                case "align_top":
                    break;
                case "align_middle":
                    break;
                case "align_bottom":
                    break;
                case "group":
                    break;
                case "ungroup":
                    break;
                case "open_group":
                    break;
                case "close_group":
                    break;

                ///////////////////////////////////////////////////////////////
                //  4. View  //////////////////////////////////////////////////
                ///////////////////////////////////////////////////////////////
                
                case "toggle_grid":
                    await dispatch(
                        "AppSettingsStore/setGridDisplay",
                        !data.value, ROOT
                    );
                    break;
                case "toggle_shadows":
                    await dispatch(
                        "AppSettingsStore/setShadowsDisplay",
                        !data.value, ROOT
                    );
                    break;
                case "enable_high_quality_render":
                    await dispatch(
                        "AppSettingsStore/setHighRenderQuality",
                        true, ROOT
                    );
                    break;
                case "enable_low_quality_render":
                    await dispatch(
                        "AppSettingsStore/setHighRenderQuality",
                        false, ROOT
                    );
                    break;
                case "reset_view":
                    await dispatch(
                        "ActivePageStore/resetView",
                        null, ROOT
                    );
                    break;
                case "zoom_in":
                    await dispatch(
                        "ActivePageStore/zoomIn",
                        null, ROOT
                    );
                    break;
                case "zoom_out":
                    await dispatch(
                        "ActivePageStore/zoomOut",
                        null, ROOT
                    );
                    break;
                case "jump_to_selection":
                    await dispatch(
                        "ActivePageStore/moveCameraToSelection",
                        null, ROOT
                    );
                    break;
                case "jump_to_parents":
                    await dispatch(
                        "ActivePageStore/pivotSelectGraphParents",
                        null, ROOT
                    );
                    await dispatch(
                        "ActivePageStore/moveCameraToSelection",
                        null, ROOT
                    );
                    break;
                case "jump_to_children":
                    await dispatch(
                        "ActivePageStore/pivotSelectGraphChildren",
                        null, ROOT
                    );
                    await dispatch(
                        "ActivePageStore/moveCameraToSelection",
                        null, ROOT
                    );
                    break;
                case "fullscreen":
                    fullscreen();
                    break;
                case "toggle_debug_view":
                    await dispatch(
                        "AppSettingsStore/setDebugDisplay",
                        !data.value, ROOT
                    );
                    break;
        
                ///////////////////////////////////////////////////////////////
                //  5. Help  //////////////////////////////////////////////////
                ///////////////////////////////////////////////////////////////

                case "open_about_window":
                    break;
        
                default:
                    break;

            }
        }

    }
} as Module<ContextMenuStore, ModuleStore>

import { Module } from "vuex"
import { Select } from "@/assets/scripts/Visualizations/BlockDiagram/Attributes";
import { markRaw } from "vue";
import { PageModel } from "@/assets/scripts/Visualizations/BlockDiagram/ModelTypes/PageModel";
import { DiagramObjectModel } from "@/assets/scripts/Visualizations/BlockDiagram/ModelTypes/BaseTypes/DiagramObjectModel";
import { ModuleStore, ActivePageStore } from "@/store/StoreTypes"

export default {
    namespaced: true,
    state: {
        page: markRaw(PageModel.createDummy()),
        triggerLayoutUpdate: 0,
        triggerAttributeUpdate: 0,
    },
    actions: {

        /**
         * Adds an object to the current selection.
         * @param ctx
         *  The Vuex context.
         * @param id
         *  The id of the object to select.
         */
        select({ commit }, id: string) {
            commit("addToSelection", id);
        },

        /**
         * Removes all objects from the current selection.
         * @param ctx
         *  The Vuex context.
         */
        unselectAll({ commit }) {
            commit("clearSelection");
        },

        /**
         * Moves one or more objects relative to their current position. 
         * @param ctx
         *  The Vuex context. 
         * @param params
         *  [ids]
         *   The ids of one or more objects to move.
         *  [x]
         *   The change in x.
         *  [y]
         *   The change in y.
         */
        moveBy({ commit }, params: MoveParams) {
            commit("moveObjectsBy", params);
        }

    },
    mutations: {

        /**
         * Sets the active page.
         * @param state
         *  The Vuex state.
         * @param page
         *  The page.
         */
        setActivePage(state, page: PageModel){
            state.page = markRaw(page);
        },

        /**
         * Adds an object to the current selection.
         * @param state
         *  The Vuex state.
         * @param id
         *  The id of the object to select.
         */
        addToSelection(state, id: string) {
            // Add item to selection
            state.page.addToSelection(id);
            // Trigger attribute update
            state.triggerAttributeUpdate++;
        },

        /**
         * Removes all objects from the current selection.
         * @param state
         *  The Vuex state.
         */
        clearSelection(state) {
            // Clear selection
            state.page.clearSelection();
            // Trigger attribute update
            state.triggerAttributeUpdate++;
        },

        /**
         * Moves one or more objects relative to their current position.
         * @param state
         *  The Vuex state.
         * @param params
         *  [ids]
         *   The ids of one or more objects to move.
         *  [x]
         *   The change in x.
         *  [y]
         *   The change in y.
         */
        moveObjectsBy(state, { ids, x, y }: MoveParams) {
            // Move objects
            // ids = Array.isArray(ids) ? ids : [ids];
            // for(let id of ids) {
            //     state.page.lookup(id)?.moveBy(x, y);
            // }
            // Trigger layout update
            state.triggerLayoutUpdate++;
        }

    }
} as Module<ActivePageStore, ModuleStore>


///////////////////////////////////////////////////////////////////////////////
//  Internal Types  ///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


type MoveParams = {
    ids: string[] | string,
    x: number,
    y: number
}

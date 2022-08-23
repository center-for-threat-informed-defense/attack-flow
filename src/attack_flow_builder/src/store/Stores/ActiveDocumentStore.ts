import DEFAULT_SCHEMA from "@/assets/builder.config";
import { Module } from "vuex"
import { markRaw } from "vue";
import { BlockDiagramDocument } from "@/assets/scripts/Visualizations/BlockDiagram/BlockDiagramDocument";
import { BlockDiagramDocumentExport } from "@/assets/scripts/Visualizations/BlockDiagram/DiagramFactory/DiagramExportTypes";
import { ModuleStore, ActiveDocumentStore } from "@/store/StoreTypes"

const ROOT = { root: true };

export default {
    namespaced: true,
    state: {
        document: markRaw(BlockDiagramDocument.createDummy())
    },
    getters: {
        
    },
    actions: {

        /**
         * Creates and opens an empty block diagram document.
         * @param ctx
         *  The Vuex context.
         * @param name
         *  The name of the new document.
         */
        createEmptyDocument(ctx, name: string) {
            let { commit, state } = ctx;
            commit("setActiveDocument", BlockDiagramDocument.create(name, DEFAULT_SCHEMA));
            commit("ActivePageStore/setActivePage", state.document.page, ROOT);
        },

        /**
         * Opens a block diagram document.
         * @param ctx
         *  The Vuex context.
         * @param document
         *  The serialized block diagram document.
         */
        openDocument(ctx, document: BlockDiagramDocumentExport) {
            let { commit, state } = ctx;
            commit("setActiveDocument", BlockDiagramDocument.deserialize(document));
            commit("ActivePageStore/setActivePage", state.document.page, ROOT);
        }

    },
    mutations: {

        /**
         * Sets the active block diagram document.
         * @param state
         *  The Vuex state.
         * @param document
         *  The block diagram document.
         */
        setActiveDocument(state, document: BlockDiagramDocument) {
            state.document = markRaw(document);
        }

    }
} as Module<ActiveDocumentStore, ModuleStore>

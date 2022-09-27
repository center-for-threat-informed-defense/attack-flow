import Configuration from "@/assets/builder.config";
import { Module } from "vuex"
import { markRaw } from "vue";
import { Download } from "@/assets/scripts/Download";
import { ModuleStore, ActiveDocumentStore } from "@/store/StoreTypes"
import { 
    BlockDiagramDocument,
    DiagramObjectModel
} from "@/assets/scripts/BlockDiagram";

const ROOT = { root: true };

export default {
    namespaced: true,
    state: {
        document: markRaw(BlockDiagramDocument.createDummy()),
        clipboard: [],
        publisher: undefined,
    },
    getters: {

        /**
         * Tests if the clipboard has contents.
         * @param state
         *  The Vuex state.
         * @returns
         *  True if the clipboard has contents, false otherwise.
         */
        hasClipboardContents(state) {
            return 0 < state.clipboard.length;
        }

    },
    actions: {


        ///////////////////////////////////////////////////////////////////////
        //  1. Document Control  //////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Creates and opens an empty block diagram document.
         * @param ctx
         *  The Vuex context.
         * @param name
         *  The name of the new document.
         */
        async createEmptyDocument(ctx, name: string) {
            let { commit, state } = ctx;
            let schema = structuredClone(Configuration.schema);
            commit("setActiveDocument", await BlockDiagramDocument.create(name, schema));
            commit("ActivePageStore/setActivePage", state.document.editor, ROOT);
        },

        /**
         * Opens a block diagram document.
         * @param ctx
         *  The Vuex context.
         * @param document
         *  The serialized block diagram document.
         */
        async openDocument(ctx, document: string) {
            let { commit, state } = ctx;
            commit("setActiveDocument", await BlockDiagramDocument.deserialize(document));
            commit("ActivePageStore/setActivePage", state.document.editor, ROOT);
        },

        /**
         * Opens a block diagram document from a URL.
         * @param ctx
         *  The Vuex context.
         * @param url
         *  The URL to fetch a document from.
         */
        async openDocumentUrl(ctx, url: string) {
            let { commit, state } = ctx;
            const response = await fetch(url, { credentials: "omit" });
            const document = await response.text();
            commit("setActiveDocument", await BlockDiagramDocument.deserialize(document));
            commit("ActivePageStore/setActivePage", state.document.editor, ROOT);
        },

        ///////////////////////////////////////////////////////////////////////
        //  2. Document Export  ///////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Saves the open document to the device.
         * @param ctx
         *  The Vuex context.
         */
        saveDocumentToDevice({ state }) {
            let file = JSON.stringify(state.document.toExport());
            Download.textFile(state.document.name, file, Configuration.file_type_extension);
        },

        /**
         * Saves the active page as an image to the device.
         * @param ctx
         *  The Vuex context.
         */
        async saveActivePageImageToDevice({ dispatch, state }) {
            let can = await dispatch("ActivePageStore/snapImage", [], ROOT);
            Download.imageFile(state.document.name, can);
        },

        /**
         * Saves the active selection as an image to the device.
         * @param ctx
         *  The Vuex context.
         */
        async saveActiveSelectionImageToDevice({ dispatch, state, rootState }) {
            let s = rootState.ActivePageStore.selects.ref;
            if(!s.size)
                return;
            let can = await dispatch("ActivePageStore/snapImage", [...s.keys()], ROOT);
            Download.imageFile(state.document.name, can);
        },

        /**
         * Publishes the active page to the device.
         * @param ctx
         *  The Vuex store.
         */
        async publishActivePageToDevice({ dispatch, state, rootState, rootGetters }) {
            let page = rootState.ActivePageStore.page.ref;
            // Ensure there's a publisher
            if(!state.publisher) {
                return;
            }
            // Validate page
            if(!rootGetters["ActivePageStore/isPageValid"]) {
                return;
            }
            // Publish page
            let publish = state.publisher.publish(page);
            Download.textFile(state.document.name, publish, "json");
        },

        
        ///////////////////////////////////////////////////////////////////////
        //  3. Clipboard  /////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Cuts the active selection to the clipboard.
         * @param ctx
         *  The Vuex context.
         */
        clipboardCut({ commit, dispatch, state, rootState }) {
            let f = state.document.factory;
            let s = rootState.ActivePageStore.selects.ref;
            if(!s.size)
                return;
            // Copy selection
            commit("setClipboard", f.cloneObjects(...s.values()));
            // Remove selection
            dispatch("ActivePageStore/removeSelected", null, ROOT);
        },
        
        /**
         * Copies the active selection to the clipboard.
         * @param ctx
         *  The Vuex context.
         */
        clipboardCopy({ commit, state, rootState }) {
            let f = state.document.factory;
            let s = rootState.ActivePageStore.selects.ref;
            let o = rootState.AppSettingsStore.settings.edit.clone_offset;
            if(!s.size)
                return;
            // Copy selection
            commit("setClipboard", f.cloneObjects(...s.values()));
            // Offset copies
            let [ gridX, gridY ] = rootState.ActivePageStore.page.ref.grid;
            commit("offsetClipboard", { dx: o[0] * gridX, dy: o[1] * gridY });
        },

        /**
         * Pastes the clipboard's contents to the active page.
         * @param ctx
         *  The Vuex context.
         */
        clipboardPaste({ commit, dispatch, state, rootState }) {
            let f = state.document.factory;
            let o = rootState.AppSettingsStore.settings.edit.clone_offset;
            // Clone objects
            let objects = f.cloneObjects(...state.clipboard);
            // Add clones
            dispatch("ActivePageStore/addObjects", { objects }, ROOT);
            // Clear selection
            dispatch("ActivePageStore/unselectAll", null, ROOT);
            // Select clones
            dispatch("ActivePageStore/select", objects.map(o => o.id), ROOT);
            // Offset clipboard objects
            let [ gridX, gridY ] = rootState.ActivePageStore.page.ref.grid;
            commit("offsetClipboard", { dx: o[0] * gridX, dy: o[1] * gridY });
        }

    },
    mutations: {

        
        ///////////////////////////////////////////////////////////////////////
        //  1. Document Control  //////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Sets the active block diagram document.
         * @param state
         *  The Vuex state.
         * @param document
         *  The block diagram document.
         */
        setActiveDocument(state, document: BlockDiagramDocument) {
            state.document = markRaw(document);
            if(Configuration.publisher) {
                state.publisher = new Configuration.publisher();
            }
        },


        ///////////////////////////////////////////////////////////////////////
        //  2. Clipboard  /////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Sets the clipboard's contents.
         * @param state
         *  The Vuex state.
         * @param objects
         *  The clipboard's contents.
         */
        setClipboard(state, objects: DiagramObjectModel[]) {
            state.clipboard = objects;
        },

        /**
         * Offsets the clipboard's contents.
         * @param state
         *  The Vuex state.
         * @param params
         *  [dx]
         *   The x offset.
         *  [dy]
         *   The y offset.
         */
        offsetClipboard(state, { dx, dy }: { dx: number, dy: number }) {
            for(let obj of state.clipboard) {
                obj.moveBy(dx, dy);
            }
        }

    }
} as Module<ActiveDocumentStore, ModuleStore>

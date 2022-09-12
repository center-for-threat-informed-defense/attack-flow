import Configuration from "@/assets/builder.config";
import { Module } from "vuex"
import { markRaw } from "vue";
import { ModuleStore, ActivePageStore } from "@/store/StoreTypes";
import { 
    Alignment,
    CameraLocation,
    DiagramLineModel,
    DiagramObjectModel,
    Hover,
    Layer,
    LocationType,
    PageEditor,
    PageImage,
    PageModel,
    Property,
    round,
    Select,
    SemanticAnalyzer,
    SemanticRole
} from "@/assets/scripts/BlockDiagram";

export default {
    namespaced: true,
    state: {
        page: {
            trigger: 0,
            editor: markRaw(new PageEditor(PageModel.createDummy())),
            ref: PageModel.createDummy()
        },
        hovers: [],
        selects: {
            trigger: 0,
            ref: markRaw(new Map())
        },
        transform: {
            x: 0,
            y: 0,
            k: 1
        },
        validator: undefined
    },
    getters: {
        
        /**
         * Tests if the active page has a selection.
         * @param state
         *  The Vuex state.
         * @returns
         *  True if the active page has a selection, false otherwise.
         */
        hasSelection(state): boolean {
            // Using trigger to trip the reactivity system
            if(1 + state.selects.trigger === 0) {
                return false;  // Will never run
            }
            return 0 < state.selects.ref.size;
        },

        /**
         * Tests if the active page can undo.
         * @param state
         *  The Vuex state.
         * @returns
         *  True if the active page can undo, false otherwise.
         */
        canUndo(state): boolean {
            // Using trigger to trip the reactivity system
            if(1 + state.page.trigger === 0) {
                return false;  // Will never run
            }
            return state.page.editor.canUndo();
        },

        /**
         * Tests if the active page can redo.
         * @param state
         *  The Vuex state.
         * @returns
         *  True if the active page can undo, false otherwise.
         */
        canRedo(state): boolean {
            // Using trigger to trip the reactivity system
            if(1 + state.page.trigger === 0) {
                return false;  // Will never run
            }
            return state.page.editor.canRedo();
        },

        /**
         * Tests if the active page represents a valid diagram per the
         * configured validator. If the application is not configured with a
         * validator, `true` is returned by default.
         * @param state
         *  The Vuex state.
         * @returns
         *  True if the active page is valid, false otherwise.
         */
        isPageValid(state) {
            return state.validator?.inValidState() ?? true;
        }
        
    },
    actions: {


        ///////////////////////////////////////////////////////////////////////
        //  1. Select Page Objects  ///////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Adds one or more objects to the current selection.
         * @param ctx
         *  The Vuex context.
         * @param ids
         *  The object ids.
         */
        select({ commit }, ids: string[] | string) {
            if(Array.isArray(ids)) {
                for(let id of ids) {
                    commit("addToSelection", id);
                }   
            } else {
                commit("addToSelection", ids);
            }
        },

        /**
         * Selects all objects immediately belonging to the page.
         * @param ctx
         *  The Vuex context.
         */
        selectAll({ dispatch, state }) {
            let objs = state.page.ref.children;
            dispatch("unselectAll");
            dispatch("select", objs.map(o => o.id));
        },

        /**
         * Removes all objects from the current selection.
         * @param ctx
         *  The Vuex context.
         */
        unselectAll({ commit, state }) {
            let s = state.selects;
            if(s.ref.size === 0)
                return;
            for (let id of s.ref.keys()) {
                commit("removeFromSelection", id);
            }
        },

        /**
         * Updates the selection index.
         * @param ctx
         *  The Vuex context.
         */
        updateSelect({ commit, state }) {
            for(let id of state.selects.ref.keys()) {
                if(!state.page.ref.lookup(id)) {
                    commit("removeFromSelection", id);
                }
            }
        },

        /**
         * Interprets the selection as a graph and pivots to its parents.
         * @param ctx
         *  The Vuex context.
         */
        pivotSelectGraphParents({ dispatch }) {
            let resolver = SemanticAnalyzer.getPrevGraphLinks.bind(SemanticAnalyzer);
            dispatch("__pivotSelectGraph", resolver);
        },

        /**
         * Interprets the selection as a graph and pivots to its children.
         * @param ctx
         *  The Vuex context.
         */
        pivotSelectGraphChildren({ commit, dispatch, state }) {
            let resolver = SemanticAnalyzer.getNextGraphLinks.bind(SemanticAnalyzer);
            dispatch("__pivotSelectGraph", resolver);
        },

        /**
         * [INTERNAL USE ONLY]
         * Pivots the selection using the specified graph link resolver.
         * @param ctx
         *  The Vuex context.
         * @param getLinks
         *  The graph link resolver. 
         */
        __pivotSelectGraph({ commit, dispatch, state }, getLinks: GraphLinkResolver) {
            let selects = [...state.selects.ref.values()];
            // Unselect all
            dispatch("unselectAll");
            // Pivot selection
            for(let obj of selects) {
                let links = getLinks(obj);
                if(obj.hasRole(SemanticRole.Node)) {
                    for(let link of links) {
                        let nodes = getLinks(link);
                        if(nodes.length) {
                            for(let next of nodes) {
                                commit("addToSelection", next.id);
                            }
                        } else {
                            commit("addToSelection", link.id);
                        }
                    }
                } else {
                    for(let link of links) {
                        commit("addToSelection", link.id);
                    }
                }
            }
        },


        ///////////////////////////////////////////////////////////////////////
        //  2. Hover Page Objects  ////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////

        
        /**
         * Updates the current hover.
         * @param ctx
         *  The Vuex context.
         * @param id
         *  The id of the object to hover.
         */
        hover({ commit }, id: string) {
            commit("clearHover");
            commit("setHover", id);
        },

        /**
         * Removes all objects from the current hover.
         * @param ctx
         *  The Vuex context.
         */
        unhoverAll({ commit }) {
            commit("clearHover");
        },

        /**
         * Updates the hover chain.
         * @param ctx
         *  The Vuex context.
         */
        updateHover({ commit, state }) {
            let h = state.hovers;
            if(h.length && !state.page.ref.lookup(h[0].id)) {
                commit("clearHover");
            }
        },

        
        ///////////////////////////////////////////////////////////////////////
        //  3. Add & Remove Page Objects  /////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Creates and adds an object to the diagram.
         * @param ctx
         *  The Vuex context.
         * @param params
         *  [template]
         *   The object's template.
         *  [parent]
         *   The id of the object to append to.
         *   (Default: This page)
         *  [x]
         *   The location on the x-axis relative to the page's container.
         *   (Default: The container's center.)
         *  [y]
         *   The location on the y-axis relative to the page's container.
         *   (Default: The container's center.)
         */
        spawnObject({ commit, state }, { template, parent, x, y }: CreateObjectParams) {
            // Create object
            let obj = state.page.ref.factory.createObject(template);
            // Move object
            let t = state.transform;
            if(x === undefined) {
                // Position in center of screen
                x = t.x + (state.page.ref.location.x - t.x);
            } else {
                // Position left-side of object at x 
                let { xMid, xMin } = obj.boundingBox;
                x = ((x - t.x) / t.k) + xMid - xMin;
            }
            if(y === undefined) {
                // Position in middle of screen
                y = t.y + (state.page.ref.location.y - t.y);
            } else {
                // Position top-side of object at y 
                let { yMid, yMin } = obj.boundingBox;
                y = ((y - t.y) / t.k) + yMid - yMin;
            }
            if(obj.getAlignment() === Alignment.Grid) {
                // If aligned to grid, snap x and y
                x = round(x, state.page.ref.grid[0]);
                y = round(y, state.page.ref.grid[1]);
            }
            obj.moveTo(x, y);
            // Add object
            commit("addObjects", { objects: obj, parent });
        },

        /**
         * Adds one or more objects to the diagram.
         * @param ctx
         *  The Vuex context.
         * @param params
         *  [objects]
         *   The objects.
         *  [parent]
         *   The id of the object to append to.
         *   (Default: This page)
         */
        addObjects({ commit }, params: AddObjectsParams) {
            commit("addObjects", params);
        },

        /**
         * Adds a line object to the diagram and links it to the specified
         * anchors.
         * @param ctx
         *  The Vuex context
         * @param params
         *  [object]
         *   The line object.
         *  [source]
         *   The source anchor's id.
         *  [target]
         *   The target anchor's id.
         *  [parent]
         *   The id of the object to append to.
         *   (Default: This page)
         */
        addLineObject({ commit }, params: AddLineObjectParams) {
            commit("addLineObject", params);
        },

        /**
         * Removes an object from the diagram.
         * @param ctx
         *  The Vuex context.
         * @param object
         *  The id of the object.
         */
        removeObject({ commit, dispatch }, object: string) {
            commit("removeObject", object);
            dispatch("updateSelect");
            dispatch("updateHover");
        },

        /**
         * Removes all selected objects from the diagram.
         * @param ctx
         *  The Vuex context.
         */
        removeSelected({ commit, dispatch }) {
            commit("removeSelected");
            dispatch("updateSelect");
            dispatch("updateHover");
        },

        /**
         * Duplicates all selected objects in the diagram and shifts selection
         * to the duplicated objects.
         * @param ctx
         *  The Vuex context.
         */
        duplicateSelected({ commit, dispatch, state, rootState }) {
            let s = state.selects.ref;
            let f = state.page.ref.factory;
            let o = rootState.AppSettingsStore.settings.edit.clone_offset;
            if(!s.size)
                return;
            // Clone objects
            let objects = f.cloneObjects(...s.values());
            // Offset clones
            let [ gridX, gridY ] = state.page.ref.grid;
            for(let obj of objects) {
                obj.moveBy(o[0] * gridX, o[1] * gridY);
            }
            // Add clones
            commit("addObjects", { objects });
            // Clear selection
            dispatch("unselectAll");
            // Select clones
            dispatch("select", objects.map(o => o.id));
        },


        ///////////////////////////////////////////////////////////////////////
        //  4. Anchor Page Objects  ///////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////
        

        /**
         * Links an object to an anchor.
         * @param ctx
         *  The Vuex context.
         * @param params
         *  [object]
         *   The id of the object.
         *  [anchor]
         *   The id of the anchor.
         *  @throws { Error }
         *   If either the anchor or object can't be found, the object itself
         *   is an anchor, or the object is already anchored to something else.
         */
        attach({ commit }, params: AttachParams) {
            commit("attach", params);
        },

        /**
         * Unlinks an object from its anchor and moves it relative to its
         * current position.
         * @param ctx
         *  The Vuex context.
         * @param params
         *  [object]
         *   The object's id.
         *  [dx]
         *   The change in x.
         *  [dy]
         *   The change in y.
         */
        detach({ commit }, params: DetachParams) {
            commit("detach", params);
        },

        
        ///////////////////////////////////////////////////////////////////////
        //  5. Move Page Objects  /////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Moves one or more objects relative to their current position. 
         * @param ctx
         *  The Vuex context. 
         * @param params
         *  [ids]
         *   The ids of one or more objects to move.
         *  [dx]
         *   The change in x.
         *  [dy]
         *   The change in y.
         */
        moveBy({ commit }, params: MoveParams) {
            commit("moveObjectsBy", params);
        },


        ///////////////////////////////////////////////////////////////////////
        //  6. Edit Page Object Property  /////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Sets a property.
         * @param ctx
         *  The Vuex context.
         * @param params
         *  [object]
         *   The id of the objects to edit.
         *  [property]
         *   The object's property.
         *  [value]
         *   The property's new value.
         */
        setObjectProperty({ commit }, params: EditPropertyParams) {
            // NOTE: This is only temporary. Property edits will be saved to the clipboard.
            commit("setObjectProperty", params);
        },


        ///////////////////////////////////////////////////////////////////////
        //  7. Layer Page Objects  ////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Moves all selected objects to a different layer in their parents.
         * @param state
         *  The Vuex state.
         * @param layer
         *  The layer to move the objects to.
         */
        reorderSelected({ commit, state }, layer: Layer) {
            let s = state.selects.ref;
            if(!s.size)
                return;
            commit("reorderObjects", { objects: [...s.keys()].reverse(), layer });
        },


        ///////////////////////////////////////////////////////////////////////
        //  8. Move Page Camera  //////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Moves the camera to the specified location. 
         * @param ctx
         *  The Vuex context.
         * @param loc
         *  The camera's location.
         */
        moveCameraTo({ commit }, loc: CameraLocation) {
            commit("setCameraLocation", loc);
        },

        /**
         * Moves the camera to the page's origin.
         * @param ctx
         *  The Vuex context.
         */
        resetView({ commit }) {
            commit("setCameraLocation", {
                type: LocationType.Point,
                x: 0, y: 0, k: 1
            });
        },

        /**
         * Zooms the camera in.
         * @param ctx
         *  The Vuex context.
         */
        zoomIn({ commit, state }) {
            let k;
            let l = state.page.ref.location;
            switch(l.type) {
                case LocationType.Region:
                    k = state.transform.k + 0.25;    
                    break;
                case LocationType.Point:
                    k = l.k + 0.25;
                    break;
            }
            commit("setCameraLocation", {
                type: LocationType.Point,
                x: l.x, y: l.y, k
            });
        },

        /**
         * Zooms the camera out.
         * @param ctx
         *  The Vuex context.
         */
        zoomOut({ commit, state }) {
            let k;
            let l = state.page.ref.location;
            switch(l.type) {
                case LocationType.Region:
                    k = state.transform.k - 0.25; 
                    break;
                case LocationType.Point:
                    k = l.k - 0.25;
                    break;
            }
            commit("setCameraLocation", {
                type: LocationType.Point,
                x: l.x, y: l.y, k
            });
        },

        /**
         * Moves the camera to the current selection.
         * @param ctx
         *  The Vuex context.
         */
        moveCameraToSelection({ commit, state }) {
            if(state.selects.ref.size === 0)
                return;
            // Calculate bounding box
            let xMin = Infinity;
            let yMin = Infinity;
            let xMax = -Infinity;
            let yMax = -Infinity;
            for(let obj of state.selects.ref.values()) {
                xMin = Math.min(xMin, obj.boundingBox.xMin);
                yMin = Math.min(yMin, obj.boundingBox.yMin);
                xMax = Math.max(xMax, obj.boundingBox.xMax);
                yMax = Math.max(yMax, obj.boundingBox.yMax);
            }
            // Calculate camera position
            let w = xMax - xMin;
            let h = yMax - yMin;
            let x = Math.round((xMin + xMax) / 2);
            let y = Math.round((yMin + yMax) / 2);
            // Set camera position
            commit("setCameraLocation", { 
                type: LocationType.Region,
                x, y, w, h
            });
        },


        ///////////////////////////////////////////////////////////////////////
        //  9. View Transform  ////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Sets the page view's current transform.
         * @param ctx
         *  The Vuex context.
         * @param transform
         *  The transform
         */
        setViewTransform({ commit }, transform: ViewTransform) {
            commit("setViewTransform", transform);
        },


        ///////////////////////////////////////////////////////////////////////
        //  10. Page History Controls  ////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Undoes the last page action.
         * @param ctx
         *  The Vuex context.
         */
        undo({ commit, dispatch }) {
            commit("undo");
            dispatch("updateSelect");
            dispatch("updateHover");
        },

        /**
         * Undoes the last undone page action.
         * @param ctx
         *  The Vuex context.
         */
        redo({ commit, dispatch }) {
            commit("redo");
            dispatch("updateSelect");
            dispatch("updateHover");
        },


        ///////////////////////////////////////////////////////////////////////
        //  11. Image Capture  ////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Snaps an image of the page.
         * @param ctx
         *  The Vuex context.
         * @param ids
         *  The ids of the objects to capture, if no objects are specified the
         *  whole page is captured.
         * @returns
         *  The image.
         */
        snapImage({ commit, state, rootState }, ids: string[]): HTMLCanvasElement {
            commit("toggleHover", false);
            commit("toggleSelect", false);
            // Snap image
            let { diagram } = rootState.AppSettingsStore.settings.view;         
            let { image_export } = rootState.AppSettingsStore.settings.file;
            let image = new PageImage(
                state.page.ref,
                image_export.padding,
                diagram.display_grid,
                diagram.display_shadows,
                diagram.display_debug_mode
            );
            let can: HTMLCanvasElement;
            if(ids.length) {
                can = image.capture(ids);
            } else {
                can = image.capture();
            }
            commit("toggleSelect", true);
            commit("toggleHover", true);
            return can;
        }

    },
    mutations: {

        /**
         * Sets the active page.
         * @param state
         *  The Vuex state.
         * @param editor
         *  The page's editor.
         */
        setActivePage(state, editor: PageEditor){
            // Clear selection
            for(let obj of state.selects.ref.values()) {
                obj.setSelect(Select.Unselected);
            }
            state.selects.ref = markRaw(new Map());
            // Clear hover
            for(let obj of state.hovers) {
                obj.setHover(Hover.Off);
            }
            state.hovers = [];
            // Set page
            state.page.editor = markRaw(editor);
            state.page.ref = markRaw(editor.page);
            // Set validator
            if(Configuration.validator) {
                state.validator = new Configuration.validator();
                state.validator.reset();
            }
        },


        ///////////////////////////////////////////////////////////////////////
        //  1. Select Page Objects  ///////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////
        

        /**
         * Adds an object to the current selection.
         * @param state
         *  The Vuex state.
         * @param id
         *  The id of the object to select.
         */
        addToSelection(state, id: string) {
            let s = state.selects.ref;
            let obj = state.page.ref.lookup(id);
            // Check object
            if(!obj) {
                throw new Error(`'${ id }' does not exist.`);
            }
            if (s.has(id)) {
                return;
            }
            // Set selection bit
            if (s.size === 0) {
                obj.setSelect(Select.Single);
            } else if (s.size === 1) {
                let fst = s.values().next().value;
                fst.setSelect(Select.Multi);
                obj.setSelect(Select.Multi);
            } else {
                obj.setSelect(Select.Multi);
            }
            // Add item to selection
            s.set(obj.id, obj);
            // Increment update trigger
            state.selects.trigger++;
        },

        /**
         * Removes an object from the current selection.
         * @param state
         *  The Vuex state.
         * @param id
         *  The object's id.
         */
        removeFromSelection(state, id: string) {
            let s = state.selects.ref;
            if (!s.has(id))
                return;
            let obj = s.get(id)!;
            // Clear selection bit
            obj.setSelect(Select.Unselected);
            // Remove item
            s.delete(id);
            // Set remaining node to single selection (if applicable)
            if (s.size === 1) {
                let obj = s.values().next().value;
                obj.setSelect(Select.Single);
            }
            // Increment update trigger
            state.selects.trigger++;
        },

        /**
         * Toggle's the current selection on or off.
         * @param state
         *  The Vuex state.
         * @param on
         *  [true]
         *   Toggle select on.
         *  [false]
         *   Toggle select off.
         */
        toggleSelect(state, on: boolean) {
            let s = state.selects.ref;
            if(on) {
                if(s.size === 1) {
                    let obj = s.values().next().value;
                    obj.setSelect(Select.Single);
                } else {
                    for(let obj of s.values()) {
                        obj.setSelect(Select.Multi);
                    }
                }
            } else {
                for(let obj of s.values()) {
                    obj.setSelect(Select.Unselected)
                }
            }
        },


        ///////////////////////////////////////////////////////////////////////
        //  2. Hover Page Objects  ////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////
        
        
        /**
         * Sets the current hover chain.
         * @param state
         *  The Vuex state.
         * @param id
         *  The id of the object to hover.
         */
        setHover(state, id: string) {
            let obj = state.page.ref.lookup(id);
            if(!obj) {
                throw new Error(`'${ id }' does not exist.`);
            }
            // Object is directly hovered
            let chain = [obj];
            obj.setHover(Hover.Direct);
            // Parents are indirectly hovered
            let p = obj.parent;
            while(p) {
                chain.push(p);
                p.setHover(Hover.Indirect);
                p = p.parent;
            }
            // Set hover chain
            state.hovers = chain;
        },

        /**
         * Clears the current hover chain.
         * @param state
         *  The Vuex state.
         */
        clearHover(state) {
            let h = state.hovers;
            // Unhover object and parents
            for(let i = 0; i < h.length; i++){
                h[i].setHover(Hover.Off);
            }
            // Clear hover chain
            state.hovers = [];
        },

        /**
         * Toggles the current hover chain on or off.
         * @param state
         *  The Vuex state.
         * @param on
         *  [true]
         *   Toggle hover on.
         *  [false]
         *   Toggle hover off.
         */
        toggleHover(state, on: boolean) {
            let h = state.hovers;
            if(on && h.length) {
                h[0].setHover(Hover.Direct);
                for(let i = 1; i < h.length; i++) {
                    h[i].setHover(Hover.Indirect);
                }
            } else {
                for(let obj of h) {
                    obj.setHover(Hover.Off);
                }
            }
        },


        ///////////////////////////////////////////////////////////////////////
        //  3. Add & Remove Page Objects  /////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Adds one or more objects to the diagram.
         * @param state
         *  The Vuex state.
         * @param params
         *  [objects]
         *   The objects.
         *  [parent]
         *   The id of the object to append to.
         *   (Default: This page)
         */
        addObjects(state, { objects, parent }: AddObjectsParams) {
            // Add objects
            if(Array.isArray(objects)) {
                state.page.editor.beginTransaction();
                for(let obj of objects) {
                    state.page.editor.addObject(obj, parent);
                }
                state.page.editor.endTransaction();
            } else {
                state.page.editor.addObject(objects, parent);
            }
            // Validate 
            state.validator?.run(state.page.ref);
            // Increment update trigger
            state.page.trigger++;
        },

        /**
         * Adds a line object to the diagram and links it to the specified
         * anchors.
         * @param state
         *  The Vuex state
         * @param params
         *  [object]
         *   The line object.
         *  [source]
         *   The source anchor's id.
         *  [target]
         *   The target anchor's id.
         *  [parent]
         *   The id of the object to append to.
         *   (Default: This page)
         */
        addLineObject(state, { object, source, target, parent }: AddLineObjectParams) {
            // Add line object
            state.page.editor.addLineObject(object, source, target, parent);
            // Validate
            state.validator?.run(state.page.ref);
            // Increment update trigger
            state.page.trigger++;
        },

        /**
         * Removes an object from the diagram.
         * @param state
         *  The Vuex state.
         * @param object
         *  The id of the object.
         */
        removeObject(state, object: string) {
            // Remove object
            state.page.editor.removeObjects(object);
            // Validate
            state.validator?.run(state.page.ref);
            // Increment update trigger
            state.page.trigger++;
        },

        /**
         * Removes all selected objects from the diagram.
         * @param state
         *  The Vuex state.
         */
        removeSelected(state) {
            let s = state.selects.ref;
            if(!s.size)
                return;
            // Remove selection
            state.page.editor.removeObjects(...s.keys());
            // Validate
            state.validator?.run(state.page.ref);
            // Increment update trigger
            state.page.trigger++;
        },

        
        ///////////////////////////////////////////////////////////////////////
        //  4. Anchor Page Objects  ///////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Links an object to an anchor.
         * @param state
         *  The Vuex state.
         * @param params
         *  [object]
         *   The id of the object.
         *  [anchor]
         *   The id of the anchor.
         *  @throws { Error }
         *   If either the anchor or object can't be found, the object itself
         *   is an anchor, or the object is already anchored to something else.
         */
        attach(state, { object, anchor }: AttachParams) {
            // Link object
            state.page.editor.attach(object, anchor);
            // Validate
            state.validator?.run(state.page.ref);
            // Increment update trigger
            state.page.trigger++;
        },

        /**
         * Unlinks an object from its anchor and moves it relative to its
         * current position.
         * @param state
         *  The Vuex state.
         * @param params
         *  [object]
         *   The object's id.
         *  [dx]
         *   The change in x.
         *  [dy]
         *   The change in y.
         */
        detach(state, { object, dx, dy }: DetachParams) {
            dx = dx ?? 0;
            dy = dy ?? 0;
            // Unlink object
            if(dx || dy) {
                state.page.editor.beginTransaction();
                state.page.editor.moveObjectsBy(object, dx, dy);
                state.page.editor.detach(object);
                state.page.editor.endTransaction();
            } else {
                state.page.editor.detach(object);
            }
            // Validate
            state.validator?.run(state.page.ref);
            // Increment update trigger
            state.page.trigger++;
        },


        ///////////////////////////////////////////////////////////////////////
        //  5. Move Page Objects  /////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Moves one or more objects relative to their current position.
         * @param state
         *  The Vuex state.
         * @param params
         *  [objects]
         *   The ids of one or more objects to move.
         *  [dx]
         *   The change in x.
         *  [dy]
         *   The change in y.
         */
        moveObjectsBy(state, { objects, dx, dy }: MoveParams) {
            // Round dx & dy
            dx = Math.round(dx);
            dy = Math.round(dy);
            // Move objects
            state.page.editor.moveObjectsBy(objects, dx, dy);
            // Increment update trigger
            state.page.trigger++;
        },


        ///////////////////////////////////////////////////////////////////////
        //  6. Edit Page Object Property  /////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Sets a property.
         * @param state
         *  The Vuex state.
         * @param params
         *  [object]
         *   The id of the objects to edit.
         *  [property]
         *   The object's property.
         *  [value]
         *   The property's new value.
         */
        setObjectProperty(state, { object, property, value }: EditPropertyParams) {
            // NOTE: This is only temporary. Property edits will be saved to the clipboard.
            let obj = state.page.ref.lookup(object);
            if(!obj) {
                throw new Error(`No object with id: '${ object }'.`);
            }
            obj.setProperty(property, value);
            // Increment update trigger
            state.page.trigger++;
        },

        
        ///////////////////////////////////////////////////////////////////////
        //  7. Layer Page Objects  ////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Moves one or more objects to a different layer in their parents.
         * @param state
         *  The Vuex state.
         * @param params
         *  [objects]
         *   The ids of one or more objects to move.
         *  [layer]
         *   The layer to move the objects to.
         */
        reorderObjects(state, { objects, layer }: ReorderObjectLayerParams) {
            if(Array.isArray(objects)) {
                state.page.editor.beginTransaction();
                for(let id of objects) {
                    state.page.editor.reorderObjectLayer(id, layer);
                }
                state.page.editor.endTransaction();
            } else {
                state.page.editor.reorderObjectLayer(objects, layer);
            }
            // Increment update trigger
            state.page.trigger++;
        },

        
        ///////////////////////////////////////////////////////////////////////
        //  8. Move Page Camera  //////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////

        
        /**
         * Moves the camera to the specified location. 
         * @param state
         *  The Vuex state.
         * @param loc
         *  The camera's location.
         */
        setCameraLocation(state, loc: CameraLocation) {
            // Move camera
            state.page.editor.setCameraLocation(loc);
            // Increment update trigger
            state.page.trigger++;
        },


        ///////////////////////////////////////////////////////////////////////
        //  9. View Transform  ////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Sets the page view's current transform.
         * @param state
         *  The Vuex state.
         * @param transform
         *  The transform
         */
        setViewTransform(state, transform: ViewTransform) {
            state.transform = transform;
        },


        ///////////////////////////////////////////////////////////////////////
        //  10. Page History Controls  ////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////

        
        /**
         * Undoes the last page action.
         * @param state
         *  The Vuex state.
         */
        undo(state) {
            // Undo
            state.page.editor.undo();
            // Validate
            state.validator?.run(state.page.ref);
            // Increment update trigger
            state.page.trigger++;
        },

        /**
         * Undoes the last undone page action.
         * @param state
         *  The Vuex state.
         */
        redo(state) {
            // Redo
            state.page.editor.redo();
            // Validate
            state.validator?.run(state.page.ref);
            // Increment update trigger
            state.page.trigger++;
        }

    }
} as Module<ActivePageStore, ModuleStore>


///////////////////////////////////////////////////////////////////////////////
//  Internal Types  ///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


type CreateObjectParams = {
    template: string,
    parent?: string,
    x?: number,
    y?: number
}

type AddObjectsParams = {
    objects: DiagramObjectModel[] | DiagramObjectModel,
    parent?: string
}

type AddLineObjectParams = {
    object: DiagramLineModel,
    source: string,
    target?: string,
    parent?: string
}

type AttachParams = {
    object: string,
    anchor: string
}

type DetachParams = {
    object: string,
    dx?: number,
    dy?: number
}

type MoveParams = {
    objects: string[] | string,
    dx: number,
    dy: number
}

type EditPropertyParams = {
    object: string,
    property: Property
    value: any
}

type ReorderObjectLayerParams = {
    objects: string[] | string,
    layer: Layer
}

type ViewTransform = {
    x: number,
    y: number,
    k: number
}

type GraphLinkResolver = (obj: DiagramObjectModel) => DiagramObjectModel[];

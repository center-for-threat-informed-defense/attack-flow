import { Module } from "vuex"
import { AppSession, CanvasEdge, CanvasNode, EdgeSchema, ModuleStore, NodeSchema, SessionStore } from "../StoreTypes";
import { toIsoString } from "@/assets/Math"
import { titleCase } from "@/assets/String";

export default {
    state: {
        session: {
            namespace: "",
            canvas: {
                cameraX   : 0,
                cameraY   : 0,
                padding   : 0,
                pageSizeX : 0,
                pageSizeY : 0
            },
            nodes: new Map() as Map<string, CanvasNode>,
            edges: new Map() as Map<string, CanvasEdge>,
            schema: null
        },
        nodeIdCounter: 0,
        layoutTrigger: 0,
    },
    actions: {


        ///////////////////////////////////////////////////////////////////////
        //  1. Session Import & Export  ///////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Opens and imports an Attack Flow save file into the store.
         * @param ctx
         *  The Vuex context.
         * @param text
         *  The save file's raw text.
         */
        openAttackFlowSaveFile({ dispatch }, text: string) {
            let file = JSON.parse(text) as AppSession;
            dispatch("importSession", { session: file, schema: file.schema });
        },

        /**
         * Saves and downloads the current attack flow session.
         * @param ctx
         *  The Vuex context.
         * @param name
         *  The save file's name
         */
        saveAttackFlow({ state, dispatch, rootState }, name: string) {
            if(state.session.nodes.size !== 0) {
                let session = {
                    canvas: state.session.canvas,
                    nodes: [...state.session.nodes.values()],
                    edges: [...state.session.edges.values()],
                    schema: state.session.schema
                }
                let file = JSON.stringify(session);
                dispatch("_downloadFile", { filename: name, text: file })
            } else {
                dispatch("pushNotification", {
                    type: "info",
                    title: "NOTICE",
                    description: "You can't save an empty session.",
                    time: 2000
                })
            }
        },

        /**
         * Compiles and downloads the current attack flow session.
         * @param ctx
         *  The Vuex context.
         * @param saveParams
         *  [name]
         *   The save file's name.
         *  [date]
         *   The save date.
         */
        async publishAttackFlow({ state, dispatch, rootState }, { name, date }: { name: string, date: Date}) {
            let namespace = state.session.namespace;
            let $schema = `./${ name }`
            let flow = {
                type: "attack-flow",
                id: `http://${ namespace }`,
                name: "Attack Flow Export",
                author: "Unspecified",
                created: toIsoString(date)
            }
            try {
                // Validate schema
                let { nodeSchemas } = rootState.SchemaStore;
                let n = [...state.session.nodes.values()];
                for(let [type, schema] of nodeSchemas) {
                    let nodes = n.filter(o => o.type === type);
                    for(let node of nodes) {
                        if(!await dispatch("_validateObj", { obj: node, schema })) {
                            throw `Required '${ titleCase(type) }' node fields are missing.`
                        }
                    }
                }
                let { edgeSchemas } = rootState.SchemaStore;
                let e = [...state.session.edges.values()];
                for(let [type, schema] of edgeSchemas) {
                    let edges = e.filter(o => o.type === type);
                    for(let edge of edges) {
                        if(!await dispatch("_validateObj", { obj: edge, schema })) {
                            throw `Required '${ titleCase(type) }' edge fields are missing.`
                        }
                    }
                }

                ///////////////////////////////////////////////////////////////
                // The following code is designed specifically for the current
                // schema, changing the schema may break publish functionality.
                ///////////////////////////////////////////////////////////////
                
                // Actions
                let _actions = n.filter(o => o.type === "action");
                let actions = [];
                for(let action of _actions) {
                    actions.push({
                        id: `http://${ namespace }/action-${ action.id }`,
                        type: "action",
                        name: action.payload.name ?? null,
                        description: action.payload.description ?? null,
                        timestamp: action.payload.timestamp ?? null,
                        reference: action.payload.reference ?? null,
                        succeeded: action.payload.succeeded ?? null,
                        confidence: action.payload.confidence ?? null,
                        logic_operator_language: action.payload.logic_operator_language ?? null,
                        logic_operator: action.payload.logic_operator ?? null
                    })
                }
                // Assets
                let _assets = n.filter(o => o.type === "asset");
                let assets = [];
                for(let asset of _assets) {
                    assets.push({
                        id: `http://${ namespace }/asset-${ asset.id }`,
                        type: "asset",
                        state: asset.payload.state ?? null
                    })
                }
                // Relationships

                // TODO

                // Download
                let file = JSON.stringify({ 
                    $schema,
                    flow,
                    actions,
                    assets
                });
                dispatch("_downloadFile", { filename: name, text: file })

            } catch(ex) {
                dispatch("pushNotification", {
                    type: "error",
                    title: "Export Failed",
                    description: ex
                })
            }
        },

        /**
         * Imports a designer session and schema into the store.
         * @param ctx
         *  The Vuex context.
         * @param
         *  [session]
         *   The designer session to import.
         *  [schema]
         *   The attack flow schema to use.
         */
        async importSession({ commit, dispatch, state }, { session, schema }) {
            commit("clearSession");
            // Load Schema
            await dispatch("loadSchema", schema);
            // Load Session
            commit("setSessionNamespace", session.namespace);
            commit("setCanvasState", session.canvas);
            commit("setSessionSchema", schema);
            for(let node of session.nodes) {
                // Add Node
                commit("addNode", node);
            }
            for(let edge of session.edges) {
                let source = state.session.nodes.get(edge.sourceId);
                let target = state.session.nodes.get(edge.targetId);
                if(source === undefined || target === undefined)
                    continue;
                let edgeObj: CanvasEdge = { 
                    id: edge.id, 
                    sourceId: edge.sourceId, 
                    targetId: edge.targetId, 
                    source, target, 
                    type: edge.type,
                    payload: edge.payload
                }
                // Add Edge
                commit("addEdge", edgeObj);                
            }
            commit("recalculatePages");
            commit("incrementLayoutTrigger");
        },

        /**
         * [INTERNAL USE ONLY]
         * Validates an object against its schema.
         * @param ctx
         *  The Vuex context.
         * @param nodeParams
         *  [node]
         *   The object to validate.
         *  [schema]
         *   The schema to validate against.
         * @returns
         *  True if the object matches the schema, false otherwise.
         */
        _validateObj(ctx, { obj, schema }: SchemaValidationParams) {
            for(let [name, field] of schema.fields) {
                switch(field.type) {
                    case "string":
                    case "datetime":
                        if(field.required && !obj.payload[name]) {
                            return false;
                        }
                }
            }
            return true;
        },

        /**
         * [INTERNAL USE ONLY]
         * Downloads a text file to the local machine.
         * @param ctx
         *  The Vuex context.
         * @param saveParams
         *  [filename]
         *   The save file's name.
         *  [text]
         *   The text contents of the file.
         */
        _downloadFile(ctx, { filename, text }: { filename: string, text: string }) {
            // Create Blob
            let blob = new Blob([text], {type: "octet/stream"});
            let url = window.URL.createObjectURL(blob);
            // Generate Link
            let a = document.createElement("a");
            a.href = url;
            a.download = filename;
            // Download
            a.click();
            window.URL.revokeObjectURL(url);
        },


        ///////////////////////////////////////////////////////////////////////
        //  2. Graph Editing  /////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Creates a new graph node.
         * @param ctx
         *  The Vuex context.
         * @param nodeParams
         *  [type]
         *   The node type.
         *  [location]
         *   Where the node should be placed on the canvas.
         */
        createNode({ commit, rootState }, { type, location }: NodeParams) {
            let schema = rootState.SchemaStore?.nodeSchemas.get(type);
            if(schema !== undefined){
                // Create default payload
                let payload: any = {}
                for(let [name, field] of schema.fields)
                    payload[name] = field?.default
                // Create node
                let node: CanvasNode = {
                    id: "-1", 
                    type: type, 
                    subtype: schema.subtype?.default,
                    x0: location[0],
                    y0: location[1],
                    x1: location[0],
                    y1: location[1],
                    payload
                };
                // Add node
                commit("addNode", node);
            }
            commit("recalculatePages");
            commit("incrementLayoutTrigger");
        },
        
        /**
         * Sets a node's subtype field.
         * @param ctx
         *  The Vuex context.
         * @param nodeParams
         *  [id]
         *   The id of the node to edit.
         *  [value]
         *   The new subtype value.
         */
        setNodeSubtype({ commit }, nodeParams: SubTypeUpdate) {
            commit("setNodeSubtype", nodeParams);
        },

        /**
         * Sets a node's field.
         * @param ctx
         *  The Vuex context.
         * @param nodeParams
         *  [id]
         *   The id of the node to edit.
         *  [field]
         *   The name of the field.
         *  [value]
         *   The field's new value.
         */
        setNodeField({ commit }, nodeParams: FieldUpdate) {
            commit("setNodeField", nodeParams);
        },

        /**
         * Sets a node's lower right boundary.
         * @param ctx
         *  The Vuex context.
         * @param positionParams
         *  [id]
         *   The id of the node to edit.
         *  [x1]
         *   The lower boundary's x coordinate.
         *  [y1]
         *   The lower boundary's y coordinate.
         */
        setNodeLowerBound({ commit }, positionParams: { id: string, x1: number, y1: number }) {
            commit("setNodeLowerBound", positionParams)
        },

        /**
         * Offsets a node's position by the given amount.
         * @param ctx
         *  The Vuex context.
         * @param offsetParams
         *  [id]
         *   The id of the node to offset.
         *  [x]
         *   The amount to offset by on the x axis.
         *  [y]
         *   The amount to offset by on the y axis.
         */
        offsetNode({ state, commit }, {id, x, y}: { id: string, x: number, y: number }) {
            let node = state.session.nodes.get(id);
            if(node !== undefined) {
                commit("setNodePosition", { 
                    id, 
                    x0: node.x0 + x, 
                    y0: node.y0 + y,
                    x1: node.x1 + x,
                    y1: node.y1 + y, 
                });
            };
        },

        /**
         * Creates a new graph edge.
         * @param ctx
         *  The Vuex Context.
         * @param edgeParams
         *  [type]
         *   The edge type.
         *  [source]
         *   The edge's source node (specified by id).
         *  [target]
         *   The edge's target node (specified by id).
         */
        async createEdge({ commit, rootState, dispatch, state }, { type, source, target }: EdgeParams) {
            // Get Nodes
            let srcNode = state.session.nodes.get(source);
            if(srcNode != undefined) {
                let trgNode = state.session.nodes.get(target);
                if(trgNode === undefined)
                    return;
                // Resolve Type
                let type = await dispatch("getEdgeType", {
                    source: srcNode.type,
                    target: trgNode.type
                })
                let schema = rootState.SchemaStore?.edgeSchemas.get(type);
                if(schema !== undefined) { 
                    // Create default payload
                    let payload: any = {}
                    for(let [name, field] of schema.fields)
                        payload[name] = field?.default
                    // Create Link
                    let link: CanvasEdge = {
                        id: `${ srcNode.id }.${ trgNode.id }`,
                        sourceId: srcNode.id,
                        targetId: trgNode.id,
                        source: srcNode,
                        target: trgNode,
                        type: type,
                        payload
                    }
                    commit("addEdge", link);
                }
            }
        },
        
        /**
         * Sets an edge's field.
         * @param ctx
         *  The Vuex context.
         * @param edgeParams
         *  [id]
         *  The id of the edge to edit.
         *  [field]
         *   The name of the field.
         *  [value]
         *   The field's new value.
         */
        setEdgeField({ commit }, edgeParams: FieldUpdate) {
            commit("setEdgeField", edgeParams);
        },

        /**
         * Duplicates a sequence of interconnected nodes.
         * @param ctx
         *  The Vuex context.
         * @param ids
         *  The set of nodes (specified by id) to duplicate.
         */
        async duplicateSequence({ commit, dispatch, state }, ids) {
            // Duplicate nodes
            let newNodeMap = new Map<string, CanvasNode>()
            for(let id of ids) {
                let base = state.session.nodes.get(id);
                if(base !== undefined) {
                    let node: CanvasNode = {
                        id: "-1",
                        type: base.type,
                        subtype: base.subtype,
                        x0: base.x0 + 100,
                        y0: base.y0 + 100,
                        x1: base.x1 + 100,
                        y1: base.y1 + 100,
                        payload: { ...base.payload }
                    }
                    newNodeMap.set(id, node);
                    commit("addNode", node);
                }
            }
            // Duplicate dependent edges
            let edges = await dispatch("_getConnectedEdges", { ids, includeWeakLinks: false });
            for(let id of edges) {
                let base = state.session.edges.get(id);
                if(base === undefined) continue;
                let source = newNodeMap.get(base!.sourceId);
                let target = newNodeMap.get(base!.targetId);
                if(source === undefined || target === undefined) 
                    continue;
                let edge: CanvasEdge = {
                    id: `${ source.id }.${ target.id }`,
                    sourceId: source.id,
                    targetId: target.id,
                    source, target,
                    type: base.type,
                    payload: { ...base.payload }
                }
                commit("addEdge", edge);
            }
        },
        
        /**
         * Deletes a set of items from the graph.
         * @param ctx
         *  The Vuex context.
         * @param ids
         *  The items (specified by id) to delete.
         */
        async deleteItems({ commit, dispatch }, ids) {
            // Partition ids
            let nodeIds: Array<string> = [];
            let edgeIds: Array<string> = [];
            for(let id of ids)
                (/^[0-9]+$/.test(id) ? nodeIds : edgeIds).push(id);
            // Delete edges
            commit("deleteEdges", edgeIds);
            // Delete nodes
            commit("deleteNodes", nodeIds);
            // Delete dependent edges
            let edges = await dispatch("_getConnectedEdges", { 
                ids: nodeIds, includeWeakLinks: true 
            });
            commit("deleteEdges", edges);
            // Recalculate pages
            commit("recalculatePages");
        },
        
        /**
         * Recalculates the number of pages that make up the canvas.
         * 
         * @param param0 
         */
        recalculatePages({commit}) {
            commit("recalculatePages");
        },
        
        
        // Canvas Operations
        setCameraPosition({ commit }, args) {
            commit("setCameraPosition", args);
        },
        
        
        
        /**
         * [INTERNAL USE ONLY]
         * Returns the set of edge's that connect to the given nodes.
         * @param ctx
         *  The Vuex context.
         * @param queryParams
         *  [ids]
         *   The node's (specified by id) to evaluate.
         *  [includeWeakLinks]
         *   If true, a link only needs to have a source or a target in the set
         *   to be included. If false, a link's source and target *must* be in
         *   the set to be included.
         * @returns
         *  The set of connected edges.
         */
        _getConnectedEdges({ state }, { ids, includeWeakLinks }: { ids: Array<string>, includeWeakLinks: boolean }) {
            // Not ideal, graph traversal would be better, but this will work for now.
            let idsSet = new Set(ids);
            let edges: Array<string> = [];
            for(let [_, edge] of state.session.edges) {
                let isFullLink = idsSet.has(edge.sourceId) && idsSet.has(edge.targetId);
                let isWeakLink = idsSet.has(edge.sourceId) || idsSet.has(edge.targetId);
                if(isFullLink || (includeWeakLinks && isWeakLink)) {
                    edges.push(edge.id);
                }
            }
            return edges;
        },
        
        

    },
    mutations: {
        
        /**
         * Clears the current session and configures the canvas state.
         * @param state
         *  The Vuex state.
         * @param session
         *  The session that's being imported.
         */
        clearSession(state) {
            state.session.nodes.clear();
            state.session.edges.clear();
        },

        /**
         * Sets the session's namespace.
         * @param state
         *  The Vuex state.
         * @param namespace
         *  The session's namespace. 
         */
        setSessionNamespace(state, namespace: string) {
            state.session.namespace = namespace;
        },

        /**
         * Sets the canvas state.
         * @param state
         *  The Vuex state.
         * @param session
         *  The new canvas state.
         */
        setCanvasState(state, canvas) {
            state.session.canvas = canvas;
        },

        /**
         * Sets the session's (unparsed) schema.
         * @param state
         *  The Vuex state.
         * @param schema
         *  The session's (unparsed) schema.
         */
        setSessionSchema(state, schema: any) {
            state.session.schema = schema;
        },

        /**
         * Adds a node to the session store.
         * @param state
         *  The Vuex state.
         * @param node
         *  The node to add.
         */
        addNode(state, node: CanvasNode) {
            // Assign ID if none set
            if(node.id === "-1") {
                node.id = `${ ++state.nodeIdCounter }`;
            } else {
                state.nodeIdCounter = Math.max(state.nodeIdCounter, parseInt(node.id));
            }
            if(!state.session.nodes.has(node.id)) {
                state.session.nodes.set(node.id, node);
            }
        },

        /**
         * Sets a node's subtype field.
         * @param state
         *  The Vuex state.
         * @param nodeParams
         *  [id]
         *   The id of the node to edit.
         *  [value]
         *   The new subtype value.
         */
        setNodeSubtype(state, { id, value }: SubTypeUpdate) {
            let node = state.session.nodes.get(id);
            if(node !== undefined) {
                node.subtype = value;
            }
        },
        
        /**
         * Sets a nodes's field.
         * @param state
         *  The Vuex state.
         * @param edgeParams
         *  [id]
         *   The id of the node to edit.
         *  [field]
         *   The name of the field.
         *  [value]
         *   The field's new value.
         */
        setNodeField(state, { id, field, value }: FieldUpdate) {
            let node = state.session.nodes.get(id);
            if(node !== undefined) {
                node.payload[field] = value
            }
        },
        
        /**
         * Deletes a set of nodes from the session store.
         * @param state
         *  The Vuex state.
         * @param ids
         *  The set of nodes (specified by id) to delete.
         */
        deleteNodes(state, ids: Array<string>) {
            for(let id of ids) {
                state.session.nodes.delete(id);
            }
        },

        /**
         * Sets a node's lower right boundary.
         * @param state
         *  The Vuex state.
         * @param positionParams
         *  [id]
         *   The id of the node to edit.
         *  [x1]
         *   The lower boundary's x coordinate.
         *  [y1]
         *   The lower boundary's y coordinate.
         */
        setNodeLowerBound(state, { id, x1, y1 }: { id: string, x1: number, y1: number }){
            let node = state.session.nodes.get(id);
            if(node !== undefined) {
                node.x1 = x1;
                node.y1 = y1;
            }
        },
        
        /**
         * Sets a nodes position on the canvas.
         * @param state
         *  The Vuex state.
         * @param positionParams 
         */
        setNodePosition(state, { id, x0, y0, x1, y1 }: NodePosition) {
            let node = state.session.nodes.get(id);
            if(node !== undefined) {
                node.x0 = x0;
                node.y0 = y0;
                node.x1 = x1;
                node.y1 = y1;
            }
        },

        /**
         * Adds an edge to the session store.
         * @param state
         *  The Vuex state.
         * @param edge
         *  The edge to add.
         */
        addEdge(state, edge: CanvasEdge) {
            if(!state.session.edges.has(edge.id)) {
                state.session.edges.set(edge.id, edge);
            }
        },
        
        /**
         * Sets an edge's field.
         * @param state
         *  The Vuex state.
         * @param edgeParams
         *  [id]
         *   The id of the edge to edit.
         *  [field]
         *   The name of the field.
         *  [value]
         *   The field's new value.
         */
         setEdgeField(state, { id, field, value }: FieldUpdate) {
            let edge = state.session.edges.get(id);
            if(edge !== undefined) {
                edge.payload[field] = value
            }
        },
        
        /**
         * Deletes a set of edges from the session store.
         * @param state
         *  The Vuex state.
         * @param ids
         *  The set of edges (specified by id) to delete.
         */
        deleteEdges(state, ids: Array<string>) {
            for(let id of ids) {
                state.session.edges.delete(id);
            }
        },

        /**
         * Stores the current camera position.
         * @param state
         *  The Vuex state.
         * @param positionParams
         *  [x]
         *   The x coordinate of the camera.
         *  [y]
         *   The y coordinate of the camera.
         */
        setCameraPosition(state, {x, y}: { x: number, y: number }) {
            state.session.canvas.cameraX = x;
            state.session.canvas.cameraY = y;
        },

        
        recalculatePages(state) {
            // Skip if no nodes
            if(state.session.nodes.size === 0)
                return;
            // Compute upper-left bound
            let [x, y] = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
            for(let [_, node] of state.session.nodes) {
                x = Math.min(node.x0, x);
                y = Math.min(node.y0, y);
            }
            // Compute xOffset and yOffset correction
            let { pageSizeX, pageSizeY, padding } = state.session.canvas; 
            // xRemaining = (x-padding) % pageSizeX (below "fixes" negative mod in JS)
            let xRemaining = (((x-padding) % pageSizeX) + pageSizeX) % pageSizeX;
            let xOffset = x - (xRemaining + padding)
            // yRemaining = (x-padding) % pageSizeY (below "fixes" negative mod in JS)
            let yRemaining = (((y-padding) % pageSizeY) + pageSizeY) % pageSizeY;
            let yOffset = y - (yRemaining + padding);
            // If offset correction required:
            if(xOffset !== 0 || yOffset !== 0) {
                for(let [_, node] of state.session.nodes) {
                    node.x0 -= xOffset;
                    node.y0 -= yOffset;
                    node.x1 -= xOffset;
                    node.y1 -= yOffset;
                }
                // Correct Camera
                state.session.canvas.cameraX -= xOffset;
                state.session.canvas.cameraY -= yOffset;
            }
        },

        /**
         * Increments the layout trigger.
         * @param state
         *  The Vuex state.
         */
        incrementLayoutTrigger(state){
            state.layoutTrigger++;
        }

    }
    
} as Module<SessionStore, ModuleStore>


///////////////////////////////////////////////////////////////////////////////
//  Internal Types  ///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


type EdgeParams = { type: string, source: string, target: string };
type NodeParams = { type: string, location: Array<number> } 
type SubTypeUpdate = { id: string, value: any };
type FieldUpdate  = { id: string, field: string, value: any };
type NodePosition = { id: string, x0: number, y0: number, x1: number, y1: number };
type SchemaValidationParams = { obj: CanvasNode | CanvasEdge, schema: NodeSchema | EdgeSchema }

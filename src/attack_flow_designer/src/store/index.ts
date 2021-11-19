import { createStore } from 'vuex'
import { AttackFlowSchema } from './AttackFlowSchema';

export default createStore({
    state: {
        meta: {
            idToNodeMap: new Map<number, Types.ICanvasNode>(),
            idToEdgeMap: new Map<string, Types.ICanvasEdge>()
        },
        session: {
            canvas: {
                cameraX   : 0,
                cameraY   : 0,
                padding   : 0,
                pageSizeX : 0,
                pageSizeY : 0
            },
            nodes: [] as Array<Types.ICanvasNode>,
            edges: [] as Array<Types.ICanvasEdge>,
        },
        schema: null as AttackFlowSchema | null,
        nodeIdCounter: 0,
    },
    getters: {
        getNodes: (state) => 
            state.session.nodes,
        getEdges: (state) => 
            state.session.edges,
        getNodeSchemas: (state) => 
            state.schema?.nodes,
        getCanvasPadding: (state) =>
            state.session.canvas.padding,
        getPageSize: (state) => ({ 
            width: state.session.canvas.pageSizeX, 
            height: state.session.canvas.pageSizeY
        }),
        getCameraPosition: (state) => ({
            x: state.session.canvas.cameraX,
            y: state.session.canvas.cameraY,
        })
    },
    actions: {

        createNode({ commit, state }, { type, location }: { type: string, location: Array<number> }) {
            let schema = state.schema?.nodes.get(type);
            if(schema !== undefined){
                // Create default payload
                let payload: any = {}
                for(let [name, field] of schema.fields)
                    payload[name] = field?.default
                // Create node
                let node: Types.ICanvasNode = {
                    id: -1, 
                    type: type, 
                    subtype: schema.subtype?.default,
                    x0: location[0],
                    y0: location[1],
                    x1: location[0],
                    y1: location[1],
                    payload
                };
                // Add node
                commit("createNode", node);
            }
            commit("recalculatePages");
        },

        createEdge({ commit, state }, { source, targets }: { source: number, targets: Array<number> }) {
            // Get Nodes
            let srcNode = state.meta.idToNodeMap.get(source);
            if(srcNode != undefined) {
                for(let id of targets) {
                    let trgNode = state.meta.idToNodeMap.get(id);
                    if(trgNode === undefined)
                        continue;
                    // Create Link
                    let link: Types.ICanvasEdge = {
                        id: `${ srcNode.id }.${ trgNode.id }`,
                        sourceId: srcNode.id,
                        targetId: trgNode.id,
                        source: srcNode,
                        target: trgNode,
                        type: null
                    }
                    commit("createEdge", link);
                }
            }
        },

        async duplicateNodes({ commit, dispatch, state }, ids) {
            // Duplicate nodes
            let newNodeMap = new Map<number, Types.ICanvasNode>()
            for(let id of ids) {
                let base = state.meta.idToNodeMap.get(id);
                if(base !== undefined) {
                    let node: Types.ICanvasNode = {
                        id: -1,
                        type: base.type,
                        subtype: base.subtype,
                        x0: base.x0 + 100,
                        y0: base.y0 + 100,
                        x1: base.x1 + 100,
                        y1: base.y1 + 100,
                        payload: { ...base.payload }
                    }
                    newNodeMap.set(id, node);
                    commit("createNode", node);
                }
            }
            // Duplicate dependent edges
            let edges = await dispatch("_getDependantEdges", { ids, allowWeakLinks: false });
            for(let id of edges) {
                let base = state.meta.idToEdgeMap.get(id);
                if(base === undefined) continue;
                let source = newNodeMap.get(base!.sourceId);
                let target = newNodeMap.get(base!.targetId);
                if(source === undefined || target === undefined) 
                    continue;
                let type: Types.ICanvasEdgeDescriptor | null = null;
                if(base.type !== null) {
                    type = { type: base.type.type, payload: { ...base.type.payload } }
                }
                let edge: Types.ICanvasEdge = {
                    id: `${ source.id }.${ target.id }`,
                    sourceId: source.id,
                    targetId: target.id,
                    source, target, type
                }
                commit("createEdge", edge);
            }
        },

        async deleteNodes({ commit, dispatch }, ids) {
            // Delete nodes
            commit("deleteNodes", ids);
            // Delete dependent edges
            let edges = await dispatch("_getDependantEdges", { ids, allowWeakLinks: true });
            commit("deleteEdges", edges);
            // Recalculate pages
            commit("recalculatePages");
        },

        undo() {

        },
        redo() {

        },

        // Canvas Operations

        setCameraPosition({ commit }, args) {
            commit("setCameraPosition", args);
        },

        addEdge({ state, commit }, { src, dst }: { src: Number, dst: Number }) {

        },
        delNode({ state, commit }, id: Number) {

        },
        delEdge({ state, commit }, id: Number) {

        },

        setNodeSubtype({ commit }, args) {
            commit("setNodeSubtype", args);
        },
        setNodeField({ commit }, args) {
            commit("setNodeField", args);
        },
        setNodeLowerBound({ commit }, args) {
            commit("setNodeLowerBound", args)
        },
        offsetNode({ state, commit }, { id, x, y }) {
            let node = state.meta.idToNodeMap.get(id);
            if(node !== undefined) {
                commit("setNodePosition", { 
                    id, 
                    x0: node.x0 + x, 
                    y0: node.y0 + y,
                    x1: node.x1 + x,
                    y1: node.y1 + y, 
                });
            }
        },

        recalculatePages({commit}) {
            commit("recalculatePages");
        },
        
        // Session Export / Import
        importSession({ commit, state }, { session, schema }) {
            commit("loadSession", session);
            for(let node of session.nodes) {
                // Add Node
                commit("createNode", node);
            }
            for(let edge of session.edges) {
                let source = state.meta.idToNodeMap.get(edge.sourceId);
                let target = state.meta.idToNodeMap.get(edge.targetId);
                if(source === undefined || target === undefined)
                    continue;
                let edgeObj: Types.ICanvasEdge = { 
                    id: edge.id, 
                    sourceId: edge.sourceId, 
                    targetId: edge.targetId, 
                    source, target, 
                    type: edge.type
                }
                // Add Edge
                commit("createEdge", edgeObj);                
            }
            commit("loadSchema", new AttackFlowSchema(schema));
            commit("recalculatePages");
        },
        exportSession({ state }) {
            //return JSON.stringify({ session: state.session, schema: state.schema });
        },

        // Attack Flow Export
        exportAttackFlow(_) {
            
        },

        _getDependantEdges({ state }, { ids, allowWeakLinks }: { ids: Array<number>, allowWeakLinks: boolean }) {
            // Not ideal, graph traversal would be better, but this will work for now.
            let idsSet = new Set(ids);
            let edges: Array<string> = [];
            for(let [_, edge] of state.meta.idToEdgeMap) {
                let isFullLink = idsSet.has(edge.sourceId) && idsSet.has(edge.targetId);
                let isWeakLink = idsSet.has(edge.sourceId) || idsSet.has(edge.targetId);
                if(isFullLink || (allowWeakLinks && isWeakLink)) {
                    edges.push(edge.id);
                }
            }
            return edges;
        },

    },
    mutations: {

        // Meta
        setCameraPosition(state, {x, y}) {
            state.session.canvas.cameraX = x;
            state.session.canvas.cameraY = y;
        },

        // Canvas Operations
        createNode(state, node: Types.ICanvasNode) {
            // Assign ID if none set
            if(node.id === -1) {
                node.id = ++state.nodeIdCounter;
            } else {
                state.nodeIdCounter = Math.max(state.nodeIdCounter, node.id);
            }
            if(!state.meta.idToNodeMap.has(node.id)) {
                state.meta.idToNodeMap.set(node.id, node);
                state.session.nodes.push(node);
            }
        },

        createEdge(state, edge: Types.ICanvasEdge) {
            if(!state.meta.idToEdgeMap.has(edge.id)) {
                state.meta.idToEdgeMap.set(edge.id, edge); 
                state.session.edges.push(edge);
            }
        },

        deleteNodes(state, ids: Array<number>) {
            for(let id of ids) {
                state.meta.idToNodeMap.delete(id);
            }
            state.session.nodes = [...state.meta.idToNodeMap.values()]
        },

        deleteEdges(state, ids: Array<string>) {
            for(let id of ids) {
                state.meta.idToEdgeMap.delete(id);
            }
            state.session.edges = [...state.meta.idToEdgeMap.values()];
        },

        duplicateNode(state, id: Number) {

        },

        setNodePosition(state, { id, x0, y0, x1, y1 }: { id: number, x0: number, y0: number, x1: number, y1: number }) {
            let node = state.meta.idToNodeMap.get(id);
            if(node !== undefined) {
                node.x0 = x0;
                node.y0 = y0;
                node.x1 = x1;
                node.y1 = y1;
            }
        },
        setNodeLowerBound(state, { id, x1, y1 }: { id: number, x1: number, y1: number }){
            let node = state.meta.idToNodeMap.get(id);
            if(node !== undefined) {
                node.x1 = x1;
                node.y1 = y1;
            }
        },
        setNodeSubtype(state, { id, value }) {
            let node = state.meta.idToNodeMap.get(id);
            if(node !== undefined) {
                node.subtype = value;
            }
        },
        setNodeField(state, { id, field, value }) {
            let node = state.meta.idToNodeMap.get(id);
            if(node !== undefined) {
                node.payload[field] = value
            }
        },

        // Session
        loadSession(state, session: any) {
            state.session.canvas = session.canvas;
        },
        loadSchema(state, schema) {
            state.schema = schema;
        },

        recalculatePages(state) {
            // Skip if no nodes
            if(state.session.nodes.length === 0)
                return;
            // Compute upper-left bound
            let [x, y] = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
            for(let node of state.session.nodes) {
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
                for(let node of state.session.nodes) {
                    node.x0 -= xOffset;
                    node.y0 -= yOffset;
                    node.x1 -= xOffset;
                    node.y1 -= yOffset;
                }
                // Correct Camera
                state.session.canvas.cameraX -= xOffset;
                state.session.canvas.cameraY -= yOffset;
            }
        }

    }
})

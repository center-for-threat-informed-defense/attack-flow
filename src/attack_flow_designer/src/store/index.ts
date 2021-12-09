import { createStore } from 'vuex'
import { AttackFlowSchema } from './AttackFlowSchema';

export default createStore<Types.DesignerStore>({
    state: {
        session: {
            canvas: {
                cameraX   : 0,
                cameraY   : 0,
                padding   : 0,
                pageSizeX : 0,
                pageSizeY : 0
            },
            nodes: new Map() as Map<string, Types.CanvasNode>,
            edges: new Map() as Map<string, Types.CanvasEdge>,
        },
        schema: {
            nodes: new Map(),
            edges: new Map(),
            lists: new Map()
        } as Types.IAttackFlowSchema,
        nodeIdCounter: 0,
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
                let node: Types.CanvasNode = {
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
                commit("createNode", node);
            }
            commit("recalculatePages");
        },

        createEdge({ commit, state }, { source, targets }: { source: string, targets: Array<string> }) {
            // Get Nodes
            let srcNode = state.session.nodes.get(source);
            if(srcNode != undefined) {
                for(let id of targets) {
                    let trgNode = state.session.nodes.get(id);
                    if(trgNode === undefined)
                        continue;
                    // Create Link
                    let link: Types.CanvasEdge = {
                        id: `${ srcNode.id }.${ trgNode.id }`,
                        sourceId: srcNode.id,
                        targetId: trgNode.id,
                        source: srcNode,
                        target: trgNode,
                        type: null,
                        payload: {}
                    }
                    commit("createEdge", link);
                }
            }
        },

        async duplicateNodes({ commit, dispatch, state }, ids) {
            // Duplicate nodes
            let newNodeMap = new Map<string, Types.CanvasNode>()
            for(let id of ids) {
                let base = state.session.nodes.get(id);
                if(base !== undefined) {
                    let node: Types.CanvasNode = {
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
                    commit("createNode", node);
                }
            }
            // Duplicate dependent edges
            let edges = await dispatch("_getDependantEdges", { ids, includeWeakLinks: false });
            for(let id of edges) {
                let base = state.session.edges.get(id);
                if(base === undefined) continue;
                let source = newNodeMap.get(base!.sourceId);
                let target = newNodeMap.get(base!.targetId);
                if(source === undefined || target === undefined) 
                    continue;
                let edge: Types.CanvasEdge = {
                    id: `${ source.id }.${ target.id }`,
                    sourceId: source.id,
                    targetId: target.id,
                    source, target,
                    type: base.type,
                    payload: { ...base.payload }
                }
                commit("createEdge", edge);
            }
        },

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
            let edges = await dispatch("_getDependantEdges", { 
                ids: nodeIds, includeWeakLinks: true 
            });
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

        setEdgeType({ commit }, args) {
            commit("setEdgeType", args);
        },
        setEdgeField({ commit }, args) {
            commit("setEdgeField", args);
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
            let node = state.session.nodes.get(id);
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
                let source = state.session.nodes.get(edge.sourceId);
                let target = state.session.nodes.get(edge.targetId);
                if(source === undefined || target === undefined)
                    continue;
                let edgeObj: Types.CanvasEdge = { 
                    id: edge.id, 
                    sourceId: edge.sourceId, 
                    targetId: edge.targetId, 
                    source, target, 
                    type: edge.type,
                    payload: edge.payload
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

        _getDependantEdges({ state }, { ids, includeWeakLinks }: { ids: Array<string>, includeWeakLinks: boolean }) {
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

        // Meta
        setCameraPosition(state, {x, y}) {
            state.session.canvas.cameraX = x;
            state.session.canvas.cameraY = y;
        },

        // Canvas Operations
        createNode(state, node: Types.CanvasNode) {
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

        createEdge(state, edge: Types.CanvasEdge) {
            if(!state.session.edges.has(edge.id)) {
                state.session.edges.set(edge.id, edge);
            }
        },

        deleteNodes(state, ids: Array<string>) {
            for(let id of ids) {
                state.session.nodes.delete(id);
            }
        },

        deleteEdges(state, ids: Array<string>) {
            for(let id of ids) {
                state.session.edges.delete(id);
            }
        },

        setEdgeType(state, { id, value }) {
            let edge = state.session.edges.get(id);
            if(edge !== undefined) {
                if(edge.type === value)
                    return;
                // Update edge type
                edge.type = value;
                // Initialize default payload
                edge.payload = {}
                let schema = edge.type ? state.schema.edges.get(edge.type) : undefined;
                if(schema) {
                    for(let [name, field] of schema.fields) {
                       edge.payload[name] = field?.default
                    }
                }
            }
        },
        setEdgeField(state, { id, field, value }) {
            let edge = state.session.edges.get(id);
            if(edge !== undefined) {
                edge.payload[field] = value
            }
        },

        setNodePosition(state, { id, x0, y0, x1, y1 }: { id: string, x0: number, y0: number, x1: number, y1: number }) {
            let node = state.session.nodes.get(id);
            if(node !== undefined) {
                node.x0 = x0;
                node.y0 = y0;
                node.x1 = x1;
                node.y1 = y1;
            }
        },
        setNodeLowerBound(state, { id, x1, y1 }: { id: string, x1: number, y1: number }){
            let node = state.session.nodes.get(id);
            if(node !== undefined) {
                node.x1 = x1;
                node.y1 = y1;
            }
        },
        setNodeSubtype(state, { id, value }) {
            let node = state.session.nodes.get(id);
            if(node !== undefined) {
                node.subtype = value;
            }
        },
        setNodeField(state, { id, field, value }) {
            let node = state.session.nodes.get(id);
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
        }

    }
})

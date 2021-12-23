import { Module } from "vuex"
import { EdgeRule, EdgeSchema, ModuleStore, NodeField, NodeSchema, SchemaStore } from "../StoreTypes";

export default {
    state: {
        nodeSchemas: new Map(),
        edgeSchemas: new Map(),
        listSchemas: new Map(),
        edgeRules: new Map()
    },
    actions: {
        
        /**
         * Loads a Attack Flow schema into the schema store.
         * @param ctx
         *  The Vuex context.
         * @param schema
         *  The schema configuration object.
         */
        async loadSchema({ commit, dispatch }, schema: any) {
            // Clear Maps
            commit("clearSchema");
            // Set namespace
            commit("setNamespace", schema.namespace);
            // Parse Lists
            for(let key in schema.lists) {
                commit("addListSchema", {
                    type: key,
                    list: schema.lists[key]
                });
            }
            // Parse Node Schemas
            for(let key in schema.nodes) {
                commit("addNodeSchema", {
                    type    : key,
                    color   : schema.nodes[key].color,
                    outline : schema.nodes[key].outline,
                    subtype : await dispatch("_parseField", schema.nodes[key].subtype),
                    fields  : await dispatch("_parseFields", schema.nodes[key].fields)
                });
            }
            // Parse Edge Schemas
            for(let key in schema.edges) {
                commit("addEdgeSchema", {
                    type     : key,
                    color    : schema.edges[key].color,
                    outline  : schema.edges[key].outline,
                    hasArrow : schema.edges[key].hasArrow,
                    hasDash : schema.edges[key].hasDash,
                    fields   : await dispatch("_parseFields", schema.edges[key].fields)
                });
            }
            // Parse Edge Rules
            for(let rule of schema.edgeRules) {
                commit("addEdgeRule", rule);
            }
        },

        /**
         * Parses an object of recursively defined fields and flattens them
         * into a single array.
         * @param ctx
         *  The Vuex context.
         * @param fields
         *  The object of fields to parse and flatten.
         * @returns
         *  The list of parsed fields.
         */
        async _parseFields({ dispatch }, fields: any): Promise<Map<string, NodeField>> {
            let list = new Map<string, NodeField>();
            await (async function getFields(fields: any, namespace: string){
                for(let key in fields) {
                    if(fields[key].type.toLocaleLowerCase() === "object") {
                        await getFields(fields[key].object, `${namespace}${key}.`)
                    } else {
                        list.set(`${namespace}${key}`, await dispatch("_parseField", fields[key]));
                    }
                }
            }).apply(this, [fields, ""])
            return list;
        },

        /**
         * Parses an individual field. Links auxillary data
         * (e.g. options for dropdown fields).
         * @param ctx
         *  The Vuex context.
         * @param field
         *  The field to parse.
         * @returns
         *  The parsed field.
         */
        _parseField({ state }, field: any) {
            if(field === null)
                return field;
            switch(field.type.toLocaleLowerCase()) {
                case "dropdown":
                    let options = state.listSchemas.get(field.list);
                    return { ...field, options };
                default:
                    return field;
            }
        },

        /**
         * Resolves the edge type to use between two nodes.
         * @param ctx
         *  The Vuex context.
         * @param edgeParams
         *  [source]
         *   The source node type.
         *  [target]
         *   The target node type.
         * @returns
         *  The type of edge to use between them.
         */
         getEdgeType({ state }, { source, target }: { source: string, target: string }) {
            let { edgeRules: r } = state;
            let srcId = r.has(source) ? source : r.has("*") ? "*" : null;
            if(srcId !== null) {
                let src = r.get(srcId)!;
                let trgId = src.has(target) ? target : src.has("*") ? "*" : null;
                if(trgId !== null) {
                    return src.get(trgId);
                }
            }
            return null;
        }

    },
    mutations: {
        
        /**
         * Clears the current schema from the store.
         * @param state
         *  The Vuex state.
         */
        clearSchema(state) {
            state.listSchemas.clear();
            state.nodeSchemas.clear();
            state.edgeSchemas.clear();
            state.edgeRules.clear();
        },

        /**
         * Adds a list schema to the store.
         * @param state
         *  The Vuex state.
         * @param listSchema
         *  [type]
         *   The list type.
         *  [list]
         *   The list to add.
         */
        addListSchema(state, { type, list }: { type: string, list: any[] }) {
            state.listSchemas.set(type, list);
        },

        /**
         * Adds a node schema to the store.
         * @param state
         *  The Vuex state.
         * @param node
         *  The node schema to add.
         */
        addNodeSchema(state, node: NodeSchema) {
            state.nodeSchemas.set(node.type, node);
        },
        
        /**
         * Adds a edge schema to the store.
         * @param state
         *  The Vuex state.
         * @param edge
         *  The edge schema to add.
         */
        addEdgeSchema(state, edge: EdgeSchema) {
            state.edgeSchemas.set(edge.type, edge);
        },

        /**
         * Adds an edge rule to the store.
         * @param state
         *  The Vuex state.
         * @param edge
         *  The edge rule to add.
         */
        addEdgeRule(state, edge: EdgeRule) {
            let src, trg, typ;
            let { edgeRules: r } = state
            if(!r.has("*") && !(edge.source === "*" && r.size > 0)) {
                if(!r.has(edge.source))
                    r.set(edge.source, new Map());
                let tSrc = r.get(edge.source)!;
                if(!tSrc.has(edge.target) && !tSrc.has("*")) {
                    tSrc.set(edge.target, edge.type);
                    return;
                } else {
                    src = edge.source;
                    trg = tSrc.has(edge.target) ? edge.target : "*";
                    typ = tSrc.get(trg);
                }
            } else {
                src = r.has(edge.source) ? edge.source : [...r.keys()][0];
                [trg, typ] = [...r.get(src)!.entries()][0];
            }
            console.error(`Duplicate edge rule: ['${ 
                edge.source 
            }' > '${ 
                edge.target 
            }'] already maps to type '${ 
                typ
            }' via ['${ 
                src 
            }' > '${ 
                trg 
            }']. Can't map to type '${
                edge.type
            }'.`);
        }

    }
} as Module<SchemaStore, ModuleStore>

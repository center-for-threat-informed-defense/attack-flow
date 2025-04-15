import type { GraphObjectExport } from "./GraphObjectExport";

export type GraphExport = {

    /**
     * The graph's nodes.
     */
    nodes: Map<string, GraphObjectExport>;

    /**
     * The graph's edges.
     */
    edges: Map<string, GraphObjectExport>;

};

export type GraphExport = {

    /**
     * The graph's nodes.
     */
    nodes: GraphObjectExport[]
    
    /**
     * The graph's edges.
     */
    edges: GraphObjectExport[]

}

export type GraphObjectExport = {
    
    /**
     * The object's id.
     */
    id: string

    /**
     * The object's template.
     */
    template: string

    /**
     * The object's semantic data.
     */
    data: any

    /**
     * The object's parents.
     */
    prev: string[]

    /**
     * The object's children.
     */
    next: string[]

}

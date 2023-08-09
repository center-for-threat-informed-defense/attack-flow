import { RootProperty } from "../Property"
import { ObjectTemplate } from "../DiagramFactory"

export type GraphExport = {

    /**
     * The graph's nodes.
     */
    nodes: Map<string, GraphObjectExport>
    
    /**
     * The graph's edges.
     */
    edges: Map<string, GraphObjectExport>

}

export class GraphObjectExport {
    
    /**
     * The object's template.
     */
    public template: ObjectTemplate

    /**
     * The object's properties.
     */
    public props: RootProperty
 
    /**
     * The object's parent link map.
     */
    public prevLinkMap: Map<string, string[]>
 
    /**
     * The object's child link map.
     */
    public nextLinkMap: Map<string, string[]>

    /**
     * The object's parents.
     */
    public get prev(): string[] {
        return [...this.prevLinkMap.values()].flat();
    }

    /**
     * The object's children.
     */
    public get next(): string[] {
        return [...this.nextLinkMap.values()].flat();
    }


    /**
     * Creates a new {@link GraphObjectExport}.
     * @param template
     *  The object's template.
     * @param props
     *  The object's properties.
     * @param nextLinkMap
     *  The object's child link map.
     * @param prevLinkMap
     *  The object's parent link map.
     */
    constructor(
        template: ObjectTemplate,
        props: RootProperty,
        nextLinkMap: Map<string, string[]>,
        prevLinkMap: Map<string, string[]>
    ) {
        this.template = template;
        this.props = props;
        this.nextLinkMap = nextLinkMap;
        this.prevLinkMap = prevLinkMap;
    }

}

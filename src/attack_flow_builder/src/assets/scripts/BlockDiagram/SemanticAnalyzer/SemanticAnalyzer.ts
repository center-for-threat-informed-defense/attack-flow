import { SemanticRole } from "../DiagramFactory";
import { GraphExport, GraphObjectExport } from "./GraphExportTypes";
import { DiagramAnchorableModel, DiagramAnchorModel, DiagramObjectModel } from "../DiagramModelTypes";

export class SemanticAnalyzer {

    /**
     * Derives a graph from a diagram object.
     * @param object
     *  The diagram object.
     * @returns
     *  The graph's edges and nodes.
     */
    public static toGraph(object: DiagramObjectModel): GraphExport {
        let items: Map<string, GraphObjectExport>;
        let edges: Map<string, GraphObjectExport> = new Map();
        let nodes: Map<string, GraphObjectExport> = new Map();
        for(let obj of object.getSubtree()) {
            // Select item map
            switch(obj.getSemanticRole()) {
                case SemanticRole.Node:
                    items = nodes;
                    break;
                case SemanticRole.Edge:
                    items = edges;
                    break;
                default:
                    continue;
            }
            // Resolve prev & next
            let next = this.traverse(obj, Direction.Next) as any;
            for(let [key, value] of next) {
                next.set(key, value.map((o: DiagramObjectModel) => o.id));
            }
            let prev = this.traverse(obj, Direction.Prev) as any;
            for(let [key, value] of prev) {
                prev.set(key, value.map((o: DiagramObjectModel) => o.id));
            }
            // Export object
            items.set(obj.id, new GraphObjectExport(obj.template, obj.props, next, prev));
        }
        return { edges, nodes }
    }

    /**
     * Traverses a diagram object and derives the next set of diagram objects
     * as if it were a graph. The object must be a
     * {@link SemanticRole.Node Node} or an {@link SemanticRole.Edge Edge}.
     * @param object
     *  The diagram object.
     * @returns
     *  The next set of diagram objects.
     */
    public static getNextGraphLinks(object: DiagramObjectModel): DiagramObjectModel[] {
        return [...this.traverse(object, Direction.Next).values()].flat();
    }

    /**
     * Traverses a diagram object and derives the previous set of diagram
     * objects as if it were a graph. The object must be a
     * {@link SemanticRole.Node Node} or an {@link SemanticRole.Edge Edge}.
     * @param object
     *  The diagram object.
     * @returns
     *  The previous set of diagram objects.
     */
    public static getPrevGraphLinks(object: DiagramObjectModel): DiagramObjectModel[] {
        return [...this.traverse(object, Direction.Prev).values()].flat();
    }

    /**
     * Traverses a {@link DiagramObjectModel} and derives the next set of
     * diagram objects as if it were a graph.
     * @param object
     *  The diagram object.
     * @param direction
     *  The traversal direction.
     * @returns
     *  The link map.
     */
    private static traverse(
        object: DiagramObjectModel,
        direction: Direction
    ): Map<string, DiagramObjectModel[]> {
        let map = new Map<string, DiagramObjectModel[]>();
        if(
            !object.hasRole(SemanticRole.Edge) &&
            !object.hasRole(SemanticRole.Node)
        ) {
            return map;
        }
        let stack = [...object.children];
        while(stack.length) {
            let obj = stack.pop()!;
            // Anchor object
            if(obj instanceof DiagramAnchorModel) {
                for(let child of obj.children) {
                    this.registerLink(
                        obj.template.id,
                        this.traverseAnchorable(child, obj, direction),
                        map
                    )
                }
                continue;
            }
            // Anchorable object
            if(obj instanceof DiagramAnchorableModel) {
                this.registerLink(
                    obj.anchor?.template.id ?? "undefined",
                    this.traverseAnchorable(obj, obj.parent!, direction),
                    map
                )
                continue;
            }
            // Node or Edge object
            if(
                obj.hasRole(SemanticRole.Node) ||
                obj.hasRole(SemanticRole.Edge)
            ) {
                continue;
            }
            // General object
            for(let child of obj.children) {
                stack.push(child);
            }
        }
        return map;
    }

    /**
     * Registers a link with a link map.
     * @param via 
     *  The route the link is connected through.
     * @param obj
     *  The linked object.
     * @param map
     *  The link map.
     */
    public static registerLink(
        via: string,
        obj: DiagramObjectModel | undefined,
        map: Map<string, DiagramObjectModel[]>
    ) {
        if(!obj) return;
        if(!map.has(via)) {
            map.set(via, []);
        }
        map.get(via)!.push(obj);
    }

    
    /**
     * Traverses a {@link DiagramAnchorableModel} and derives the next diagram
     * object as if it were a graph.
     * @param object 
     *  The {@link DiagramAnchorableModel}.
     * @param source
     *  The object the {@link DiagramAnchorableModel} was accessed from.
     * @param direction
     *  The traversal direction.
     * @returns
     *  The next diagram object, if there was one.
     */
    public static traverseAnchorable(
        object: DiagramAnchorableModel,
        source: DiagramObjectModel,
        direction: Direction
    ): DiagramObjectModel | undefined {
        let r1, r2;
        switch(direction) {
            case Direction.Next:
                r1 = SemanticRole.LinkSource;
                r2 = SemanticRole.LinkTarget;
                break;
            case Direction.Prev:
                r1 = SemanticRole.LinkTarget;
                r2 = SemanticRole.LinkSource;
                break;
        }
        let p;
        if(object.anchor === source && object.hasRole(r1)) {
            p = object.parent;

        }
        if(object.parent === source && object.hasRole(r2)) {
            p = object.anchor;
        }
        while(p) {
            if(
                p.hasRole(SemanticRole.Node) || 
                p.hasRole(SemanticRole.Edge)
            ) {
                break;
            }
            p = p.parent;
        }
        return p;
    }

}


///////////////////////////////////////////////////////////////////////////////
//  Internal Types  ///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


enum Direction {
    Next = 0,
    Prev = 1
}

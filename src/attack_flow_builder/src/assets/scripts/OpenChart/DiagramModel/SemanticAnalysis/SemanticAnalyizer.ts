import { SemanticRole } from "./SemanticRole";
import { GraphObjectExport } from "./GraphObjectExport";
import type { GraphExport } from "./GraphExport";
import { Direction } from "./Direction";
import { Anchor, Latch, type DiagramObject, type Handle } from "../DiagramObject";

export class SemanticAnalyzer {

    /**
     * Derives a graph from a diagram object.
     * @param object
     *  The diagram object.
     * @returns
     *  The graph's edges and nodes.
     */
    public static toGraph(object: DiagramObject): GraphExport {
        let items: Map<string, GraphObjectExport>;
        const edges: Map<string, GraphObjectExport> = new Map();
        const nodes: Map<string, GraphObjectExport> = new Map();
        for (const obj of object.getSubtree()) {
            // Select item map
            switch (obj.getSemanticRole()) {
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
            const next = new Map([...this.traverse(obj, Direction.Next)]
                .map(n => [n[0], n[1].map(o => o.id)]));
            const prev = new Map([...this.traverse(obj, Direction.Prev)]
                .map(p => [p[0], p[1].map(o => o.id)]));
            // Export object
            items.set(obj.id, new GraphObjectExport(obj.template, obj.props, next, prev));
        }
        return { edges, nodes };
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
    public static getNextGraphLinks(object: DiagramObject): DiagramObject[] {
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
    public static getPrevGraphLinks(object: DiagramObject): DiagramObject[] {
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
        object: DiagramObject,
        direction: Direction
    ): Map<string, DiagramObject[]> {
        const map = new Map<string, DiagramObject[]>();
        if (
            !object.hasRole(SemanticRole.Edge) &&
            !object.hasRole(SemanticRole.Node)
        ) {
            return map;
        }
        const stack = [...object.children];
        while (stack.length) {
            const obj = stack.pop()!;
            // Anchor object
            if (obj instanceof Anchor) {
                for (const child of obj.children) {
                    this.registerLink(
                        obj.template.id,
                        this.traverseAnchorable(child, obj, direction),
                        map
                    );
                }
                continue;
            }
            // Latch object
            if (obj instanceof Latch) {
                this.registerLink(
                    obj.anchor?.template.id ?? "undefined",
                    this.traverseAnchorable(obj, obj.parent!, direction),
                    map
                );
                continue;
            }
            // Node or Edge object
            if (
                obj.hasRole(SemanticRole.Node) ||
                obj.hasRole(SemanticRole.Edge)
            ) {
                continue;
            }
            // General object
            for (const child of obj.children) {
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
        obj: DiagramObject | undefined,
        map: Map<string, DiagramObject[]>
    ) {
        if (!obj) {
            return;
        }
        if (!map.has(via)) {
            map.set(via, []);
        }
        map.get(via)!.push(obj);
    }


    /**
     * Traverses a {@link Latch} and derives the next diagram object as if it
     * were a graph.
     * @param object
     *  The {@link Latch}.
     * @param source
     *  The object the {@link Latch} was accessed from.
     * @param direction
     *  The traversal direction.
     * @returns
     *  The next diagram object, if there is one.
     */
    public static traverseLatch(
        object: Latch,
        source: DiagramObject,
        direction: Direction
    ): DiagramObject | undefined {
        let r1, r2;
        switch (direction) {
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
        if (object.anchor === source && object.hasRole(r1)) {
            p = object.parent;

        }
        if (object.parent === source && object.hasRole(r2)) {
            p = object.anchor;
        }
        while (p) {
            if (
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

import { SemanticRole } from "../DiagramFactory";
import { GraphExport, GraphObjectExport } from "./GraphExportTypes";
import { DiagramAnchorableModel, DiagramObjectModel } from "../DiagramModelTypes";

export class SemanticAnalyzer {

    /**
     * Derives a graph from a diagram object.
     * @param object
     *  The diagram object.
     * @returns
     *  The graph's edges and nodes.
     */
    public static toGraph(object: DiagramObjectModel): GraphExport {
        let array: GraphObjectExport[];
        let edges: GraphObjectExport[] = [];
        let nodes: GraphObjectExport[] = [];
        for(let obj of object.getSubtree()) {    
            // Pick array
            switch(obj.getSemanticRole()) {
                case SemanticRole.Node:
                    array = nodes;
                    break;
                case SemanticRole.Edge:
                    array = edges;
                    break;
                default:
                    continue;
            }
            // Export object
            array.push({
                id: obj.id,
                template: obj.template,
                data: obj.props,
                prev: this.getPrevGraphLinks(obj).map(o => o.id),
                next: this.getNextGraphLinks(obj).map(o => o.id)
            });
            
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
        switch(object.getSemanticRole()) {
            case SemanticRole.Edge:
                return this.getNodes(this.getEdgeTargetsFor(object));
            case SemanticRole.Node:
                return this.getEdges(this.getEdgeSourcesFor(object));
            default:
                return [];
        }
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
        switch(object.getSemanticRole()) {
            case SemanticRole.Edge:
                return this.getNodes(this.getEdgeSourcesFor(object));
            case SemanticRole.Node:
                return this.getEdges(this.getEdgeTargetsFor(object));
            default:
                return [];
        }
    }

    /**
     * Resolves all {@link SemanticRole.Node Node} objects from a list of
     * {@link SemanticRole.EdgeSource EdgeSource} or 
     * {@link SemanticRole.EdgeTarget EdgeTarget} objects.
     * @param objects
     *  The diagram objects.
     * @returns
     *  The semantic nodes.
     */
    private static getNodes(objects: DiagramObjectModel[]): DiagramObjectModel[] {
        let nodes = [];
        for(let obj of objects) {
            let node = this.getNode(obj);
            if(node) {
                nodes.push(node);
            }
        }
        return nodes;
    }

    /**
     * Resolves the {@link SemanticRole.Node Node} of a
     * {@link SemanticRole.EdgeSource EdgeSource} or
     * {@link SemanticRole.EdgeTarget EdgeTarget} object.
     * @param object
     *  The diagram object.
     * @returns
     *  The semantic node, `undefined` if there wasn't one.
     */
    private static getNode(object: DiagramObjectModel): DiagramObjectModel | undefined {
        if(
            !(object instanceof DiagramAnchorableModel) ||
            (
                !object.hasRole(SemanticRole.EdgeSource) &&
                !object.hasRole(SemanticRole.EdgeTarget)
            )
        ) {
            return undefined;
        }
        // Traverse anchor chain looking for a node
        let p: DiagramObjectModel | undefined = object.anchor;
        while(p) {
            if(p.hasRole(SemanticRole.Node)) {
                return p;
            }
            p = p.parent;
        }
    }

    /**
     * Resolves all {@link SemanticRole.Edge Edge} objects from a list of
     * {@link SemanticRole.EdgeSource EdgeSource} or 
     * {@link SemanticRole.EdgeTarget EdgeTarget} objects.
     * @param objects
     *  The diagram objects.
     * @returns
     *  The semantic edges.
     */
    private static getEdges(objects: DiagramObjectModel[]): DiagramObjectModel[] {
        let edges = [];
        for(let obj of objects) {
            let edge = this.getEdge(obj);
            if(edge) {
                edges.push(edge);
            }
        }
        return edges;
    }

    /**
     * Resolves the {@link SemanticRole.Edge Edge} of a
     * {@link SemanticRole.EdgeSource EdgeSource} or
     * {@link SemanticRole.EdgeTarget EdgeTarget} object.
     * @param object
     *  The diagram object.
     * @returns
     *  The semantic edge, `undefined` if there wasn't one.
     */
    private static getEdge(object: DiagramObjectModel): DiagramObjectModel | undefined {
        if(
            !object.hasRole(SemanticRole.EdgeSource) && 
            !object.hasRole(SemanticRole.EdgeTarget)
        ) {
            return undefined;
        }
        // Traverse parent chain looking for an edge
        let p: DiagramObjectModel | undefined = object.parent;
        while(p) {
            if(p.hasRole(SemanticRole.Edge)) {
                return p;
            }
            p = p.parent;
        }
        return undefined;
    }

    /**
     * Resolves all {@link SemanticRole.EdgeSource EdgeSource} objects from a
     * list of {@link SemanticRole.Edge Edge} or {@link SemanticRole.Node Node}
     * objects.
     * @param objects
     *  The diagram objects.
     * @returns
     *  The semantic edge sources.
     */
    private static getEdgeSources(objects: DiagramObjectModel[]): DiagramObjectModel[] {
        let edgeSources: DiagramObjectModel[] = []
        for(let obj of objects) {
            edgeSources = edgeSources.concat(this.getEdgeSourcesFor(obj));
        }
        return edgeSources;
    }

    /**
     * Resolves all {@link SemanticRole.EdgeSource EdgeSource} objects from an 
     * {@link SemanticRole.Edge Edge} or {@link SemanticRole.Node Node} object.
     * @param object
     *  The diagram object.
     * @returns
     *  The semantic edge sources.
     */
    private static getEdgeSourcesFor(object: DiagramObjectModel): DiagramObjectModel[] {
        if(
            !object.hasRole(SemanticRole.Edge) &&
            !object.hasRole(SemanticRole.Node)
        ) {
            return [];
        }
        let stack = [object];
        let sources = [];
        while(stack.length) {
            let obj = stack.pop()!;
            if(obj.hasRole(SemanticRole.EdgeSource)) {
                sources.push(obj);
                continue;
            }
            for(let child of obj.children) {
                stack.push(child);
            }
        }
        return sources;
    }

    /**
     * Resolves all {@link SemanticRole.EdgeTarget EdgeTarget} objects from a
     * list of {@link SemanticRole.Edge Edge} or {@link SemanticRole.Node Node}
     * objects.
     * @param objects
     *  The diagram objects.
     * @returns
     *  The semantic edge targets.
     */
    private static getEdgeTargets(objects: DiagramObjectModel[]): DiagramObjectModel[] {
        let edgeTargets: DiagramObjectModel[] = []
        for(let obj of objects) {
            edgeTargets = edgeTargets.concat(this.getEdgeTargetsFor(obj));
        }
        return edgeTargets;
    }

    /**
     * Resolves all {@link SemanticRole.EdgeTarget EdgeTarget} objects from an 
     * {@link SemanticRole.Edge Edge} or {@link SemanticRole.Node Node} object.
     * @param object
     *  The diagram object.
     * @returns
     *  The semantic edge targets.
     */
    private static getEdgeTargetsFor(object: DiagramObjectModel): DiagramObjectModel[] {
        if(
            !object.hasRole(SemanticRole.Edge) &&
            !object.hasRole(SemanticRole.Node)
        ) {
            return [];
        }
        let stack = [object];
        let targets = [];
        while(stack.length) {
            let obj = stack.pop()!;
            if(obj.hasRole(SemanticRole.EdgeTarget)) {
                targets.push(obj);
                continue;
            }
            for(let child of obj.children) {
                stack.push(child);
            }
        }
        return targets;
    }

}

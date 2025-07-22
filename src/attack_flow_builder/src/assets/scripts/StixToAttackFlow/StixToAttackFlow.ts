import { StixToTemplate } from "./StixToTemplate";
import { populateProperties } from "./PopulateBlockProperties";
import { GraphEdge, GraphNode } from "../SegmentLayoutEngine";
import { DiagramObjectSerializer } from "@OpenChart/DiagramModel";
import { resolveEmbeddedRelationships } from "./ResolveEmbeddedRelationships";
import { Canvas, Block, DiagramObject, Line } from "../OpenChart/DiagramModel/DiagramObject";
import type { Constructor } from "@OpenChart/Utilities";
import type { DiagramViewExport } from "@OpenChart/DiagramView";
import type { StixBundle, StixObject } from "./StixTypes";
import type { DiagramModelExport, DiagramObjectFactory } from "@OpenChart/DiagramModel";

export class StixToAttackFlowConverter {

    /**
     * The diagram factory to use.
     */
    private factory: DiagramObjectFactory;


    /**
     * Creates a new {@link StixToAttackFlowConverter}.
     * @remarks
     *  `factory` MUST be configured with the Attack Flow schema.
     * @param factory
     *  The diagram factory to use.
     */
    constructor(factory: DiagramObjectFactory) {
        this.factory = factory;
    }


    /**
     * Converts a STIX bundle to a {@link DiagramViewExport}.
     * @param bundle
     *  The STIX bundle to convert.
     * @returns
     *  The converted Attack Flow diagram.
     */
    public convert(stix: StixBundle): DiagramModelExport {
        // Create canvas
        const canvas = this.factory.createNewDiagramObject(this.factory.canvas, Canvas);
        // Create graph of diagram objects from STIX
        const [nodes, edges] = this.parseStixGraph(stix);
        // Mirror graph structure onto nodes
        // this.mirrorConnections(nodes);

        // Randomize node positions

        for (const o of nodes) {
            // const x = Math.floor(Math.random() * 10000);
            // const y = Math.floor(Math.random() * 10000);
            // o.object.moveTo(x, y);
        }


        // Add objects to canvas
        for (const o of [...nodes, ...edges]) {
            canvas.addObject(o.object);
        }
        // Prepare export
        return {
            schema  : this.factory.id,
            objects : DiagramObjectSerializer.exportObjects([canvas])
            // layout  : ManualLayoutEngine.generatePositionMap([canvas])
        };
    }


    ////////////////////////////////////////////////////////////////////////////
    //  1. Graph Construction  /////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////


    /**
     * Converts a STIX bundle to an abstract graph of diagram {@link Block}s and
     * {@link Lines}.
     * @param bundle
     *  The STIX bundle.
     * @returns
     *  The graph's nodes and edges.
     */
    private parseStixGraph(bundle: StixBundle): [GraphNode[], GraphEdge[]] {
        // Generate node map
        const nodes = new Map<string, GraphNode>();
        const edges = [];
        for (const obj of bundle.objects) {
            switch (obj.type) {
                case "relationship":
                case "sighting":
                    continue;
                default:
                    const object = this.translateStix(obj, Block);
                    if (object) {
                        nodes.set(obj.id, new GraphNode(object));
                    }
            }
        }
        // Generate relationship edges
        for (const rel of bundle.objects) {
            switch (rel.type) {
                case "relationship":
                    const object = this.translateStix(rel, Line);
                    if (object) {
                        const edge = new GraphEdge(object);
                        nodes.get(rel.source_ref)?.addOutEdge(edge);
                        nodes.get(rel.target_ref)?.addInEdge(edge);
                        edges.push(edge);
                    }
                case "sighting":
                default:
                    continue;
            }
        }
        // Generate embedded relationship edges
        for (const srcObj of bundle.objects) {
            // Skip relationships
            switch (srcObj.type) {
                case "relationship":
                case "sighting":
                    continue;
            }
            // Process objects
            const objectIds = resolveEmbeddedRelationships(srcObj);
            for (const dstObj of objectIds) {
                const line = this.factory.createNewDiagramObject("dynamic_line", Line);
                const edge = new GraphEdge(line);
                nodes.get(srcObj.id)?.addOutEdge(edge);
                nodes.get(dstObj)?.addInEdge(edge);
                edges.push(edge);
            }
        }
        return [[...nodes.values()], edges];
    }

    /**
     * Translates a {@link StixObject} to a {@link DiagramObject}.
     * @param stix
     *  The {@link StixObject}.
     * @param type
     *  The expected {@link DiagramObject} sub-type.
     *  (Default: `DiagramObject`)
     * @returns
     *  The translate {@link DiagramObject}.
     */
    private translateStix<T extends DiagramObject>(stix: StixObject, type?: Constructor<T>): T | null {
        // Resolve template
        const template = StixToTemplate[stix.type];
        if (template === null) {
            return null;
        }
        // Create object
        const object = this.factory.createNewDiagramObject(template, type);
        // Set properties
        populateProperties(stix, object.properties);
        // Return
        return object;
    }


    ////////////////////////////////////////////////////////////////////////////
    //  2. Mirror Connections  /////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////


    // /**
    //  * Mirrors a graph's structure onto the underlying {@link DiagramObject}s.
    //  * @param nodes
    //  *  The graph's nodes.
    //  */
    // private mirrorConnections(nodes: GraphNode[]) {
    //     const visitedEdges = new Set();
    //     const unvisitedNodes = new Map(nodes.map(o => [o.id, o]));
    //     while(unvisitedNodes.size) {
    //         // Select node with smallest in-degree
    //         const root = [...unvisitedNodes.values()].reduce(
    //             (a,b) => b.inDegree < a.inDegree ? b : a
    //         );
    //         // Traverse graph
    //         const queue = [root];
    //         unvisitedNodes.delete(root.id);
    //         while(queue.length) {
    //             const node = queue.shift()!;
    //             // Traverse forward
    //             for(const edge of node.next) {
    //                 if(!edge.target || visitedEdges.has(edge.id)) {
    //                     continue;
    //                 }
    //                 visitedEdges.add(edge.id);
    //                 // Link nodes
    //                 this.connectBlocks(
    //                     node.object,
    //                     edge.target.object,
    //                     edge.object
    //                 );
    //                 // Traverse
    //                 if(unvisitedNodes.has(edge.target.id)) {
    //                     unvisitedNodes.delete(edge.target.id);
    //                     queue.push(edge.target);
    //                 }
    //             }
    //             // Traverse backward
    //             for(const edge of node.prev) {
    //                 if(!edge.source || visitedEdges.has(edge.id)) {
    //                     continue;
    //                 }
    //                 visitedEdges.add(edge.id);
    //                 // Link nodes
    //                 this.connectBlocks(
    //                     edge.source.object,
    //                     node.object,
    //                     edge.object
    //                 );
    //                 if(unvisitedNodes.has(edge.source.id)) {
    //                     // Traverse
    //                     unvisitedNodes.delete(edge.source.id);
    //                     queue.push(edge.source);
    //                 }

    //             }
    //         }
    //     }
    // }

    // /**
    //  * Connects a parent and child block with a line.
    //  * @param parent
    //  *  The parent block.
    //  * @param child
    //  *  The child block.
    //  * @param line
    //  *  The line.
    //  */
    // private connectBlocks(parent: Block, child: Block, line: Line) {
    //     parent.anchors.get(AnchorPosition.D270)?.link(line.source);
    //     child.anchors.get(AnchorPosition.D90)?.link(line.target);
    // }


}


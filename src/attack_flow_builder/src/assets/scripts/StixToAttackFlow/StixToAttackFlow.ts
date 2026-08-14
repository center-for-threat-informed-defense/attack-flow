import { StixToTemplate } from "./StixToTemplate";
import { populateProperties } from "./PopulateBlockProperties";
import { GraphEdge, GraphNode } from "../SegmentLayoutEngine";
import { DiagramObjectSerializer } from "@OpenChart/DiagramModel";
import { resolveEmbeddedRelationships } from "./ResolveEmbeddedRelationships";
import { Canvas, Block, DiagramObject, Line } from "../OpenChart/DiagramModel/DiagramObject";
import type { Constructor } from "@OpenChart/Utilities";
import type { StixBundle, StixObject, StixObjectType } from "./StixTypes";
import type { DiagramModelExport, DiagramObjectFactory } from "@OpenChart/DiagramModel";
import { AnchorPosition } from "../OpenChart/DiagramView";

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
        // Populate root (canvas) properties from the STIX attack-flow and its referenced author
        this.populateRootFromBundle(stix, canvas);
        // Create graph of diagram objects from STIX
        const [nodes, edges, nodes_to_stix] = this.parseStixGraph(stix);
        // Mirror graph structure onto nodes
        this.mirrorConnections(nodes, nodes_to_stix);

        // Add objects to canvas
        for (const o of [...nodes, ...edges]) {
            canvas.addObject(o.object);
        }
        // Prepare export
        return {
            schema  : this.factory.id,
            objects : DiagramObjectSerializer.exportObjects([canvas])
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
     *  The graph's nodes and edges, as well as a map from nodes to stix objects.
     */
    private parseStixGraph(bundle: StixBundle): [GraphNode[], GraphEdge[], Map<string, StixObject>] {
        // Generate node map
        const nodes = new Map<string, GraphNode>();
        const edges = [];
        const graph_nodes_to_stix_objects = new Map<string, StixObject>();
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
            const srcBlock = nodes.get(srcObj.id);
            if (srcBlock) {
                graph_nodes_to_stix_objects.set(srcBlock.id, srcObj);
            }

            // Skip relationships
            switch (srcObj.type as StixObjectType) {
                case "relationship":
                case "sighting":
                case "attack-flow":
                case "extension-definition":
                case "language-content":
                case "marking-definition":
                    continue;
            }
            // Process objects
            const objectIds = resolveEmbeddedRelationships(srcObj);
            for (const dstObj of objectIds) {
                if (dstObj == srcObj.id) {
                    // Skip relationships from nodes to themselves.
                    continue;
                }
                const line = this.factory.createNewDiagramObject("dynamic_line", Line);
                const edge = new GraphEdge(line);
                nodes.get(srcObj.id)?.addOutEdge(edge);
                nodes.get(dstObj)?.addInEdge(edge);
                edges.push(edge);
            }
        }



        return [[...nodes.values()], edges, graph_nodes_to_stix_objects];
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
        const template = this.resolveTemplate(stix);
        if (template === null) {
            return null;
        }

        // Normalize custom STIX objects before property population
        const normalizedStix = this.normalizeStixObject(stix);

        // Create object
        const object = this.factory.createNewDiagramObject(template, type);

        // Set properties
        populateProperties(normalizedStix, object.properties);

        // Return
        return object;
    }

    /**
     * Resolves the internal template name for a STIX object.
     * Supports built-in Attack Flow mappings and custom x-* objects.
     * @param stix
     *  The STIX object.
     * @returns
     *  The template name, or null if the object should not be imported.
     */
    private resolveTemplate(stix: StixObject): string | null {
        const type = stix.type as string;
        switch (type) {
            case "x-detection":
                return "detection";
            case "x-mitigation":
                return "mitigation";
            case "attack-operator":
                const op = (stix as { operator?: string }).operator;
                if (op == "AND") {
                    return "AND_operator";
                } else if (op == "OR") {
                    return "OR_operator";
                } else {
                    return null;
                }
            default:
                return StixToTemplate[type as keyof typeof StixToTemplate];
        }
    }

    /**
     * Normalizes imported STIX objects for property population.
     *
     * Custom STIX object properties are exported with x_-prefixed keys, so we
     * strip that prefix during import in order to match the diagram schema.
     *
     * @param stix
     *  The STIX object to normalize.
     * @returns
     *  A normalized STIX-like object suitable for populateProperties().
     */
    private normalizeStixObject(stix: StixObject): StixObject {
        const type = stix.type as string;
        switch (type) {
            case "x-detection":
                return this.denormalizeCustomObject(stix, "detection") as StixObject;
            case "x-mitigation":
                return this.denormalizeCustomObject(stix, "mitigation") as StixObject;
            default:
                return stix;
        }
    }

    /**
     * Recursively converts a custom STIX object into a property shape expected by
     * the diagram schema:
     *   - type is rewritten from x-foo to foo
     *   - x_bar keys are rewritten to bar
     *
     * @param value
     *  The value to normalize.
     * @param rootType
     *  Optional replacement for the top-level type.
     * @returns
     *  The normalized value.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private denormalizeCustomObject(value: any, rootType?: string): any {
        if (Array.isArray(value)) {
            return value.map(v => this.denormalizeCustomObject(v));
        }

        if (value && typeof value === "object") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result: any = {};

            for (const [key, child] of Object.entries(value)) {
                let nextKey = key;

                if (key === "type" && rootType) {
                    nextKey = "type";
                    result[nextKey] = rootType;
                    continue;
                }

                if (key.startsWith("x_")) {
                    nextKey = key.slice(2);
                }

                result[nextKey] = this.denormalizeCustomObject(child);
            }

            return result;
        }

        return value;
    }

    /**
     * Populate the root canvas properties from a STIX bundle by reading the attack-flow SDO
     * and its referenced author identity.
     * @param bundle The STIX bundle
     * @param canvas The canvas object whose properties should be populated
     */
    private populateRootFromBundle(bundle: StixBundle, canvas: Canvas): void {
        // Find the attack-flow SDO in the bundle
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const flow = bundle.objects.find((o: any) => o && o.type === "attack-flow") as any | undefined;
        if (!flow) {
            return; // nothing to populate; keep defaults
        }

        // Build a plain object that matches the canvas schema keys
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const root: any = { type: "attack-flow" };

        const keys = [
            "name",
            "description",
            "scope",
            "classification",
            "ttp_frameworks",
            "external_references",
            "created"
        ];
        for (const k of keys) {
            if (flow[k] !== undefined) {
                root[k] = flow[k];
            }
        }

        // Resolve author from created_by_ref (identity SDO)
        if (flow.created_by_ref) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const author = bundle.objects.find((o: any) => o && o.id === flow.created_by_ref && o.type === "identity") as any | undefined;
            if (author) {
                root.author = {
                    name: author.name,
                    identity_class: author.identity_class ?? "unknown",
                    contact_information: author.contact_information
                };
            }
        }

        // Populate onto the canvas using the existing property population utility
        populateProperties(root as unknown as StixObject, canvas.properties);
    }


    ////////////////////////////////////////////////////////////////////////////
    //  2. Mirror Connections  /////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////


    /**
     * Mirrors a graph's structure onto the underlying {@link DiagramObject}s.
     * @param nodes
     *  The graph's nodes.
     * @param nodes_to_stix
     * A map of graph nodes to their STIX objects.
     */
    private mirrorConnections(nodes: GraphNode[], nodes_to_stix: Map<string, StixObject>) {
        const visitedEdges = new Set();
        const unvisitedNodes = new Map(nodes.map(o => [o.id, o]));
        while (unvisitedNodes.size) {
            // Select node with smallest in-degree
            const root = [...unvisitedNodes.values()].reduce(
                (a, b) => b.inDegree < a.inDegree ? b : a
            );
            // Traverse graph
            const queue = [root];
            unvisitedNodes.delete(root.id);
            while (queue.length) {
                const node = queue.shift()!;
                // Traverse forward
                for (const edge of node.next) {
                    if (!edge.target || visitedEdges.has(edge.id)) {
                        continue;
                    }
                    visitedEdges.add(edge.id);
                    // Link nodes
                    this.connectBlocks(
                        node.object,
                        edge.target.object,
                        edge.object,
                        nodes_to_stix.get(node.id),
                        nodes_to_stix.get(edge.target.id)
                    );
                    // Traverse
                    if (unvisitedNodes.has(edge.target.id)) {
                        unvisitedNodes.delete(edge.target.id);
                        queue.push(edge.target);
                    }
                }
                // Traverse backward
                for (const edge of node.prev) {
                    if (!edge.source || visitedEdges.has(edge.id)) {
                        continue;
                    }
                    visitedEdges.add(edge.id);
                    // Link nodes
                    this.connectBlocks(
                        edge.source.object,
                        node.object,
                        edge.object,
                        nodes_to_stix.get(edge.source.id),
                        nodes_to_stix.get(node.id)
                    );
                    if (unvisitedNodes.has(edge.source.id)) {
                        // Traverse
                        unvisitedNodes.delete(edge.source.id);
                        queue.push(edge.source);
                    }

                }
            }
        }
    }

    /**
     * Connects a parent and child block with a line.
     * @param parent
     *  The parent block.
     * @param child
     *  The child block.
     * @param line
     *  The line.
     * @param parent_stix
     * The STIX object representation of the parent block.
     */
    private connectBlocks(parent: Block, child: Block, line: Line, parent_stix: StixObject | undefined, child_stix: StixObject | undefined) {
        // Do a simple south-north connection so the auto-layout engine can discern parent-child relationships.
        let parent_anchor = parent.anchors.get(AnchorPosition.D270);
        const child_anchor = child.anchors.get(AnchorPosition.D90);

        // Conditions use their semantic branch anchors only when STIX
        // identifies the relationship as true or false. Keep unclassified
        // relationships on a neutral side anchor rather than assuming a branch.
        if (parent.id === "condition") {
            parent_anchor = parent.anchors.get(AnchorPosition.D180);
            if (parent_stix && child_stix) {
                const true_refs : Array<string> | undefined = "on_true_refs" in parent_stix ? parent_stix.on_true_refs : undefined;
                const false_refs : Array<string> | undefined = "on_false_refs" in parent_stix ? parent_stix.on_false_refs : undefined;
                if (Array.isArray(true_refs) && true_refs.includes(child_stix.id)) {
                    parent_anchor = parent.anchors.get("branch:True");
                } else if (Array.isArray(false_refs) && false_refs.includes(child_stix.id)) {
                    parent_anchor = parent.anchors.get("branch:False");
                }
            }
        }

        parent_anchor?.link(line.source);
        child_anchor?.link(line.target);

    }


}

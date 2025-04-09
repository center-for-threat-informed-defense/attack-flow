import { Canvas, Block, Line,  } from "../OpenChart/DiagramModel/DiagramObject";
import { type DiagramObjectFactory } from "../OpenChart/DiagramModel/DiagramObjectFactory";

/**
 * STIX object interface representing a single STIX entity.
 */
interface StixObject {
    /**
     * The type of the STIX object.
     */
    type: string;
    /**
     * The unique identifier of the STIX object.
     */
    id: string;
    /**
     * The source reference for relationship objects.
     */
    source_ref?: string;
    /**
     * The target reference for relationship objects.
     */
    target_ref?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

/**
 * STIX bundle interface representing a collection of STIX objects.
 */
export interface StixBundle {
    /**
     * The type of the STIX bundle.
     */
    type: string;
    /**
     * The collection of STIX objects in the bundle.
     */
    objects: StixObject[];
    /**
     * The unique identifier of the STIX bundle.
     */
    id: string;
}

/**
 * Graph edge interface representing a connection between two nodes.
 */
interface GraphEdge {
    /**
     * The source node identifier.
     */
    source: string;
    /**
     * The target node identifier.
     */
    target: string;
}

/**
 * Class for converting STIX objects to a flow diagram representation.
 */
export class StixToFlow {
    /**
     * Creates block objects from STIX objects.
     * @param stixObjects - The collection of STIX objects to convert.
     * @param factory - The diagram object factory to create blocks.
     * @param canvas - The canvas to add the blocks to.
     * @returns A map of STIX object IDs to their corresponding block objects.
     */
    private static createBlocks(
        stixObjects: StixObject[],
        factory: DiagramObjectFactory,
        canvas: Canvas
    ): Map<string, Block> {
        const objectMap = new Map<string, Block>();
        stixObjects.forEach((stixObject) => {
            if (stixObject.type === "relationship") { return; }

            const block = factory.createNewDiagramObject(
                stixObject.type.replace("-", "_"),
                Block
            );
            for (const key of block.properties.value.keys()) {
                if (key in stixObject) {
                    if (block.properties.value.get(key)!._value !== undefined) {
                        block.properties.value.get(key)!._value = stixObject[key];
                    }
                }
            }
            canvas.addObject(block);
            objectMap.set(stixObject.id, block);
        });
        return objectMap;
    }

    /**
     * Builds a graph structure from STIX objects.
     * @param stixObjects - The collection of STIX objects to build the graph from.
     * @returns An object containing the graph's edges, adjacency list, and in-degree counts.
     */
    private static buildGraph(stixObjects: StixObject[]): {
        edges: GraphEdge[];
        adjacencyList: Record<string, string[]>;
        inDegree: Record<string, number>;
    } {
        const edges: GraphEdge[] = [];
        const adjacencyList: Record<string, string[]> = {};
        const inDegree: Record<string, number> = {};

        stixObjects.forEach((stixObject) => {
            if (stixObject.type !== "relationship" || !stixObject.source_ref || !stixObject.target_ref) { return; }

            edges.push({
                source: stixObject.source_ref,
                target: stixObject.target_ref
            });

            adjacencyList[stixObject.source_ref] = adjacencyList[stixObject.source_ref] || [];
            adjacencyList[stixObject.source_ref].push(stixObject.target_ref);

            inDegree[stixObject.target_ref] = (inDegree[stixObject.target_ref] || 0) + 1;
        });

        return { edges, adjacencyList, inDegree };
    }

    /**
     * Finds the root nodes in the graph.
     * @param stixObjects - The collection of STIX objects.
     * @param adjacencyList - The graph's adjacency list.
     * @param inDegree - The graph's in-degree counts.
     * @returns An array of root node identifiers.
     */
    private static findRootNodes(
        stixObjects: StixObject[],
        adjacencyList: Record<string, string[]>,
        inDegree: Record<string, number>
    ): string[] {
        const visited = new Set<string>();
        const rootNodes: string[] = [];

        stixObjects.forEach((stixObject) => {
            if (visited.has(stixObject.id)) { return; }

            const componentQueue: string[] = [stixObject.id];
            let minIndegree = Infinity;
            let minIndegreeNode = "";

            while (componentQueue.length > 0) {
                const current = componentQueue.shift()!;
                if (visited.has(current)) { continue; }

                visited.add(current);
                if ((inDegree[current] ?? 0) < minIndegree) {
                    minIndegree = inDegree[current] ?? 0;
                    minIndegreeNode = current;
                }

                adjacencyList[current]?.forEach((neighbor) => {
                    componentQueue.push(neighbor);
                });
            }

            if (minIndegreeNode) {
                rootNodes.push(minIndegreeNode);
            }
        });

        return rootNodes;
    }

    /**
     * Creates connections between blocks based on the graph structure.
     * @param rootNodes - The root nodes to start connecting from.
     * @param adjacencyList - The graph's adjacency list.
     * @param objectMap - The map of STIX object IDs to block objects.
     * @param factory - The diagram object factory to create connections.
     * @param canvas - The canvas to add the connections to.
     */
    private static createConnections(
        rootNodes: string[],
        adjacencyList: Record<string, string[]>,
        objectMap: Map<string, Block>,
        factory: DiagramObjectFactory,
        canvas: Canvas
    ): void {
        const visited = new Set<string>();
        const queue = [...rootNodes];

        while (queue.length > 0) {
            const current = queue.shift()!;
            const sourceBlock = objectMap.get(current);

            if (!sourceBlock) { continue; }

            adjacencyList[current]?.forEach((neighbor) => {
                const targetBlock = objectMap.get(neighbor);
                if (!targetBlock) { return; }

                const line = factory.createNewDiagramObject("generic_line", Line);
                line.source.link(sourceBlock.anchors.get("270")!);
                line.target.link(targetBlock.anchors.get("90")!);
                canvas.addObject(line);

                if (visited.has(neighbor)) { return; }
                visited.add(neighbor);
                queue.push(neighbor);
            });
        }
    }

    /**
     * Converts a STIX bundle to a flow diagram.
     * @param stix - The STIX bundle to convert.
     * @param factory - The diagram object factory to create diagram objects.
     * @returns The canvas containing the flow diagram.
     */
    public static toFlow(stix: StixBundle, factory: DiagramObjectFactory): Canvas {
        const canvas = factory.createNewDiagramObject(factory.canvas, Canvas);

        // Create blocks and get object map
        const objectMap = this.createBlocks(stix.objects, factory, canvas);

        // Build graph structure
        const { adjacencyList, inDegree } = this.buildGraph(stix.objects);

        // Find root nodes
        const rootNodes = this.findRootNodes(stix.objects, adjacencyList, inDegree);

        // Create connections between nodes
        this.createConnections(rootNodes, adjacencyList, objectMap, factory, canvas);

        return canvas;
    }
}


import { Canvas, Block, Line,  } from "../OpenChart/DiagramModel/DiagramObject";
import { type DiagramObjectFactory } from "../OpenChart/DiagramModel/DiagramObjectFactory";

interface StixObject {
    type: string;
    id: string;
    source_ref?: string;
    target_ref?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

export interface StixBundle {
    type: string;
    objects: StixObject[];
    id: string;
}

interface GraphEdge {
    source: string;
    target: string;
}

export class StixToFlow {
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


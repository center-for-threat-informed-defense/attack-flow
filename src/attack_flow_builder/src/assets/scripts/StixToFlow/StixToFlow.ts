import { Block, Canvas, Line, type DiagramObjectFactory } from "../OpenChart/DiagramModel";

interface StixObject {
  type: string;
  id: string;
  source_ref: string;
  target_ref: string;
}

export interface StixBundle {
  type: string;
  objects: StixObject[];
  id: string;
}

export class StixToFlow {

    public static toFlow(stix: StixBundle, factory: DiagramObjectFactory): Canvas { 
        // Create diagram objects
        const stixObjects = stix.objects;
        const canvas = factory.createNewDiagramObject(factory.canvas, Canvas);

        // Creating blocks first
        const objectMap = new Map<string, Block>();
        const stixEdges: StixObject[] = [];
        stixObjects.forEach((stixObject: any) => {
            if (stixObject.type === "relationship") {
                stixEdges.push(stixObject);
                return;
            }
            const block = factory.createNewDiagramObject(stixObject.type.replace("-", "_"), Block);
            canvas.addObject(block);
            objectMap.set(stixObject.id, block);
        });

        // Construct graph and also store indegree of each node
        const adjList: {[key: string]: string[]} = {};
        const inDegree: {[key: string]: number} = {};
        stixEdges.forEach((stixObject: any) => {
            adjList[stixObject.source_ref] = adjList[stixObject.source_ref] || [];
            adjList[stixObject.source_ref].push(stixObject.target_ref);
            inDegree[stixObject.target_ref] = inDegree[stixObject.target_ref] || 0;
            inDegree[stixObject.target_ref]++;
        });

        // Traverse the disjoint graph to find the root of each one (the one with the least indegree)
        const visited = new Set<string>();
        const queue: string[] = [];
        stixObjects.forEach((stixObject: any) => {
            if (visited.has(stixObject.id)) {
                return;
            }
            const componentQueue: string[] = [];
            componentQueue.push(stixObject.id);
            let minIndegree = Infinity;
            let minIndegreeNode = "";
            while (componentQueue.length > 0) {
                const current = componentQueue.shift()!;
                if (visited.has(current)) {
                    continue;
                }
                visited.add(current);
                if (inDegree[current]! < minIndegree) {
                    minIndegree = inDegree[current]!;
                    minIndegreeNode = current;
                }
                if (adjList[current]) {
                    adjList[current].forEach((neighbour: string) => {
                        componentQueue.push(neighbour);
                    });
                }
            }
            queue.push(minIndegreeNode);
        });

        // Traverse the graph level by level
        visited.clear();
        let level = 0;
        while (queue.length > 0) {
            for (let i = 0; i < queue.length; i++) {
                const current = queue.shift()!;
                if (adjList[current]) {
                    adjList[current].forEach((neighbour: string) => {
                        const line = factory.createNewDiagramObject("generic_line", Line);
                        line.source.link(objectMap.get(current)!.anchors.get("270")!);
                        line.target.link(objectMap.get(neighbour)!.anchors.get("90")!);
                        canvas.addObject(line);
                        if (visited.has(neighbour)) {
                            return;
                        }
                        visited.add(neighbour);
                        queue.push(neighbour);
                    });
                }
            }
            level++;
        }
        return canvas;
    }

}


import { BlockView, LineView, type DiagramObjectView } from "../../DiagramObjectView";
import type { DiagramLayoutEngine } from "../DiagramLayoutEngine";
import type { LatchView } from "../../DiagramObjectView/Views/LatchView";
import type { NodeLayoutInfo } from "./NodeLayoutInfo";


export class AutomaticLayoutEngine implements DiagramLayoutEngine {
    private static readonly HORIZONTAL_SPACING = 400;
    private static readonly VERTICAL_SPACING = 500;
    private static readonly COMPONENT_SPACING = 700;
    private static readonly MIN_NODE_WIDTH = 200;
    private static readonly MIN_NODE_HEIGHT = 100;

    /**
     * Runs the layout engine on a set of objects.
     * @param objects
     *  The objects to layout.
     */
    public run(objects: DiagramObjectView[]): void {
        if (!objects.length || !objects[0]) { return; }

        const nodes = new Set<DiagramObjectView>();
        const lines = new Set<LineView>();

        for (const block of objects[0]._blocks) {
            if (block instanceof BlockView) {
                nodes.add(block);
            }
        }

        for (const line of objects[0]._lines) {
            if (line instanceof LineView) {
                lines.add(line);
                if (line.source) { line.source.calculateLayout(); }
                if (line.target) { line.target.calculateLayout(); }
            }
        }

        if (nodes.size === 0) { return; }

        const { graph, incomingEdges } = this.buildGraph(nodes, lines);
        const rootNodes = this.findRootNodes(graph, incomingEdges);
        const components = this.identifyComponents(graph, nodes);
        const rankedNodes = this.topologicalSort(graph, incomingEdges, rootNodes);
        const nodeInfo = this.calculateNodeLayout(rankedNodes, graph, incomingEdges, components);
        this.positionNodes(nodeInfo, components);

        for (const block of nodes) {
            block.calculateLayout();
        }
        for (const line of lines) {
            line.calculateLayout();
        }
    }

    /**
     * Builds a graph representation from nodes and lines.
     * @param nodes The set of nodes.
     * @param lines The set of lines.
     * @returns The graph as adjacency lists for outgoing and incoming edges.
     */
    private buildGraph(
        nodes: Set<DiagramObjectView>,
        lines: Set<LineView>
    ): {
            graph: Map<DiagramObjectView, Set<DiagramObjectView>>;
            incomingEdges: Map<DiagramObjectView, Set<DiagramObjectView>>;
        } {
        const graph = new Map<DiagramObjectView, Set<DiagramObjectView>>();
        const incomingEdges = new Map<DiagramObjectView, Set<DiagramObjectView>>();

        nodes.forEach(node => {
            graph.set(node, new Set());
            incomingEdges.set(node, new Set());
        });

        lines.forEach(line => {
            if (!line.source || !line.target) { return; }

            const source = line.source as LatchView;
            const target = line.target as LatchView;

            if (source && target && source.anchor?.parent && target.anchor?.parent) {
                const sourceNode = source.anchor.parent;
                const targetNode = target.anchor.parent;

                if (nodes.has(sourceNode) && nodes.has(targetNode) && sourceNode !== targetNode) {
                    const outgoing = graph.get(sourceNode)!;
                    outgoing.add(targetNode);

                    const incoming = incomingEdges.get(targetNode)!;
                    incoming.add(sourceNode);
                }
            }
        });

        return { graph, incomingEdges };
    }

    /**
     * Finds root nodes in the graph (nodes with no incoming connections).
     * @param graph The graph as an adjacency list of outgoing edges.
     * @param incomingEdges The graph as an adjacency list of incoming edges.
     * @returns The set of root nodes.
     */
    private findRootNodes(
        graph: Map<DiagramObjectView, Set<DiagramObjectView>>,
        incomingEdges: Map<DiagramObjectView, Set<DiagramObjectView>>
    ): Set<DiagramObjectView> {
        const rootNodes = new Set<DiagramObjectView>();

        // Root nodes are those without incoming connections
        graph.forEach((_, node) => {
            const incoming = incomingEdges.get(node);
            if (incoming && incoming.size === 0) {
                rootNodes.add(node);
            }
        });

        return rootNodes;
    }

    /**
     * Identifies disconnected components in the graph.
     * @param graph The graph as an adjacency list.
     * @param nodes All nodes in the graph.
     * @returns Array of components, where each component is a set of nodes.
     */
    private identifyComponents(
        graph: Map<DiagramObjectView, Set<DiagramObjectView>>,
        nodes: Set<DiagramObjectView>
    ): Set<DiagramObjectView>[] {
        const components: Set<DiagramObjectView>[] = [];
        const visited = new Set<DiagramObjectView>();

        // For each unvisited node, perform BFS to find its connected component
        nodes.forEach(node => {
            if (visited.has(node)) { return; }

            const component = new Set<DiagramObjectView>();
            const queue: DiagramObjectView[] = [node];
            visited.add(node);
            component.add(node);

            while (queue.length > 0) {
                const current = queue.shift()!;
                const neighbors = this.getAllNeighbors(current, graph);
                neighbors.forEach(neighbor => {
                    if (!visited.has(neighbor)) {
                        visited.add(neighbor);
                        component.add(neighbor);
                        queue.push(neighbor);
                    }
                });
            }

            components.push(component);
        });

        return components;
    }

    /**
     * Gets all neighbors (both incoming and outgoing) of a node.
     * @param node The node to get neighbors for.
     * @param graph The graph as an adjacency list.
     * @returns Set of all neighbors.
     */
    private getAllNeighbors(
        node: DiagramObjectView,
        graph: Map<DiagramObjectView, Set<DiagramObjectView>>
    ): Set<DiagramObjectView> {
        const neighbors = new Set<DiagramObjectView>();
        const outgoing = graph.get(node);
        if (outgoing) {
            outgoing.forEach(neighbor => neighbors.add(neighbor));
        }
        graph.forEach((targets, source) => {
            if (targets.has(node)) {
                neighbors.add(source);
            }
        });

        return neighbors;
    }

    /**
     * Performs a topological sort of the graph to assign ranks to nodes.
     * @param graph The graph as an adjacency list of outgoing edges.
     * @param incomingEdges The graph as an adjacency list of incoming edges.
     * @param rootNodes The set of root nodes.
     * @returns Array of nodes sorted by rank.
     */
    private topologicalSort(
        graph: Map<DiagramObjectView, Set<DiagramObjectView>>,
        incomingEdges: Map<DiagramObjectView, Set<DiagramObjectView>>,
        rootNodes: Set<DiagramObjectView>
    ): DiagramObjectView[] {
        const result: DiagramObjectView[] = [];
        const queue: DiagramObjectView[] = Array.from(rootNodes);
        const inDegree = new Map<DiagramObjectView, number>();

        graph.forEach((_, node) => {
            const incoming = incomingEdges.get(node);
            inDegree.set(node, incoming ? incoming.size : 0);
        });

        while (queue.length > 0) {
            const node = queue.shift()!;
            result.push(node);

            const neighbors = graph.get(node) || new Set<DiagramObjectView>();
            neighbors.forEach(neighbor => {
                const degree = inDegree.get(neighbor)! - 1;
                inDegree.set(neighbor, degree);

                if (degree === 0) {
                    queue.push(neighbor);
                }
            });
        }

        // Handle cycles by adding remaining nodes
        if (result.length < graph.size) {
            graph.forEach((_, node) => {
                if (!result.includes(node)) {
                    result.push(node);
                }
            });
        }

        return result;
    }

    /**
     * Calculates the layout information for each node in the graph.
     * @param rankedNodes Array of nodes sorted by rank.
     * @param graph The graph as an adjacency list of outgoing edges.
     * @param incomingEdges The graph as an adjacency list of incoming edges.
     * @param components Array of disconnected components.
     * @returns Map of nodes to their layout information.
     */
    private calculateNodeLayout(
        rankedNodes: DiagramObjectView[],
        graph: Map<DiagramObjectView, Set<DiagramObjectView>>,
        incomingEdges: Map<DiagramObjectView, Set<DiagramObjectView>>,
        components: Set<DiagramObjectView>[]
    ): Map<DiagramObjectView, NodeLayoutInfo> {
        const nodeInfo = new Map<DiagramObjectView, NodeLayoutInfo>();

        const componentMap = new Map<DiagramObjectView, number>();
        components.forEach((component, index) => {
            component.forEach(node => {
                componentMap.set(node, index);
            });
        });

        for (let i = 0; i < rankedNodes.length; i++) {
            const node = rankedNodes[i];
            const children = Array.from(graph.get(node) || []);
            const parents = Array.from(incomingEdges.get(node) || []);
            const componentId = componentMap.get(node) || 0;

            nodeInfo.set(node, {
                node,
                level: 0,
                column: 0,
                width: AutomaticLayoutEngine.MIN_NODE_WIDTH,
                height: AutomaticLayoutEngine.MIN_NODE_HEIGHT,
                children,
                parents,
                rank: i,
                componentId
            });
        }

        components.forEach((component, _componentId) => {
            const componentRoots: DiagramObjectView[] = [];
            component.forEach(node => {
                const info = nodeInfo.get(node)!;
                if (info.parents.length === 0 || !info.parents.some(p => component.has(p))) {
                    componentRoots.push(node);
                }
            });

            if (componentRoots.length === 0 && component.size > 0) {
                componentRoots.push(component.values().next().value!);
            }

            this.assignLevelsForComponent(nodeInfo, componentRoots, component);
        });

        components.forEach(component => {
            this.assignColumnsForComponent(nodeInfo, component);
        });

        return nodeInfo;
    }

    /**
     * Assigns levels to nodes within a component based on the longest path from any root.
     * @param nodeInfo Map of nodes to their layout information.
     * @param roots Root nodes within the component.
     * @param component Set of nodes in the component.
     */
    private assignLevelsForComponent(
        nodeInfo: Map<DiagramObjectView, NodeLayoutInfo>,
        roots: DiagramObjectView[],
        component: Set<DiagramObjectView>
    ): void {
        component.forEach(node => {
            const info = nodeInfo.get(node)!;
            info.level = 0;
        });

        const visited = new Set<DiagramObjectView>();
        const queue: DiagramObjectView[] = [...roots];

        while (queue.length > 0) {
            const node = queue.shift()!;
            const info = nodeInfo.get(node)!;
            visited.add(node);

            for (const child of info.children) {
                if (!component.has(child)) { continue; }

                const childInfo = nodeInfo.get(child)!;

                childInfo.level = Math.max(childInfo.level, info.level + 1);

                if (!visited.has(child) && !queue.includes(child)) {
                    const allParentsInComponentVisited = childInfo.parents
                        .filter(p => component.has(p))
                        .every(p => visited.has(p) || queue.includes(p));

                    if (allParentsInComponentVisited) {
                        queue.push(child);
                    }
                }
            }
        }

        component.forEach(node => {
            if (!visited.has(node)) {
                const nodeQueue = [node];
                visited.add(node);

                while (nodeQueue.length > 0) {
                    const current = nodeQueue.shift()!;
                    const currentInfo = nodeInfo.get(current)!;

                    for (const child of currentInfo.children) {
                        if (!component.has(child)) { continue; }

                        const childInfo = nodeInfo.get(child)!;
                        childInfo.level = Math.max(childInfo.level, currentInfo.level + 1);

                        if (!visited.has(child)) {
                            nodeQueue.push(child);
                            visited.add(child);
                        }
                    }
                }
            }
        });
    }

    /**
     * Assigns column positions to nodes within a component to minimize edge crossings.
     * @param nodeInfo Map of nodes to their layout information.
     * @param component Set of nodes in the component.
     */
    private assignColumnsForComponent(
        nodeInfo: Map<DiagramObjectView, NodeLayoutInfo>,
        component: Set<DiagramObjectView>
    ): void {
        const nodesByLevel = new Map<number, DiagramObjectView[]>();

        component.forEach(node => {
            const info = nodeInfo.get(node)!;
            if (!nodesByLevel.has(info.level)) {
                nodesByLevel.set(info.level, []);
            }
            nodesByLevel.get(info.level)!.push(node);
        });

        const levels = Array.from(nodesByLevel.keys()).sort((a, b) => a - b);

        for (const level of levels) {
            const nodesAtLevel = nodesByLevel.get(level)!;

            if (level === 0) {
                nodesAtLevel.sort((a, b) => {
                    return nodeInfo.get(a)!.rank - nodeInfo.get(b)!.rank;
                });
            } else {
                nodesAtLevel.sort((a, b) => {
                    const aInfo = nodeInfo.get(a)!;
                    const bInfo = nodeInfo.get(b)!;

                    const aParentsInComponent = aInfo.parents.filter(p => component.has(p));
                    const bParentsInComponent = bInfo.parents.filter(p => component.has(p));

                    const aAvgColumn = aParentsInComponent.length > 0
                        ? aParentsInComponent.reduce((sum, p) => sum + nodeInfo.get(p)!.column, 0) / aParentsInComponent.length
                        : 0;
                    const bAvgColumn = bParentsInComponent.length > 0
                        ? bParentsInComponent.reduce((sum, p) => sum + nodeInfo.get(p)!.column, 0) / bParentsInComponent.length
                        : 0;

                    return aAvgColumn - bAvgColumn;
                });
            }

            // Assign columns
            for (let i = 0; i < nodesAtLevel.length; i++) {
                const info = nodeInfo.get(nodesAtLevel[i])!;
                info.column = i;
            }
        }
    }

    /**
     * Positions nodes based on calculated layout information, with disconnected components separated.
     * @param nodeInfo Map of nodes to their layout information.
     * @param components Array of disconnected components.
     */
    private positionNodes(
        nodeInfo: Map<DiagramObjectView, NodeLayoutInfo>,
        components: Set<DiagramObjectView>[]
    ): void {
        const componentWidths = new Map<number, number>();
        const componentEdges = new Map<number, number>();

        components.forEach((component, componentId) => {
            let maxColumn = 0;
            let edgeCount = 0;

            component.forEach(node => {
                const info = nodeInfo.get(node)!;
                maxColumn = Math.max(maxColumn, info.column);
                edgeCount += info.children.length;
            });

            componentWidths.set(componentId, (maxColumn + 1) * AutomaticLayoutEngine.HORIZONTAL_SPACING);
            componentEdges.set(componentId, edgeCount);
        });

        const sortedComponentIds = Array.from(componentEdges.keys()).sort((a, b) => {
            return componentEdges.get(b)! - componentEdges.get(a)!;
        });

        const componentOffsets = new Map<number, number>();
        let currentOffset = 0;

        sortedComponentIds.forEach(componentId => {
            componentOffsets.set(componentId, currentOffset);
            currentOffset += componentWidths.get(componentId)! + AutomaticLayoutEngine.COMPONENT_SPACING;
        });

        nodeInfo.forEach(info => {
            const componentOffset = componentOffsets.get(info.componentId) || 0;
            const x = componentOffset + (info.column * AutomaticLayoutEngine.HORIZONTAL_SPACING);
            const y = info.level * AutomaticLayoutEngine.VERTICAL_SPACING;

            info.node.moveTo(x, y);
        });
    }
}

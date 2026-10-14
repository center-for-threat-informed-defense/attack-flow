import { LineView, BlockView } from "../DiagramObjectView";
import type { LatchView } from "../DiagramObjectView/Views/LatchView";

export type CardinalDirection = "n" | "s" | "e" | "w" | "nnw" | "nne" | "ssw" | "sse" | "ese" | "ene" | "wsw" | "wnw";

const anchorsToDirections: Record<string, CardinalDirection> = {
    "0": "e",
    "30": "ene",
    "60": "nne",
    "90": "n",
    "120": "nnw",
    "150": "wnw",
    "180": "w",
    "210": "wsw",
    "240": "ssw",
    "270": "s",
    "300": "sse",
    "330": "ese",
    "branch:True": "ssw", // Support condition block anchor keys.
    "branch:False": "sse"
};

/**
 * Resolves an anchor key to its current physical direction on a block.
 *
 * Most blocks use the standard cardinal anchor arrangement. A left-to-right
 * condition face moves its branch ports to the east edge and its three
 * ordinary east-side anchors to the south edge, so those keys need a
 * condition-specific interpretation.
 * @param block
 *  The block that owns the anchor.
 * @param anchorKey
 *  The anchor's key in the block's anchor map.
 * @returns
 *  The anchor's direction, if it is known.
 */
export function getAnchorDirection(
    block: BlockView, anchorKey: string
): CardinalDirection | undefined {
    const isLeftToRightCondition =
        block.id === "condition" &&
        block.properties.value.get("orientation")?.toJson() === "left-to-right";

    if (isLeftToRightCondition) {
        switch (anchorKey) {
            case "branch:True":
                return "ene";
            case "branch:False":
                return "ese";
            case "30":
                return "ssw";
            case "0":
                return "s";
            case "330":
                return "sse";
        }
    }

    return anchorsToDirections[anchorKey];
}

/**
 * Finds root nodes in the graph (nodes with no incoming connections).
 * @param graph The graph as an adjacency list of outgoing edges.
 * @param incomingEdges The graph as an adjacency list of incoming edges.
 * @returns The set of root nodes.
 */
export function findRootNodes(
    graph: Map<BlockView, Set<BlockView>>,
    incomingEdges: Map<BlockView, Set<BlockView>>
): Set<BlockView> {
    const rootNodes = new Set<BlockView>();

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
 * Get the bounding box of a set of blocks as the minimum and maximum x and y positions.
 * @param blocks Set of blocks
 * @returns minimums and maximums for x and y positions.
 */
export function getBoundingBox(blocks: Set<BlockView>): {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
} {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const block of blocks) {
        minX = Math.min(minX, block.x);
        minY = Math.min(minY, block.y);
        maxX = Math.max(maxX, block.x);
        maxY = Math.max(maxY, block.y);
    }

    return { minX, minY, maxX, maxY };
}

/**
 * Builds a graph representation from nodes and lines.
 * @param nodes The set of nodes.
 * @param lines The set of lines.
 * @returns The graph as adjacency lists for outgoing and incoming edges.
 */
export function buildGraph(
    nodes: Set<BlockView>,
    lines: Set<LineView>
): {
        graph: Map<BlockView, Set<BlockView>>;
        incomingEdges: Map<BlockView, Set<BlockView>>;
    } {
    const graph = new Map<BlockView, Set<BlockView>>();
    const incomingEdges = new Map<BlockView, Set<BlockView>>();

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
 * Collapse disallowed nodes out of a graph while preserving adjacency among allowed nodes.
 * e.g. If in A -> B -> C "B" is not allowed, then the graph collapses to A -> C.
 * @param nodes Full set of nodes to inspect.
 * @param lines Full set of lines to inspect.
 * @param allowedBlockIds Allowed block type identifiers. Any node whose `id` is not in this set is treated as disallowed.
 * @returns Collapsed outgoing and incoming adjacency lists containing only allowed nodes.
 */
export function collapseDisallowedRelationships(
    nodes: Set<BlockView>,
    lines: Set<LineView>,
    allowedBlockIds: Set<string>
): {
        graph: Map<BlockView, Set<BlockView>>;
        incomingEdges: Map<BlockView, Set<BlockView>>;
    } {
    const { graph } = buildGraph(nodes, lines);
    const collapsedGraph = new Map<BlockView, Set<BlockView>>();
    const incomingEdges = new Map<BlockView, Set<BlockView>>();

    const collectAllowedDescendants = (
        node: BlockView,
        result: Set<BlockView>,
        visited: Set<BlockView>
    ) => {
        if (visited.has(node)) {
            return;
        }

        if (allowedBlockIds.has(node.id)) {
            result.add(node);
            return;
        }

        const children = graph.get(node);
        if (!children) {
            return;
        }

        const nextVisited = new Set(visited);
        nextVisited.add(node);

        for (const child of children) {
            collectAllowedDescendants(child, result, nextVisited);
        }
    };

    for (const block of graph.keys()) {
        if (!allowedBlockIds.has(block.id)) {
            continue;
        }

        collapsedGraph.set(block, new Set());
        incomingEdges.set(block, new Set());
    }

    for (const [block, children] of graph) {
        if (!allowedBlockIds.has(block.id)) {
            continue;
        }

        const collapsedChildren = collapsedGraph.get(block)!;
        for (const child of children) {
            const allowedDescendants = new Set<BlockView>();
            collectAllowedDescendants(child, allowedDescendants, new Set<BlockView>());

            for (const descendant of allowedDescendants) {
                if (descendant === block) {
                    continue;
                }

                collapsedChildren.add(descendant);
                incomingEdges.get(descendant)?.add(block);
            }
        }
    }

    return {
        graph: collapsedGraph,
        incomingEdges
    };
}

/**
 * For a given child block, get a map of each parents to the direction of the child from the parent.
 * @param block the child block to check.
 * @param incomingEdges The graph as an adjacency list of incoming edges.
 * @returns map of parent blocks to the anchor positions where the lines originate as cardinal directions.
 */
export function getIncomingDirectionsWithParents(
    block: BlockView,
    incomingEdges: Map<BlockView, Set<BlockView>>
): Map<BlockView, CardinalDirection> {
    const result = new Map<BlockView, CardinalDirection>();

    const parents = incomingEdges.get(block);

    if (!parents) { return result; }

    for (const parent of parents) {
        // Find the anchors which link the parent and the child.
        for (const [anchorKey, anchor] of parent.anchors) {
            for (const latch of anchor.latches) {
                const line = latch.parent as LineView;

                for (const childAnchor of block.anchors.values()) {
                    if ( // Check both source and target in the case that a relationship has been flipped in the adjacency lists.
                        line.source.isLinked(childAnchor) ||
                        line.target.isLinked(childAnchor)
                    ) {
                        // The parent line links to a child anchor.
                        const direction = getAnchorDirection(parent, anchorKey);
                        if (direction) {
                            result.set(parent, direction);
                        }
                    }
                }
            }
        }
    }

    return result;
}

/**
 * Reduce a detailed anchor direction to one of the four cardinal sides.
 * @param direction The detailed direction to reduce.
 * @returns The corresponding cardinal side.
 */
export function generalizeSide(direction: CardinalDirection): "n" | "s" | "e" | "w" {
    switch (direction) {
        case "nnw":
        case "n":
        case "nne":
            return "n";
        case "ssw":
        case "s":
        case "sse":
            return "s";
        case "wnw":
        case "w":
        case "wsw":
            return "w";
        case "ene":
        case "e":
        case "ese":
            return "e";
    }
}

/**
 * Get a set of siblings of a child on the same side of a parent block.
 * @param graph The graph as an adjacency list of outgoing edges.
 * @param incomingEdges The graph as an adjacency list of incoming edges.
 * @param parent The parent node.
 * @param child The child node.
 * @returns set of child siblngs on the same side of parent
 */
export function getSiblingsOnSameSide(
    graph: Map<BlockView, Set<BlockView>>,
    incomingEdges: Map<BlockView, Set<BlockView>>,
    parent: BlockView,
    child: BlockView
): Set<BlockView> {
    const result = new Set<BlockView>();

    const childDir = generalizeSide(
        getIncomingDirectionsWithParents(child, incomingEdges).get(parent) as CardinalDirection);


    const allSiblings = new Set([...graph.get(parent) as Set<BlockView>]);
    if (allSiblings) {
        allSiblings.delete(child); // child is not a sibling of itself

        for (const s of allSiblings) {
            const siblingDir = generalizeSide(
                getIncomingDirectionsWithParents(s, incomingEdges).get(parent) as CardinalDirection);
            if (siblingDir === childDir) {
                result.add(s);
            }
        }
    }

    return result;
}

/**
 * Gets all neighbors (both incoming and outgoing) of a node.
 * @param node The node to get neighbors for.
 * @param graph The graph as an adjacency list.
 * @returns Set of all neighbors.
 */
export function getAllNeighbors(
    node: BlockView,
    graph: Map<BlockView, Set<BlockView>>
): Set<BlockView> {
    const neighbors = new Set<BlockView>();
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
 * Identifies disconnected components in the graph.
 * @param graph The graph as an adjacency list.
 * @param nodes All nodes in the graph.
 * @returns Array of components, where each component is a set of nodes.
 */
export function identifyComponents(
    graph: Map<BlockView, Set<BlockView>>,
    nodes: Set<BlockView>
): Set<BlockView>[] {
    const components: Set<BlockView>[] = [];
    const visited = new Set<BlockView>();

    // For each unvisited node, perform BFS to find its connected component
    nodes.forEach(node => {
        if (visited.has(node)) { return; }

        const component = new Set<BlockView>();
        const queue: BlockView[] = [node];
        visited.add(node);
        component.add(node);

        while (queue.length > 0) {
            const current = queue.shift()!;
            const neighbors = getAllNeighbors(current, graph);
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
 * Performs a topological sort of the graph to assign ranks to nodes.
 * @param graph The graph as an adjacency list of outgoing edges.
 * @param incomingEdges The graph as an adjacency list of incoming edges.
 * @param rootNodes The set of root nodes.
 * @returns Array of nodes sorted by rank.
 */
export function topologicalSort(
    graph: Map<BlockView, Set<BlockView>>,
    incomingEdges: Map<BlockView, Set<BlockView>>,
    rootNodes: Set<BlockView>
): BlockView[] {
    const result: BlockView[] = [];
    const queue: BlockView[] = Array.from(rootNodes);
    const inDegree = new Map<BlockView, number>();

    graph.forEach((_, node) => {
        const incoming = incomingEdges.get(node);
        inDegree.set(node, incoming ? incoming.size : 0);
    });

    while (queue.length > 0) {
        const node = queue.shift()!;
        result.push(node);

        const neighbors = graph.get(node) || new Set<BlockView>();
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

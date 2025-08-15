import { LayoutEdge, LayoutNode } from "./LayoutElement";
import { SourceSide, TargetSide } from "./NodeTraversalAlgorithms";
import { AnchorPosition, BlockView, LineView } from "../../DiagramObjectView";
import { DiagramObject, SemanticAnalyzer, traverse } from "@OpenChart/DiagramModel";
import type { CanvasView } from "../../DiagramObjectView";

/**
 * Converts a {@link Canvas} to a set of linked {@link LayoutNode}s.
 * @param canvas
 *  The canvas.
 * @returns
 *  The linked layout nodes.
 */
export function canvasToBoxTrees(canvas: CanvasView): LayoutNode[] {
    // Construct canvas index
    const index = new Map<string, DiagramObject>();
    for(const object of traverse([canvas])) {
        index.set(object.instance, object);
    }
    // Parse graph structure
    const graph = SemanticAnalyzer.toGraph(canvas);
    // Cast graph structure to layout graph
    const nodes = new Map<string, LayoutNode>()
    for(const instance of graph.nodes.keys()) {
        const obj = index.get(instance);
        if(!(obj instanceof BlockView)) {
            continue;
        }
        const n = new LayoutNode(obj) as LayoutNode;
        nodes.set(n.id, n);
    }
    for(const [instance, edge] of graph.edges) {
        const obj = index.get(instance)!;
        if(!(obj instanceof LineView)) {
            continue;
        }
        const e = new LayoutEdge(obj) as LayoutEdge;
        if(edge.source) {
            const node = nodes.get(edge.source.instance);
            node?.addOutEdge(e);
        }
        if(edge.target) {
            const node = nodes.get(edge.target.instance);
            node?.addInEdge(e);
            // Set orientation
            const sourceAngle = edge.sourceVia as AnchorPosition;
            const targetAngle = edge.targetVia as AnchorPosition;
            e.orientation |= angleToSide(sourceAngle, SourceSide);
            e.orientation |= angleToSide(targetAngle, TargetSide);
        }
    }
    // Return nodes
    return [...nodes.values()];
}

/**
 * Converts an {@link AnchorPosition} to a block side.
 * @param angle
 *  The {@link AnchorPosition}.
 * @param SideEnum
 *  The side enumeration to use.
 * @returns
 *  The converted angle.
 */
function angleToSide(
    angle: AnchorPosition,
    SideEnum: { North: number, East: number, South: number, West: number }
) {
    switch(angle) {
        case AnchorPosition.D60:
        case AnchorPosition.D90:
        case AnchorPosition.D120:
            return SideEnum.North
        case AnchorPosition.D0:
        case AnchorPosition.D30:
        case AnchorPosition.D330:
            return SideEnum.East;
        case AnchorPosition.D240:
        case AnchorPosition.D270:
        case AnchorPosition.D300:
            return SideEnum.South;
        case AnchorPosition.D150:
        case AnchorPosition.D180:
        case AnchorPosition.D210:
            return SideEnum.West;
    }
}

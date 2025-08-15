import { SimpleLayout } from "./NodeLayoutAlgorithms";
import { LayoutComponent } from "./LayoutComponent";
import { canvasToBoxTrees } from "./DiagramToGraph";
import { ManualLayoutEngine } from "../ManualLayoutEngine";
import { PositionalTraverser, TargetSide } from "./NodeTraversalAlgorithms";
import { TreeCloudCompositor, TreeMergeCompositor } from "./NodeCompositingAlgorithms";
import type { LayoutNode } from "./LayoutElement";
import type { CanvasView } from "../../DiagramObjectView";
import type { PositionMap } from "../PositionMap";
import type { DiagramLayoutEngine } from "../DiagramLayoutEngine";
import type { NodeLayoutAlgorithm } from "./NodeLayoutAlgorithms";
import type { AutomaticLayoutOptions } from "./AutomaticLayoutOptions";
import type { NodeCompositingAlgorithm } from "./NodeCompositingAlgorithms";

export class AutomaticLayoutEngine implements DiagramLayoutEngine {

    /**
     * The layout engine's options.
     */
    public readonly options: AutomaticLayoutOptions;


    /**
     * Creates a new {@link AutomaticLayoutEngine}.
     * @param options
     *  The layout engine's options.
     */
    constructor(options: AutomaticLayoutOptions) {
        this.options = options;
    }


    /**
     * Runs the layout engine on a {@link CanvasView}.
     * @param canvas
     *  The canvas to layout. 
     */
    public run(canvas: CanvasView): void;

    /**
     * Runs the layout engine on a set of objects.
     * @param canvas
     *  The canvas the objects belong to.
     * @param objects
     *  The objects to layout specified by instance id.
     */
    public run(canvas: CanvasView, objects?: Set<string>): void;
    public run(canvas: CanvasView, objects?: Set<string>) {
        if(objects) {

        } else {
            this.runOnGraph(canvas, canvasToBoxTrees(canvas))
        }
    }

    /**
     * Runs the layout engine on a set of linked layout nodes.
     * @param canvas
     *  The canvas the nodes belong to.
     * @param nodes
     *  The layout nodes.
     */
    public runOnGraph(canvas: CanvasView, nodes: LayoutNode[]) {
        let comp: NodeCompositingAlgorithm;
        let layout: NodeLayoutAlgorithm;

        // Define composition and layout algorithms
        const alg = this.options.layoutAlgorithm;
        switch(alg) {
            case "simple":
                // Define traversal algorithms
                // const traverseV = new StructuralTraversal(
                //     TargetSide.North | TargetSide.South
                // );
                // const traverseH = new StructuralTraversal(
                //     TargetSide.West | TargetSide.East
                // );
                // Define compositing algorithm
                comp = new TreeCloudCompositor(
                    new PositionalTraverser(
                        TargetSide.South, TargetSide.North
                    ),
                    new PositionalTraverser(
                        TargetSide.East, TargetSide.West
                    )
                );
                // Define layout algorithm
                layout = new SimpleLayout(
                    this.options.optimizeOrder,
                    this.options.spacing * canvas.grid[0] * 2
                )
                break;
            case "advanced":
                // Define compositing algorithm
                comp = new TreeMergeCompositor(
                    new PositionalTraverser(
                        TargetSide.South, TargetSide.North
                    ),
                    new PositionalTraverser(
                        TargetSide.East, TargetSide.West
                    )
                );
                // Define layout algorithm
                layout = new SimpleLayout(
                    this.options.optimizeOrder,
                    this.options.spacing * canvas.grid[0] * 2
                )
                break;
            default:
                throw new Error(`Unsupported layout algorithm: '${alg}'`);

        }

        // Build position map
        let positions: PositionMap = {};
        for(const component of LayoutComponent.separateConnectedComponents(nodes)) {
            positions = { 
                ...positions, 
                ...layout.run(comp.composite(component))
            };
        }

        // Apply position map
        new ManualLayoutEngine(positions).run(canvas);
        
    }

}

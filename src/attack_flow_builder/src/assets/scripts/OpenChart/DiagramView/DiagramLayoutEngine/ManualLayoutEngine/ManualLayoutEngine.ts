import { Handle, traverse } from "@OpenChart/DiagramModel";
import { CanvasView, PositionSetByUser } from "../../DiagramObjectView";
import type { PositionMap } from "../PositionMap";
import type { DiagramObjectView } from "../../DiagramObjectView";
import type { DiagramLayoutEngine } from "../DiagramLayoutEngine";

export class ManualLayoutEngine implements DiagramLayoutEngine {

    /**
     * The engine's layout map.
     */
    private layout: PositionMap;


    /**
     * Creates a new {@link ManualLayoutEngine}.
     * @param layout
     *  The engine's layout map.
     */
    constructor(layout: PositionMap) {
        this.layout = layout;
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
    public run(canvas: CanvasView, objects?: Set<string>): void {
        for (const object of traverse(canvas)) {
            const coords = this.layout[object.instance];
            if(!coords || (objects && !objects.has(object.instance))) {
                continue;
            } 
            if(object instanceof Handle) {
                object.userSetPosition = PositionSetByUser.True;
            }
            if (object.userSetPosition !== PositionSetByUser.False) {
                object.moveTo(coords[0], coords[1]);
            }
        }
    }


    /**
     * Generates a {@link PositionMap} from a list of objects.
     * @param objects
     *  The objects.
     * @returns
     *  The {@link PositionMap}.
     */
    public static generatePositionMap(objects: DiagramObjectView[]): PositionMap {
        // Collect positioned objects
        const objs = traverse(objects, o => o.userSetPosition !== PositionSetByUser.False);
        // Construct map
        const positions = new Map<string, [number, number]>(
            [...objs].map(obj => [obj.instance, [obj.x, obj.y]])
        );
        return Object.fromEntries(positions);
    }

}

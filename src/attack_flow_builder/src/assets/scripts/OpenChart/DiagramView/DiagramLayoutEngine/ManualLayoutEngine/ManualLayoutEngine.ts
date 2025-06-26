import { Group, Handle, Latch, traverse } from "@OpenChart/DiagramModel";
import type { PositionMap } from "./PositionMap";
import { PositionSetByUser, type DiagramObjectView } from "../../DiagramObjectView";
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
     * Runs the layout engine on a set of objects.
     * @param objects
     *  The objects.
     */
    public run(objects: DiagramObjectView[]): void {
        for (const object of traverse(objects)) {
            const coords = this.layout[object.instance];
            if (coords) {
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

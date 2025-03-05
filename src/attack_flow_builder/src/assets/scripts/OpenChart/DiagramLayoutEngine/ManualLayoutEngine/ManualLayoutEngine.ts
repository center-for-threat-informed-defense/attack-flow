import { traverse } from "../../DiagramNavigators";
import { Group, Handle, Latch } from "../../DiagramModel";
import type { PositionMap } from "./PositionMap";
import type { DiagramObjectView } from "../../DiagramView";
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
        const positionedObjects = [
            // Include explicitly provided objects
            ...objects,
            ...traverse(objects, (obj) => {
                // Include children of groups
                if (obj.parent instanceof Group) {
                    return true;
                }
                // Include positioned latches
                if (obj instanceof Latch && !obj.isLinked()) {
                    return true;
                }
                // Include positioned handles
                if (obj instanceof Handle && obj.userSetPosition) {
                    return true;
                }
                return false;
            })
        ];
        const positions = new Map<string, [number, number]>(
            positionedObjects.map(obj => [obj.instance, [obj.x, obj.y]])
        );
        return Object.fromEntries(positions);
    }

}

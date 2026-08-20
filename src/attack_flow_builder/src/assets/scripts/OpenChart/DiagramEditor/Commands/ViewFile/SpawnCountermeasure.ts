import { SpawnDefensiveObject, type DefensiveSourceObject } from "./SpawnDefensiveObject";
import { enums as DefendEnums } from "@/assets/configuration/AttackFlowTemplates/MitreDefend";
import type { DiagramViewFile } from "@OpenChart/DiagramView";

type CountermeasureSourceObject = DefensiveSourceObject & { type: "countermeasure" };

export class SpawnCountermeasure extends SpawnDefensiveObject {

    /**
     * Spawns an Attack Flow countermeasure in a diagram file.
     * @param file
     *  The diagram file.
     * @param countermeasureId
     *  The countermeasure source id.
     * @param x
     *  The countermeasure's x-coordinate.
     * @param y
     *  The countermeasure's y-coordinate.
     * @param fromCorner
     *  Whether to position the countermeasure from its top-left corner or its center.
     *  (Default: `false`)
     */
    constructor(
        file: DiagramViewFile,
        countermeasureId: string,
        x: number,
        y: number,
        fromCorner: boolean = false
    ) {
        super(file, getCountermeasureSourceObject(countermeasureId), x, y, fromCorner);
    }

}

function getCountermeasureSourceObject(sourceId: string): CountermeasureSourceObject {
    const sourceObject = (DefendEnums.techniques as Record<string, object>)[sourceId];
    if (!sourceObject) {
        throw new Error(`Unknown countermeasure id '${sourceId}'.`);
    }
    return sourceObject as CountermeasureSourceObject;
}

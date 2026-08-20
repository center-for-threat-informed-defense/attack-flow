import { SpawnObject } from "./SpawnObject";
import {
    MultiSelectProperty,
    StringProperty
} from "@OpenChart/DiagramModel";
import type {
    LogSource,
    SourceObject
} from "@/assets/configuration/AttackFlowTemplates/SourceEnumeration";
import {
    populateLogSourceOptions
} from "@/assets/configuration/AttackFlowTemplates/logSourceOptions";
import type { DiagramViewFile } from "@OpenChart/DiagramView";

export type DefensiveObjectType = "mitigation" | "detection" | "countermeasure";
export type DefensiveSourceObject = SourceObject & { type: DefensiveObjectType };

const DefensiveObjectIdProperties: Record<DefensiveObjectType, string> = {
    mitigation: "mitigation_id",
    detection: "detection_id",
    countermeasure: "countermeasure_id"
};

export abstract class SpawnDefensiveObject extends SpawnObject {

    /**
     * The defensive object's source id.
     */
    public readonly sourceId: string;

    /**
     * The defensive object type.
     */
    public readonly objectType: DefensiveObjectType;


    /**
     * Spawns an Attack Flow defensive object in a diagram file.
     * @param file
     *  The diagram file.
     * @param sourceObject
     *  The defensive object's source object.
     * @param x
     *  The object's x-coordinate.
     * @param y
     *  The object's y-coordinate.
     * @param fromCorner
     *  Whether to position the object from its top-left corner or its center.
     *  (Default: `false`)
     */
    constructor(
        file: DiagramViewFile,
        sourceObject: DefensiveSourceObject,
        x: number,
        y: number,
        fromCorner: boolean = false
    ) {
        super(file, sourceObject.type, x, y);
        this.sourceId = sourceObject.id;
        this.objectType = sourceObject.type;
        this.configureDefensiveObject(sourceObject);
        this.object.calculateLayout();
        this.positionObject(file, x, y, fromCorner);
    }

    /**
     * Configures the defensive object with its source values.
     * @param sourceObject
     *  The defensive object's source object.
     */
    private configureDefensiveObject(sourceObject: DefensiveSourceObject): void {
        const idProperty = DefensiveObjectIdProperties[sourceObject.type];
        this.object.properties.get(idProperty, StringProperty)?.setValue(sourceObject.id);
        this.object.properties.get("name", StringProperty)?.setValue(sourceObject.name);
        if (sourceObject.type === "detection") {
            this.configureDetectionLogSources(sourceObject.log_sources ?? []);
        }
    }

    /**
     * Populates the detection block's log source options from catalog data.
     * @param logSources
     *  Log sources associated with the detection strategy.
     */
    private configureDetectionLogSources(logSources: LogSource[]): void {
        const logSourcesProperty = this.object.properties.get("log_sources", MultiSelectProperty);
        if (!logSourcesProperty || !logSources.length) {
            return;
        }

        populateLogSourceOptions(logSourcesProperty, logSources);
    }

}

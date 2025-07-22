import { DarkTheme } from "../AttackFlowThemes/DarkTheme";
import { AnchorPosition } from "@OpenChart/DiagramView";
import { AnchorConfiguration } from "../AttackFlowTemplates/AnchorFormat";
import { roundNearestMultiple } from "@/assets/scripts/OpenChart/Utilities";
import {
    ConditionAnchorPositionMap, LegacyV2TemplateMap,
    PositionSetByUser, PositionSetByUserMask,
    StandardAnchorPositionMap
} from "./FileDefinitions";
import type { FilePreprocessor } from "@/assets/scripts/Application";
import type { DiagramViewExport } from "@OpenChart/DiagramView";
import type { LegacyV2PageExport } from "./FileDefinitions";
import type { DiagramObjectExport } from "@OpenChart/DiagramModel";

export class AttackFlowFilePreprocessor implements FilePreprocessor {

    /**
     * Preprocess a save file.
     * @remarks
     *  This function can be used to migrate or modify files before they're
     *  loaded into the application.
     * @remarks
     *  The save file.
     * @returns
     *  The processed {@link DiagramViewExport}.
     */
    public process(file: any): DiagramViewExport {
        // Migrate file format
        return this.migrate(file);
    }

    /**
     * Migrates an Attack Flow file to the current version.
     * @param file
     *  The save file.
     * @returns
     *  The migrated {@link DiagramObjectExport}.
     */
    public migrate(file: any): DiagramViewExport {
        // If file contains 'version', it's likely an Attack Flow v2 file
        if ("version" in file) {
            // Migrate file
            file = this.fromV2(file as LegacyV2PageExport);
            // Alert user
            alert(
                "Your Flow has been updated to the Attack Flow v3 file format. " +
                "You may notice some minor changes to the layout."
            );
            // Return file
            return file;
        }
        // Otherwise, assume it's an Attack Flow v3 file
        else {
            return file as DiagramViewExport;
        }
    }

    /**
     * Converts an Attack Flow v2.0 file to the current version.
     * @param file
     *  The Attack Flow Page Export.
     * @returns
     *  The converted {@link DiagramViewExport}.
     */
    public fromV2(file: LegacyV2PageExport) : DiagramViewExport {
        const gridSize = DarkTheme.grid;

        // Create new file
        const migratedFile : DiagramViewExport = {
            schema  : "attack_flow_v2",
            theme   : DarkTheme.id,
            objects : [],
            layout  : {},
            camera  : file.location
        };

        // Migrate objects
        const oldObjectLookup = new Map(file.objects.map(o => [o.id, o]));
        const newObjectLookup = new Map<string, DiagramObjectExport>();
        for (const obj of file.objects) {

            // Migrate Object
            let migratedObj: DiagramObjectExport;
            switch (obj.template) {

                // Migrate flow
                case "flow":
                    migratedObj = {
                        id         : obj.template,
                        instance   : obj.id,
                        properties : obj.properties,
                        objects    : obj.children
                    };
                    migratedFile.layout![obj.id] = [
                        roundNearestMultiple(obj.x, gridSize[0]),
                        roundNearestMultiple(obj.y, gridSize[1])
                    ];
                    break;

                // Migrate anchor
                case "@__builtin__anchor":
                case "false_anchor":
                case "true_anchor":
                    migratedObj = {
                        id       : "",
                        instance : obj.id,
                        latches  : obj.children
                    };
                    break;

                // Migrate latches
                case "@__builtin__line_source":
                case "@__builtin__line_target":
                    migratedObj = {
                        id       : "generic_latch",
                        instance : obj.id
                    };
                    migratedFile.layout![obj.id] = [
                        roundNearestMultiple(obj.x, gridSize[0]),
                        roundNearestMultiple(obj.y, gridSize[1])
                    ];
                    break;

                // Migrate handles
                case "@__builtin__line_handle":
                    migratedObj = {
                        id       : "generic_handle",

                        instance : obj.id
                    };
                    // Set position, if configured by user
                    const sby = obj.attrs & PositionSetByUserMask;
                    if (sby === PositionSetByUser.True) {
                        migratedFile.layout![obj.id] = [
                            roundNearestMultiple(obj.x, gridSize[0]),
                            roundNearestMultiple(obj.y, gridSize[1])
                        ];
                    }
                    break;

                // Migrate lines
                case "@__builtin__line_horizontal_elbow":
                case "@__builtin__line_vertical_elbow":
                    migratedObj = {
                        id       : "dynamic_line",
                        instance : obj.id,
                        source: "",
                        target: "",
                        handles  : []
                    };
                    for (const childId of obj.children) {
                        const childObj = oldObjectLookup.get(childId);
                        switch (childObj?.template ?? "") {
                            case "@__builtin__line_source":
                                migratedObj.source = childId;
                                continue;
                            case "@__builtin__line_target":
                                migratedObj.target = childId;
                                continue;
                            case "@__builtin__line_handle":
                                migratedObj.handles.push(childId);
                                continue;
                            default:
                                throw new Error("Malformed Attack Flow V2 file.");
                        }
                    }
                    break;

                // Migrate blocks
                case "action":
                    // Convert tactic / technique properties
                    const ap = new Map(obj.properties);
                    obj.properties.push([
                        "ttp", [
                            [
                                "tactic",
                                ap.get("tactic_id") ?? null
                            ],
                            [
                                "technique",
                                ap.get("technique_id") ?? null
                            ]
                        ]
                    ]);
                    // Fall-through

                default:
                    const id = LegacyV2TemplateMap[obj.template] ?? obj.template;
                    migratedObj = {
                        id         : id,
                        instance   : obj.id,
                        properties : obj.properties,
                        anchors    : {}
                    };
                    migratedFile.layout![obj.id] = [
                        roundNearestMultiple(obj.x, gridSize[0]),
                        roundNearestMultiple(obj.y, gridSize[1])
                    ];
                    // Collect anchors
                    const anchors = [];
                    for (const childId of obj.children) {
                        const childObj = oldObjectLookup.get(childId);
                        switch (childObj?.template ?? "") {
                            case "@__builtin__anchor":
                            case "true_anchor":
                            case "false_anchor":
                                anchors.push(childId);
                                break;
                            default:
                                throw new Error("Malformed Attack Flow V2 file.");
                        }
                    }
                    // Convert anchor positions
                    if (obj.template === "condition") {
                        migratedObj.anchors = Object.fromEntries(
                            anchors.map((id, i) => [ConditionAnchorPositionMap[i], id])
                        );
                    } else {
                        migratedObj.anchors = Object.fromEntries(
                            anchors.map((id, i) => [StandardAnchorPositionMap[i], id])
                        );
                    }
            }

            newObjectLookup.set(migratedObj.instance, migratedObj);
        }

        // Now that anchors are associated to nodes, update their ID to
        // differentiate horizontal from vertical.
        for (const migratedObj of newObjectLookup.values()) {
            if (!("anchors" in migratedObj)) {
                continue;
            }
            for (const [position, id] of Object.entries(migratedObj.anchors)) {
                const anchor = newObjectLookup.get(id)!;
                if (position == "branch:True" || position === "branch:False") {
                    anchor.id = "vertical_anchor";
                } else {
                    anchor.id = AnchorConfiguration[position as AnchorPosition];
                }
            }
        }

        // Return file
        migratedFile.objects = [...newObjectLookup.values()];
        return migratedFile;
    }

}

export default AttackFlowFilePreprocessor;

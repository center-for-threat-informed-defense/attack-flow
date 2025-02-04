import { GroupCommand } from "./GroupCommand";
import { SelectObject } from "./SelectObject";
import { UnselectDescendants } from "./UnselectDescendants";
import { MoveCameraToObjects } from "./MoveCameraToObjects";
import {
    DiagramLineModel,
    DiagramObjectModel,
    SemanticAnalyzer
} from "@/assets/scripts/BlockDiagram";
import type { ApplicationStore } from "@/stores/Stores/ApplicationStore";

export class MoveCameraToChildren extends GroupCommand {

    /**
     * Interprets an object's selected children as a graph and focuses the
     * camera on their (graph-wise) children.
     * @param context
     *  The application context.
     * @param object
     *  The object.
     */
    constructor(context: ApplicationStore, object: DiagramObjectModel) {
        super();
        const objects = object.children.filter(c => c.isSelected());
        if (!objects.length) {
            return;
        }
        // Get (graph-wise) children
        const children = new Set<DiagramObjectModel>();
        for (const obj of objects) {
            for (const n of this.getNextBlocks(obj)) {
                children.add(n);
            }
        }
        // Unselect objects
        this.add(new UnselectDescendants(object));
        // Select children
        for (const child of children) {
            this.add(new SelectObject(child));
        }
        // Move camera to children
        if (children.size) {
            this.add(new MoveCameraToObjects(context, [...children]));
        }
    }

    /**
     * Resolve next graph-wise blocks.
     * @param obj
     *  The source object.
     */
    private getNextBlocks(obj: DiagramObjectModel): Set<DiagramObjectModel> {
        let set = new Set<DiagramObjectModel>();
        const next = SemanticAnalyzer.getNextGraphLinks(obj);
        for (const n of next) {
            if (n instanceof DiagramLineModel) {
                set = new Set([...set, ...this.getNextBlocks(n)]);
            } else {
                set.add(n);
            }
        }
        return set;
    }

}

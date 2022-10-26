import { GroupCommand } from "./GroupCommand";
import { ApplicationStore } from "@/store/StoreTypes";
import { SelectObject } from "./SelectObject";
import { UnselectDescendants } from "./UnselectDescendants";
import { MoveCameraToObjects } from "./MoveCameraToObjects";
import {
    DiagramLineModel,
    DiagramObjectModel,
    SemanticAnalyzer
} from "@/assets/scripts/BlockDiagram";

export class MoveCameraToParents extends GroupCommand {

    /**
     * Interprets an object's selected children as a graph and focuses the
     * camera on their (graph-wise) parents.
     * @param context
     *  The application context.
     * @param object
     *  The object.
     */
    constructor(context: ApplicationStore, object: DiagramObjectModel) {
        super();
        let objects = object.children.filter(c => c.isSelected());
        if(!objects.length) {
            return;
        }
        // Get (graph-wise) parents
        let parents = new Set<DiagramObjectModel>;
        for(let obj of objects) {
            for(let n of this.getPrevBlocks(obj)) {
                parents.add(n);
            }
        }
        // Unselect objects
        this.add(new UnselectDescendants(object));
        // Select parents
        for(let child of parents) {
            this.add(new SelectObject(child));
        }
        // Move camera to parents
        if(parents.size) {
            this.add(new MoveCameraToObjects(context, [...parents]));
        }
    }

    /**
     * Resolve prev graph-wise blocks.
     * @param obj
     *  The source object.
     */
    private getPrevBlocks(obj: DiagramObjectModel): Set<DiagramObjectModel> {
        let set = new Set<DiagramObjectModel>();
        let prev = SemanticAnalyzer.getPrevGraphLinks(obj);
        for(let p of prev) {
            if(p instanceof DiagramLineModel) {
                set = new Set([...set, ...this.getPrevBlocks(p)])
            } else {
                set.add(p);
            }
        }
        return set;
    }

}

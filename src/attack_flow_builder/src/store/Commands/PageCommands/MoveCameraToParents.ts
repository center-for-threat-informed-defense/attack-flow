import { GroupCommand } from "./GroupCommand";
import { ApplicationStore } from "@/store/StoreTypes";
import { SelectObject } from "./SelectObject";
import { UnselectDescendants } from "./UnselectDescendants";
import { MoveCameraToObjects } from "./MoveCameraToObjects";
import {
    DiagramObjectModel,
    SemanticAnalyzer,
    SemanticRole
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
        let parents: DiagramObjectModel[] = [];
        for(let obj of objects) {
            let links = SemanticAnalyzer.getPrevGraphLinks(obj);
            if(obj.hasRole(SemanticRole.Node)) {
                for(let link of links) {
                    let nodes = SemanticAnalyzer.getPrevGraphLinks(link);
                    if(nodes.length) {
                        parents = parents.concat(nodes);
                    } else {
                        parents.push(link);
                    }
                }
            } else {
                parents = parents.concat(links);
            }
        }
        // Unselect objects
        this.add(new UnselectDescendants(object));
        // Select parents
        for(let child of parents) {
            this.add(new SelectObject(child));
        }
        // Move camera to parents
        if(parents.length) {
            this.add(new MoveCameraToObjects(context, parents));
        }
    }

}

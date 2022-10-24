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
        let objects = object.children.filter(c => c.isSelected());
        if(!objects.length) {
            return;
        }
        // Get (graph-wise) children
        let children: DiagramObjectModel[] = [];
        for(let obj of objects) {
            let links = SemanticAnalyzer.getNextGraphLinks(obj);
            if(obj.hasRole(SemanticRole.Node)) {
                for(let link of links) {
                    let nodes = SemanticAnalyzer.getNextGraphLinks(link);
                    if(nodes.length) {
                        children = children.concat(nodes);
                    } else {
                        children.push(link);
                    }
                }
            } else {
                children = children.concat(links);
            }
        }
        // Unselect objects
        this.add(new UnselectDescendants(object));
        // Select children
        for(let child of children) {
            this.add(new SelectObject(child));
        }
        // Move camera to children
        if(children.length) {
            this.add(new MoveCameraToObjects(context, children));
        }
    }

}

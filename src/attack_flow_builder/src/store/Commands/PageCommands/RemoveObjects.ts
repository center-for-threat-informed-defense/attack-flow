import { PageCommand } from "../PageCommand";
import { 
    DiagramAnchorableModel,
    DiagramAnchorModel,
    DiagramObjectModel,
    DiagramObjectModelError
} from "@/assets/scripts/BlockDiagram";

export class RemoveObjects extends PageCommand {
    
    /**
     * The set of objects to remove.
     */
    private _items: {
        index: number,
        parent: DiagramObjectModel,
        object: DiagramObjectModel
    }[];

    /**
     * The set of external attachments.
     */
    private _links: { 
        index: number,
        anchor: DiagramAnchorModel,
        object: DiagramAnchorableModel
    }[]; 


    /**
     * Removes one or more objects from their parent object.
     * 
     * NOTE:
     * Do NOT perform more than one `RemoveObjects` in a single transaction.
     * If removals are broken into separate requests, their mutual dependencies
     * can't be determined. This may cause `undo()` and  `redo()` to break as
     * they can no longer reconstruct the objects and dependencies correctly.
     * 
     * @param objects
     *  The objects to remove from their parents.
     */
    constructor(objects: DiagramObjectModel[]) {
        let page = objects[0].root.id;
        for(let i = 1; i < objects.length; i++) {
            if(page === objects[i].root.id)
                continue;
            throw new DiagramObjectModelError(
                `Objects must originate from the same root.`
            );
        }
        super(page);
        // Compile objects
        this._links = [];
        this._items = [];
        for(let o of objects) {
            if(!o.parent) {
                throw new DiagramObjectModelError(
                    "Object must have a parent.", o
                );
            }
            this._items.push({
                index: o.getIndexInParent(),
                parent: o.parent,
                object: o
            });
        }
        // Compile list of anchors and anchor-ables
        let map = new Map<string, DiagramObjectModel>();
        for(let item of this._items) {
            for(let c of item.object.getSubtree()) {
                if(
                    c instanceof DiagramAnchorModel ||
                    c instanceof DiagramAnchorableModel
                ) {
                    map.set(c.id, c);
                }
            }
        }
        // Save any dependencies that can't be found in the list
        for(let obj of map.values()) {
            if(obj instanceof DiagramAnchorableModel) {
                if(obj.isAttached() && !map.has(obj.anchor!.id)) {
                    this._links.push({ 
                        index: obj.getIndexInAnchor(),
                        anchor: obj.anchor!,
                        object: obj,
                    })
                }
            } else if(obj instanceof DiagramAnchorModel) {
                for(let child of obj.children) {
                    if(!map.has(child.id)) {
                        this._links.push({ 
                            index: child.getIndexInAnchor(),
                            anchor: obj,
                            object: child, 
                        })
                    }
                }
            }
        }
    }


    /**
     * Executes the command.
     * @returns
     *  True if the command should be recorded, false otherwise.
     */
    public execute(): boolean {
        // Detach external attachments
        for(let link of this._links) {
            link.anchor.removeChild(link.object);
        }
        // Remove objects from parents
        for(let item of this._items) {
            item.parent.removeChild(item.object, true, false);
        }
        return true;
    }

    /**
     * Undoes the page command.
     */
    public undo() {
        // Add objects to parents
        for(let item of this._items) {
            item.parent.addChild(item.object, item.index);
        } 
        // Attach external attachments
        for(let link of this._links) {
            link.anchor.addChild(link.object, link.index);
        }
    }

}

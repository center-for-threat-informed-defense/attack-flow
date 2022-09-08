import { DiagramAction } from "./DiagramAction";
import { 
    DiagramAnchorableModel,
    DiagramAnchorModel,
    DiagramObjectModel,
    DiagramObjectModelError
} from "../DiagramModelTypes/BaseTypes/BaseModels";

export class RemoveObjects implements DiagramAction {
    
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
     * Creates a new {@link RemoveObjects}.
     * @param objects
     *  The objects to remove from their parents.
     * @throws { DiagramObjectModelError }
     *  If any of the `objects` don't have a parent.
     */
    constructor(...objects: DiagramObjectModel[]) {
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
     * Applies the action.
     */
    public redo() {
        // Detach external attachments
        for(let link of this._links) {
            link.anchor.removeChild(link.object.id);
        }
        // Remove objects from parents
        for(let item of this._items) {
            item.parent.removeChild(item.object.id, true, false);
        }
        
    }

    /**
     * Reverts the action.
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

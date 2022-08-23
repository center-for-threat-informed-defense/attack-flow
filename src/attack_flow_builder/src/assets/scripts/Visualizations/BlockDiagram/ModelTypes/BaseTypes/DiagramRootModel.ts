import { ObjectTemplate } from "../../DiagramFactory/DiagramSchemaTypes";
import { DiagramFactory } from "../../DiagramFactory/DiagramFactory";
import { DiagramAnchorModel } from "./DiagramAnchorModel";
import { DiagramObjectModel } from "./DiagramObjectModel";
import { IsAnchored, Select } from "../../Attributes";
import { DiagramObjectExport } from "../../DiagramFactory/DiagramExportTypes";

export abstract class DiagramRootModel extends DiagramObjectModel {

    /**
     * The root's current selection.
     */
    public selected: Map<string, DiagramObjectModel>;

    /**
     * The root's internal object cache.
     */
    private _objectCache: Map<string, DiagramObjectModel>;


    /**
     * Creates a new {@link DiagramRootModel}.
     * @param factory
     *  The object's diagram factory.
     * @param template
     *  The object's template.
     * @param values 
     *  A serialized {@link DiagramRootModel}. 
     */
    constructor(factory: DiagramFactory, template: ObjectTemplate, values?: DiagramObjectExport) {
        super(factory, template, 0, undefined, values);
        this.selected = new Map();
        this._objectCache = new Map();
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Select & Unselect Objects  /////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Adds an object to the current selection.
     * @param id
     *  The object's id.
     * @returns
     *  True if the object was selected, false otherwise.
     */
    public addToSelection(id: string): boolean {
        let s = this.selected;
        let obj = this.lookup(id);
        // Check object
        if (!obj || s.has(id))
            return false;
        // Set selection bit
        if (s.size === 0) {
            obj.setSelection(Select.Single);
        } else if (s.size === 1) {
            let fst = s.values().next().value;
            fst.setSelection(Select.Multi);
            obj.setSelection(Select.Multi);
        } else {
            obj.setSelection(Select.Multi);
        }
        // Add item to selection
        s.set(obj.id, obj);
        return true;
    }

    /**
     * Removes an object from the current selection.
     * @param id
     *  The object's  id.
     * @returns
     *  True of the object was selected, false otherwise.
     */
    public removeFromSelection(id: string): boolean {
        let s = this.selected;
        if (!s.has(id))
            return false;
        let obj = s.get(id)!;
        // Clear selection bit
        obj.setSelection(Select.Unselected);
        // Remove item if it exists
        s.delete(id);
        // Set remaining node to single selection (if applicable)
        if (s.size === 1) {
            let rem = s.values().next().value;
            rem.setSelection(Select.Single);
        }
        return true;
    }

    /**
     * Removes all objects from the current selection.
     * @returns
     *  True if the objects were unselected, false if there were none.
     */
    public clearSelection(): boolean {
        let s = this.selected;
        if(s.size === 0)
            return false;
        // Clear selection
        for (let [id, item] of s) {
            item.setSelection(Select.Unselected);
            s.delete(id);
        }
        return true;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Add & Remove Objects  //////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Adds an object to the diagram.
     * @param src
     *  The object.
     * @param dst
     *  The id of the object to append to.
     *  (Default: This page)
     * @throws { Error }
     *  If 'dst' can't be found.
     */
    public add(src: DiagramObjectModel, dst: string = this.id) {
        let obj = this.lookup(dst);
        if(obj) {
            src.parent = obj;
            obj.children.push(src);
        } else {
            throw new Error(`'${ dst }' does not exist.`);
        }
    }

    /**
     * Removes an object from the diagram.
     * @param id
     *  The id of the object.
     * @returns
     *  True if the object was removed, false otherwise.
     */
    public remove(id: string): boolean {
        // Select object
        let obj = this.lookup(id);
        if(!obj || !obj.parent) {
            return false;
        }
        for(let o of obj.getSubtree()) {
            // Detach anchors
            if(o instanceof DiagramAnchorModel) {
                o.children.forEach(c => this.detach(o.id, c.id));
            } else if(o.isAnchored()) {
                let anchors = this.getSubtree(
                    o => o instanceof DiagramAnchorModel
                );
                for(let a of anchors) {
                    if(this.detach(a.id, o.id)) break;
                }
            }
            // Remove from selection
            this.removeFromSelection(o.id);
        }
        // Remove object from its parent
        let parent = obj.parent.children;
        parent.splice(parent.indexOf(obj));
        // Rebuild cache
        this.rebuildObjectCache();
        return true;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  3. Anchor & Detach Objects  ///////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Links an object to an anchor.
     * @param anchor
     *  The id of the anchor.
     * @param object
     *  The id of the object.
     * @throws { Error }
     *  If either the anchor or object can't be found, the object itself is an
     *  anchor, or the object is already anchored to something else.
     */
    public anchor(anchor: string, object: string) {
        let o = this.lookup(object);
        let a = this.lookup(anchor);
        let isObjectAnchor = o instanceof DiagramAnchorModel;
        let isAnchorAnchor = a instanceof DiagramAnchorModel;  
        if(o && a && !isObjectAnchor && isAnchorAnchor && !o.isAnchored()) {
            a.children.push(o);
            o.setIsAnchored(IsAnchored.True);
            // TODO: Move to?
        } else {
            throw new Error(`'${ object }' cannot be linked to '${ anchor }'.`);
        }
    }
    
    /**
     * Unlinks an object from an anchor.
     * @param anchor
     *  The id of the anchor.
     * @param object
     *  The id of the object.
     * @returns
     *  True if the object was unlinked, false otherwise.
     */
    public detach(anchor: string, object: string): boolean {        
        let o = this.lookup(object);
        let a = this.lookup(anchor);
        let i = a && o && a.children.indexOf(o) || -1;
        let isAnchorAnchor = a instanceof DiagramAnchorModel;  
        if(o && a && isAnchorAnchor && i !== -1) {
            a.children.splice(i);
            o.setIsAnchored(IsAnchored.False);
            // TODO: Snap element back to grid if applicable?
            return true;
        }
        return false;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  4. Object Lookup  /////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns an object from the diagram.
     * @param id
     *  The id of the object.
     * @returns
     *  The object or `undefined` if no object with that id exists.
     */
    public lookup(id: string): DiagramObjectModel | undefined {
        if(this._objectCache.has(id)) {
            return this._objectCache.get(id);
        } else {
            this.rebuildObjectCache();
            return this._objectCache.get(id);
        }
    }

    
    ///////////////////////////////////////////////////////////////////////////
    //  5. Object Cache Management  ///////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Rebuilds the internal object cache.
     */
    private rebuildObjectCache() {
        this._objectCache.clear();
        for(let obj of this.getSubtree()) {
            this._objectCache.set(obj.id, obj);
        }
    }

}

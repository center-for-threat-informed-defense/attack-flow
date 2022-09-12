import { AddObject } from "./AddObject";
import { AttachObject } from "./AttachObject";
import { DetachObject } from "./DetachObject";
import { DiagramController } from "./DiagramController";
import { GroupAction } from "./GroupAction";
import { Layer, LayerObject } from "./LayerObject";
import { MoveObjectBy } from "./MoveObjectBy";
import { MoveObjectTo } from "./MoveObjectTo";
import { RemoveObjects } from "./RemoveObjects";
import { UserSetObjectPosition } from "./UserSetObjectPosition";
import { 
    CameraLocation,
    DiagramAnchorableModel,
    DiagramAnchorModel,
    DiagramLineModel,
    DiagramObjectModel,
    PageModel
} from "../DiagramModelTypes";

export class PageEditor { 

    /**
     * The page.
     */
    public readonly page: PageModel;

    /**
     * The page's diagram controller.
     */
    private readonly _controller: DiagramController;


    /**
     * Creates a new {@link PageEditor}.
     * @param page
     *  The page to edit.
     */
    constructor(page: PageModel) {
        this.page = page;
        this._controller = new DiagramController();
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Add & Remove Page Objects  /////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Adds an object to the page.
     * @param object
     *  The object.
     * @param parent
     *  The id of the object to append to.
     *  (Default: This page)
     * @throws { Error }
     *  If `parent` can't be found.
     *  If `object` fails to meet the type requirements of `parent`. 
     */
    public addObject(object: DiagramObjectModel, parent: string = this.page.id) {
        let p = this.page.lookup(parent);
        if(!p) {   
            throw new Error(`Parent '${ parent }' does not exist.`);
        }
        this._controller.execute(new AddObject(object, p));
    }

    /**
     * Adds a line object to the page and links it to the specified anchors.
     * @param object
     *  The line object.
     * @param src
     *  The source anchor's id.
     * @param trg
     *  The target anchor's id.
     * @param parent
     *  The id of the object to append to.
     *  (Default: This page)
     */
    public addLineObject(
        object: DiagramLineModel,
        src: string,
        trg?: string,
        parent: string = this.page.id
    ) {
        let p = this.page.lookup(parent);
        if(!p) {   
            throw new Error(`Parent '${ parent }' does not exist.`);
        }
        let grp = new GroupAction();
        // Add line
        grp.add(new AddObject(object, p));
        // Attach to source
        let srcAnc = this.page.lookup<DiagramAnchorModel>(src)!;
        let isSrcValid = srcAnc instanceof DiagramAnchorModel;
        if(isSrcValid) {
            let { xMid, yMid } = srcAnc.boundingBox;
            grp.add(new MoveObjectTo(object.srcEnding, xMid, yMid));
            grp.add(new AttachObject(object.srcEnding, srcAnc))
        } else {
            throw new Error(`Invalid anchor '${ src }'.`);
        }
        // Attach to target
        if(trg) {
            let trgAnc = this.page.lookup<DiagramAnchorModel>(trg)!;
            let isTrgValid = trgAnc instanceof DiagramAnchorModel;
            if(isTrgValid) {
                let { xMid, yMid } = trgAnc.boundingBox;
                grp.add(new MoveObjectTo(object.trgEnding, xMid, yMid));
                grp.add(new AttachObject(object.trgEnding, trgAnc));
            } else {
                throw new Error(`Invalid anchor '${ trg }'.`);
            }
        }
        // Execute
        this._controller.execute(grp);
    }

    /**
     * Removes one or more objects from the page.
     * 
     * NOTE:
     * Do NOT perform more than one `removeObjects()` in a single transaction.
     * If removals are broken into separate requests, their mutual dependencies
     * can't be determined. This may cause `undo()` and  `redo()` to break as
     * they can no longer reconstruct the objects and dependencies correctly.
     *  
     * @param objects
     *  One or more object ids.
     */
    public removeObjects(...objects: string[]) {
        // Collect objects
        let objs = [];
        for(let id of objects) {
            let obj = this.page.lookup(id);
            if(!obj) {
                throw new Error(`'${ id }' does not exist.`);
            }
            objs.push(obj);
        }
        // Remove from diagram
        this._controller.execute(new RemoveObjects(...objs));
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Anchor Page Objects  ///////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Links an object to an anchor.
     * @param object
     *  The object's id.
     * @param anchor
     *  The anchor's id.
     */
    public attach(object: string, anchor: string) {
        let o = this.page.lookup<DiagramAnchorableModel>(object)!;
        let a = this.page.lookup<DiagramAnchorModel>(anchor)!;
        let isObjectValid = o instanceof DiagramAnchorableModel;
        let isAnchorValid = a instanceof DiagramAnchorModel;
        if(isObjectValid && isAnchorValid) {
            let grp = new GroupAction();
            // Detach object from existing anchor
            if(o.isAttached()) {
                grp.add(new DetachObject(o));
            }
            // Move object to anchor
            let { xMid, yMid } = a.boundingBox;
            grp.add(new MoveObjectTo(o, xMid, yMid));
            // Attach object to anchor
            grp.add(new AttachObject(o, a));
            // Execute
            this._controller.execute(grp);
        } else {
            throw new Error(`Invalid link '${ object }' -> '${ anchor }'.`);
        }
    }

    /**
     * Unlinks an object from its anchor.
     * @param object
     *  The object's id.
     */
    public detach(object: string) {
        let o = this.page.lookup<DiagramAnchorableModel>(object)!;
        let isObjectValid = o instanceof DiagramAnchorableModel;
        if(isObjectValid && o.isAttached()) {
            this._controller.execute(new DetachObject(o));
        } else {
            throw new Error(`Invalid object '${ object }'.`)
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  3. Move Page Objects  /////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Moves one or more objects relative to their current position.
     * @param objects
     *  The object id or a list of object ids.
     * @param dx
     *  The change in x.
     * @param dy
     *  The change in y.
     */
    public moveObjectsBy(objects: string[] | string, dx: number, dy: number) {
        let grp;
        if(Array.isArray(objects)) {
            grp = new GroupAction();
            for(let id of objects) {
                let obj = this.page.lookup(id);
                if(!obj) {
                    throw new Error(`'${ id }' does not exist.`);
                }
                if(!obj.hasUserSetPosition()) {
                    grp.add(new UserSetObjectPosition(obj));
                }
                grp.add(new MoveObjectBy(obj, dx, dy));
            }
        } else {
            let obj = this.page.lookup(objects);
            if(!obj) {
                throw new Error(`'${ objects }' does not exist.`);
            }
            if(!obj.hasUserSetPosition()) {
                grp = new GroupAction([
                    new UserSetObjectPosition(obj),
                    new MoveObjectBy(obj, dx, dy)
                ]);
            } else {
                grp = new MoveObjectBy(obj, dx, dy);
            }
        }
        this._controller.execute(grp);
    }

    /**
     * Moves one or more objects to a specific coordinate.
     * @param objects
     *  The object id or a list of object ids.
     * @param x
     *  The x coordinate.
     * @param y
     *  The y coordinate.
     */
    public moveObjectsTo(objects: string[] | string, x: number, y: number) {
        let grp;
        if(Array.isArray(objects)) {
            grp = new GroupAction();
            for(let id of objects) {
                let obj = this.page.lookup(id);
                if(!obj) {
                    throw new Error(`'${ id }' does not exist.`);
                }
                if(!obj.hasUserSetPosition()) {
                    grp.add(new UserSetObjectPosition(obj));
                }
                grp.add(new MoveObjectTo(obj, x, y));
            }
        } else {
            let obj = this.page.lookup(objects);
            if(!obj) {
                throw new Error(`'${ objects }' does not exist.`);
            }
            if(!obj.hasUserSetPosition()) {
                grp = new GroupAction([
                    new UserSetObjectPosition(obj),
                    new MoveObjectTo(obj, x, y)
                ]);
            } else {
                grp = new MoveObjectTo(obj, x, y);
            }
        }
        this._controller.execute(grp);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  4. Layer Page Objects  /////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Moves an object to a different layer in its parent.
     * @param object
     *  The object's id.
     * @param layer
     *  The layer to move the object to.
     */
    public reorderObjectLayer(object: string, layer: Layer) {
        let obj = this.page.lookup(object);
        if(!obj) {
            throw new Error(`'${ object }' does not exist.`);
        }
        this._controller.execute(new LayerObject(obj, layer));
    }


    ///////////////////////////////////////////////////////////////////////////
    //  5. Move Page Camera  //////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Sets the page's camera location.
     * @param loc
     *  The camera's location.
     */
    public setCameraLocation(loc: CameraLocation) {
        this.page.location = loc;
    }

    
    ///////////////////////////////////////////////////////////////////////////
    //  6. History Controls  //////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Undoes the last page action. 
     */
    public undo() {
        this._controller.undo();
    }
    
    /**
     * Tests if the last action can be undone.
     * @returns
     *  True if the last action can be undone, false otherwise.
     */
    public canUndo(): boolean {
        return this._controller.canUndo();
    }

    /**
     * Undoes the last undone page action.
     */
    public redo() {
        this._controller.redo();
    }

    /**
     * Tests if the last undo action can be redone.
     * @returns
     *  True if the last undo action can be redone, false otherwise.
     */
    public canRedo(): boolean {
        return this._controller.canRedo();
    }

    /**
     * Begins a new transaction. All following page actions will be queued and
     * run when `endTransaction()` is called. Calls to `undo()` or `redo()`
     * will destroy all currently open transactions. Transactions nest inside
     * each other and will only execute once the outermost transaction has
     * ended.
     */
    public beginTransaction() {
        this._controller.beginTransaction();
    }

    /**
     * Ends the current transaction.
     */
    public endTransaction() {
        this._controller.endTransaction();
    }

}

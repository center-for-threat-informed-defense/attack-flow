import { Line } from "./Line";
import { Block } from "./Block";
import { Crypto } from "@OpenChart/Utilities";
import { DiagramObject } from "../DiagramObject";
import { ModelUpdateReason } from "../../ModelUpdateReason";
import type { Anchor } from "./Anchor";
import type { RootProperty } from "../Property";

export class Group extends DiagramObject {

    /**
     * The group's (internal) blocks.
     */
    protected _blocks: Block[];

    /**
     * The group's (internal) lines.
     */
    protected _lines: Line[];


    /**
     * The group's blocks.
     */
    public get blocks(): ReadonlyArray<Block> {
        return this._blocks;
    }

    /**
     * The group's lines.
     */
    public get lines(): ReadonlyArray<Line> {
        return this._lines;
    }

    /**
     * The group's objects.
     */
    public get objects(): Generator<DiagramObject> {
        return this.getObjects();
    }


    /**
     * Creates a new {@link Group}.
     * @param id
     *  The object's identifier.
     * @param instance
     *  The object's instance identifier.
     * @param attributes
     *  The object's attributes.
     * @param properties
     *  The object's root property.
     */
    constructor(
        id: string,
        instance: string,
        attributes: number,
        properties: RootProperty
    ) {
        super(id, instance, attributes, properties);
        this._blocks = [];
        this._lines = [];
    }


    /**
     * Returns the group's objects.
     * @returns
     *  The group's objects.
     */
    private *getObjects(): Generator<DiagramObject> {
        let i;
        for (i = 0; i < this._lines.length; i++) {
            yield this._lines[i];
        }
        for (i = 0; i < this._blocks.length; i++) {
            yield this._blocks[i];
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Add / Remove Objects  //////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns the index of a child {@link DiagramObject}.
     * @param child
     *  The child {@link DiagramObject}.
     * @returns
     *  The child's index.
     */
    public getObjectIndex(child: DiagramObject): number {
        const list = child instanceof Line ? this._lines : this._blocks;
        return list.findIndex(o => o.instance === child.instance);
    }

    /**
     * Adds a child {@link DiagramObject}.
     * @param child
     *  The {@link DiagramObject} to add.
     * @param index
     *  The index to insert the child at.
     *  (Default: End of the array).
     * @param update
     *  Whether to update the diagram or not.
     *  (Default: `false`)
     */
    public addObject(child: DiagramObject, index?: number, update: boolean = false) {
        // Remove existing child
        this.removeObject(child);
        // (Re)insert child back into children.
        if (child instanceof Line) {
            index ??= this._lines.length;
            this._lines.splice(index, 0, child);
        } else if (child instanceof Block) {
            index ??= this._blocks.length;
            this._blocks.splice(index, 0, child);
        } else {
            throw new Error(`Groups cannot contain '${child.constructor.name}'.`);
        }
        // Set child's parent
        this.makeChild(child);
        // Update diagram
        if (update) {
            this.handleUpdate(ModelUpdateReason.ObjectAdded);
        }
    }

    /**
     * Removes a child {@link DiagramObject}.
     * @param child
     *  The {@link DiagramObject} to remove.
     * @param notify
     *  Whether to notify parent diagram objects
     *  (Default: `false`)
     * @param update
     *  Whether to update the diagram or not.
     *  (Default: `false`)
     * @returns
     *  The child's former index.
     */
    public removeObject(child: DiagramObject, update: boolean = false): number {
        // Remove child
        const index = this.getObjectIndex(child);
        if (index !== -1) {
            const list = child instanceof Line ? this._lines : this._blocks;
            list.splice(index, 1);
        } else {
            return index;
        }
        // Clear child's parent
        this.makeChild(child, null);
        // Update diagram
        if (update) {
            this.handleUpdate(ModelUpdateReason.ObjectRemoved);
        }
        // Return index
        return index;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Cloning  ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns a complete clone of the object.
     * @param instance
     *  The clone's instance identifier.
     *  (Default: Random UUID)
     * @param instanceMap
     *  An empty map that, if provided, will be populated with object instance
     *  ID to clone instance ID associations.
     * @param match
     *  A predicate which is applied to each child. If the predicate returns
     *  false, the object is not included in the clone.
     * @returns
     *  A clone of the object.
     */
    public clone(
        instance?: string,
        instanceMap?: Map<string, string>,
        match?: (obj: DiagramObject) => boolean
    ): Group {
        // Create clone
        const clone = this.replicateChildrenTo(this.isolatedClone(instance), instanceMap, match);
        // Create association
        instanceMap?.set(this.instance, clone.instance);
        // Return clone
        return clone;
    }

    /**
     * Returns a childless clone of the object.
     * @param instance
     *  The clone's instance identifier.
     *  (Default: Random UUID)
     * @returns
     *  A clone of the object.
     */
    public isolatedClone(instance?: string): Group {
        return new Group(
            this.id,
            instance ?? Crypto.randomUUID(),
            this.attributes,
            this.properties.clone()
        );
    }

    /**
     * Clones the object's children and transfers them to `object`.
     * @param object
     *  The object to transfer the clones to.
     * @param match
     *  A predicate which is applied to each child. If the predicate returns
     *  false, the object is not included in the clone.
     * @param instanceMap
     *  An empty map that, if provided, will be populated with object instance
     *  ID to clone instance ID associations.
     * @returns
     *  The provided `object`.
     */
    protected replicateChildrenTo<T extends Group>(
        object: T,
        instanceMap?: Map<string, string>,
        match?: (obj: DiagramObject) => boolean
    ): T {
        const anchorMap = new Map<string, Anchor>();
        // Clone blocks
        for (const block of this.blocks) {
            if (match && !match(block)) {
                continue;
            }
            // Clone block
            const clone = block.clone(undefined, instanceMap);
            object.addObject(clone);
            // Map anchors
            for (const [position, { instance }] of block.anchors) {
                const anchorClone = clone.anchors.get(position)!;
                anchorMap.set(instance, anchorClone);
            }
        }
        // Clone lines
        for (const line of this.lines) {
            if (match && !match(line)) {
                continue;
            }
            // Clone line
            const clone = line.clone(undefined, instanceMap);
            object.addObject(clone);
            // Link lines
            const srcAnchor = line.source.anchor;
            if (srcAnchor && anchorMap.has(srcAnchor.instance)) {
                clone.source.link(anchorMap.get(srcAnchor.instance)!);
            }
            const trgAnchor = line.target.anchor;
            if (trgAnchor && anchorMap.has(trgAnchor.instance)) {
                clone.target.link(anchorMap.get(trgAnchor.instance)!);
            }
        }
        return object;
    }

}

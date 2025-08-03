import { Crypto } from "@OpenChart/Utilities";
import { DiagramObject } from "../DiagramObject";
import { ModelUpdateReason } from "../../ModelUpdateReason";
import type { Latch } from "./Latch";
import type { Handle } from "./Handle";
import type { RootProperty } from "../Property";

export class Line extends DiagramObject {

    /**
     * The line's (internal) source latch.
     */
    protected _sourceLatch: Latch | null;

    /**
     * The line's (internal) target latch.
     */
    protected _targetLatch: Latch | null;

    /**
     * The line's (internal) handles.
     */
    protected _handles: Handle[];


    /**
     * The line's source latch.
     */
    public get source(): Latch {
        if (this._sourceLatch) {
            return this._sourceLatch;
        } else {
            throw new Error("No source latch assigned.");
        }
    }

    /**
     * The line's source latch.
     */
    public set source(latch: Latch | null) {
        this.setSource(latch);
    }

    /**
     * The line's source object.
     */
    public get sourceObject(): DiagramObject | null {
        return this.source.anchor?.parent ?? null;
    }

    /**
     * The line's target latch.
     */
    public get target(): Latch {
        if (this._targetLatch) {
            return this._targetLatch;
        } else {
            throw new Error("No target latch assigned.");
        }
    }

    /**
     * The line's target latch.
     */
    public set target(latch: Latch | null) {
        this.setTarget(latch);
    }

    /**
     * The line's target object.
     */
    public get targetObject(): DiagramObject | null {
        return this.target.anchor?.parent ?? null;
    }

    /**
     * The line's source latch.
     * @remarks
     *  Provides direct access to the source latch without null checks.
     */
    public get rawSourceLatch(): Latch | null {
        return this._sourceLatch;
    }

    /**
     * The line's target latch.
     * @remarks
     *  Provides direct access to the target latch without null checks.
     */
    public get rawTargetLatch(): Latch | null {
        return this._targetLatch;
    }

    /**
     * The line's handles.
     */
    public get handles(): ReadonlyArray<Handle> {
        return this._handles;
    }


    /**
     * Creates a new {@link Line}.
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
        this._sourceLatch = null;
        this._targetLatch = null;
        this._handles = [];
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Add / Remove Handles  //////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Sets the line's source latch.
     * @param latch
     *  The line's source latch.
     * @param update
     *  Whether to update the diagram or not.
     *  (Default: `false`)
     */
    public setSource(latch: Latch | null, update: boolean = false) {
        // Set latch
        if (this._sourceLatch) {
            this.makeChild(this._sourceLatch, null);
        }
        if (latch) {
            this.makeChild(latch);
        }
        this._sourceLatch = latch;
        // Update layout
        if (update) {
            const reason = latch ?
                ModelUpdateReason.ObjectAdded :
                ModelUpdateReason.ObjectRemoved;
            this.handleUpdate(reason);
        }
    }

    /**
     * Sets the line's target latch.
     * @param latch
     *  The line's target latch.
     * @param update
     *  Whether to update the diagram or not.
     *  (Default: `false`)
     */
    public setTarget(latch: Latch | null, update: boolean = false) {
        // Set latch
        if (this._targetLatch) {
            this.makeChild(this._targetLatch, null);
        }
        if (latch) {
            this.makeChild(latch);
        }
        this._targetLatch = latch;
        // Update layout
        if (update) {
            const reason = latch ?
                ModelUpdateReason.ObjectAdded :
                ModelUpdateReason.ObjectRemoved;
            this.handleUpdate(reason);
        }
    }

    /**
     * Adds a handle to the line.
     * @param handle
     *  The line's {@link Handle}.
     * @param update
     *  Whether to update the diagram or not.
     *  (Default: `false`)
     */
    public addHandle(handle: Handle, update: boolean = false) {
        // Set handle's parent
        this.makeChild(handle);
        // Add handle
        this._handles.push(handle);
        // Update diagram
        if (update) {
            this.handleUpdate(ModelUpdateReason.ObjectAdded);
        }
    }

    /**
     * Removes a handle from the line.
     * @param branch
     *  The branch's name.
     * @param update
     *  Whether to update the diagram or not.
     *  (Default: `false`)
     */
    public deleteHandle(handle: Handle, update: boolean = false) {
        const index = this._handles.findIndex(
            h => h.instance === handle.instance
        );
        if (-1 < index) {
            // Clear handle's parent
            this.makeChild(handle, null);
            // Remove handle
            this._handles.splice(index, 1);
            // Update diagram
            if (update) {
                this.handleUpdate(ModelUpdateReason.ObjectRemoved);
            }
        }
    }

    /**
     * Removes the handle at `i` and all handles after it.
     * @param i
     *  The starting handle.
     * @param update
     *  Whether to update the diagram or not.
     *  (Default: `false`)
     */
    public dropHandles(i: number, update: boolean = false) {
        for (; i < this._handles.length; i++) {
            this.deleteHandle(this._handles[i], update);
        }
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
     * @returns
     *  A clone of the object.
     */
    public clone(instance?: string, instanceMap?: Map<string, string>): Line {
        // Create clone
        const clone = this.replicateChildrenTo(this.isolatedClone(instance), instanceMap);
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
    public isolatedClone(instance?: string): Line {
        return new Line(
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
     * @param instanceMap
     *  An empty map that, if provided, will be populated with object instance
     *  ID to clone instance ID associations.
     * @returns
     *  The provided `object`.
     */
    protected replicateChildrenTo<T extends Line>(object: T, instanceMap?: Map<string, string>): T {
        // Clone handles
        for (const handle of this.handles) {
            object.addHandle(handle.clone(undefined, instanceMap));
        }
        // Clone latches
        if (this._sourceLatch) {
            object.setSource(this.source.clone(undefined, instanceMap));
        }
        if (this._targetLatch) {
            object.setTarget(this.target.clone(undefined, instanceMap));
        }
        return object;
    }

}

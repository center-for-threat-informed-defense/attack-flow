import { DiagramObject } from "../DiagramObject";
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
        if (this._sourceLatch) {
            this.makeChild(this._sourceLatch, null);
        }
        if (latch) {
            this.makeChild(latch);
        }
        this._sourceLatch = latch;
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
        if (this._targetLatch) {
            this.makeChild(this._targetLatch, null);
        }
        if (latch) {
            this.makeChild(latch);
        }
        this._targetLatch = latch;
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
     * Adds a handle to the line.
     * @param handle
     *  The line's {@link Handle}.
     */
    public addHandle(handle: Handle) {
        // Set handle's parent
        this.makeChild(handle);
        // Add handle
        this._handles.push(handle);
    }

    /**
     * Removes a handle from the line.
     * @param branch
     *  The branch's name.
     */
    public deleteHandle(handle: Handle) {
        const index = this._handles.findIndex(
            h => h.instance === handle.instance
        );
        if (-1 < index) {
            // Clear handle's parent
            this.makeChild(handle, null);
            // Remove handle
            this._handles.splice(index, 1);
        }
    }

}

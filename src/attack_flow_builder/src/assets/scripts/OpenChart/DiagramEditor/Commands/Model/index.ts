import {
    AddGroupToGroup,
    AddObjectToGroup,
    AttachLatchToAnchor,
    DetachLatchFromAnchor,
    RemoveObjectFromGroup
} from "./index.commands";
import type { Latch, Anchor, DiagramObject, Group } from "@OpenChart/DiagramModel";

///////////////////////////////////////////////////////////////////////////////
//  1. Anchors  ///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Attaches a latch to an anchor.
 * @param latch
 *  The latch.
 * @param anchor
 *  The anchor.
 * @returns
 *  A command that represents the action.
 */
export function attachLatchToAnchor(
    latch: Latch, anchor: Anchor
): AttachLatchToAnchor {
    return new AttachLatchToAnchor(latch, anchor);
}

/**
 * Detaches a latch from its anchor.
 * @param object
 *  The latch.
 * @returns
 *  A command that represents the action.
 */
export function detachLatchFromAnchor(
    latch: Latch
): DetachLatchFromAnchor {
    return new DetachLatchFromAnchor(latch);
}


///////////////////////////////////////////////////////////////////////////////
//  2. Groups  ////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Adds a diagram object to a group.
 * @param object
 *  The diagram object.
 * @param group
 *  The group.
 * @returns
 *  A command that represents the action.
 */
export function addObjectToGroup(
    object: DiagramObject, group: Group
): AddObjectToGroup {
    return new AddObjectToGroup(object, group);
}

/**
 * Adds a diagram group to a group.
 * @param sourceGroup
 *  The source group.
 * @param targetGroup
 *  The target group.
 * @returns
 *  A command that represents the action.
 */
export function addGroupToGroup(
    sourceGroup: Group, targetGroup: Group
): AddGroupToGroup {
    return new AddGroupToGroup(sourceGroup, targetGroup);
}

/**
 * Removes one or more objects from their parent object.
 * @remarks
 *  Do NOT perform more than one `RemoveObjectFromGroup` in a single
 *  transaction. If removals are broken into separate requests, their
 *  mutual dependencies can't be determined. This may cause `undo()` and
 *  `redo()` to break as they can no longer reconstruct the objects and
 *  dependencies correctly.
 * @param objects
 *  The objects to remove from their parents.
 * @returns
 *  A command that represents the action.
 */
export function removeObjectFromGroup(
    objects: DiagramObject[]
): RemoveObjectFromGroup {
    return new RemoveObjectFromGroup(objects);
}



import { traverse } from "./Generators";
import { Anchor, Latch } from "../DiagramModel";
import { Line, type DiagramObject } from "../DiagramModel";

/**
 * Returns all external anchors and latches linked to the specified objects.
 * @param objects
 *  The objects to search.
 * @returns
 *  All external anchor/latch pairs.
 */
export function findExternalLinks(objects: DiagramObject[]): [Anchor, Latch][] {
    assertSameImmediateParent(objects);
    // Compile list of all anchors and latches
    const anchors = new Map<string, Anchor>();
    const latches = new Map<string, Latch>();
    for (const object of traverse(objects)) {
        if (object instanceof Anchor) {
            anchors.set(object.instance, object);
        }
        if (object instanceof Latch) {
            latches.set(object.instance, object);
        }
    }
    // Search for external attachments
    const external: [Anchor, Latch][] = [];
    for (const latch of latches.values()) {
        if (latch.anchor && anchors.has(latch.anchor.instance)) {
            external.push([latch.anchor, latch]);
        }
    }
    for (const anchor of anchors.values()) {
        for (const latch of anchor.latches) {
            if (!latches.has(latch.instance)) {
                external.push([anchor, latch]);
            }
        }
    }
    return external;
}

/**
 * Expands a selection of objects to include implicitly selected objects.
 * @param objects
 *  The objects.
 * @returns
 *  The expanded selection of objects.
 */
export function findImplicitSelection(objects: DiagramObject[]): DiagramObject[] {
    // Define explicit selection
    const selection = new Map(objects.map(o => [o.instance, o]));
    // Search for implicitly selected lines
    const lines = new Map<string, Line>();
    for (const object of traverse(objects)) {
        // Resolve latches
        let latches: Iterable<Latch>;
        if (object instanceof Anchor) {
            latches = object.latches;
        } else if (object instanceof Latch) {
            latches = [object];
        } else {
            continue;
        }
        // For every latch...
        for (const latch of latches) {
            const parent = latch.parent;
            if (!(parent instanceof Line)) {
                continue;
            }
            // If we discover a line...
            if (!lines.has(parent.instance)) {
                // ...add it to lines
                lines.set(parent.instance, parent);
            }
            // If we encounter the same line again,
            // it must be connected on both ends...
            else {
                // ...add it to the current selection
                selection.set(parent.instance, parent);
                lines.delete(parent.instance);
            }
        }
    }
    // Return selection
    return [...selection.values()];
}

/**
 * Assets that all `objects` share the same immediate parent.
 * @param objects
 *  The objects to evaluate.
 */
function assertSameImmediateParent(objects: DiagramObject[]) {
    if (!objects.length) {
        return;
    }
    // Validate parent
    let parentId: string;
    if (objects[0].parent) {
        parentId = objects[0].parent.instance;
    } else {
        throw new Error("All objects must have a parent.");
    }
    // Validate same origin
    for (const object of objects) {
        if (parentId !== object.parent?.instance) {
            continue;
        }
        throw new Error("All objects must belong to the same parent.");
    }
}

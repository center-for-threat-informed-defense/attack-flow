import { Block, DiagramObject, Group, Line } from "../DiagramObject";

/**
 * Traverses the provided objects in a breadth-first fashion.
 * @param objects
 *  The objects to traverse.
 * @param match
 *  A predicate which is applied to each object. If the predicate returns
 *  false, the object is not included in the enumeration.
 * @returns
 *  The provided object and all child objects.
 */
export function *traverse<T extends DiagramObject>(
    objects: T | T[], match?: (obj: T) => boolean
): Generator<T> {
    const visited = new Set<string>();
    // Prepare queue
    const queue: T[] = [];
    if (!Array.isArray(objects)) {
        queue.push(objects);
        visited.add(objects.instance);
    } else {
        for (const object of objects) {
            if (!visited.has(object.instance)) {
                visited.add(object.instance);
                queue.push(object as T);
            }
        }
    }
    // Iterate
    while (queue.length != 0) {
        const obj = queue.shift()!;
        // Yield object
        if (!match || match(obj)) {
            yield obj;
        }
        let children: Iterable<DiagramObject>;
        if (obj instanceof Group) {
            children = obj.objects;
        } else if (obj instanceof Block) {
            children = obj.anchors.values();
        } else if (obj instanceof Line) {
            children = [obj.source, obj.target, ...obj.handles];
        } else {
            continue;
        }
        // Enumerate children
        for (const child of children) {
            if (!visited.has(child.instance)) {
                visited.add(child.instance);
                queue.push(child as T);
            }
        }
    }
}

/**
 * Traverses the provided objects in a depth-first fashion.
 * @param objects
 *  The objects to traverse.
 * @param match
 *  A predicate which is applied to each object. If the predicate returns
 *  false, the object is not included in the enumeration.
 * @returns
 *  The provided object and all child objects.
 */
export function *traverseDFS<T extends DiagramObject>(
    objects: T | T[], match?: (obj: T) => boolean
): Generator<T> {
    const visited = new Set<string>();
    // Prepare queue
    const stack: T[] = [];
    if (!Array.isArray(objects)) {
        stack.push(objects);
    } else {
        for (const object of objects) {
            if (!visited.has(object.instance)) {
                stack.push(object as T);
            }
        }
    }
    // Iterate
    while (stack.length) {
        const obj = stack.pop()!;
        // Yield object
        if (!match || match(obj)) {
            yield obj;
        }
        if (visited.has(obj.instance)) {
            continue;
        }
        visited.add(obj.instance);
        let children: Iterable<DiagramObject>;
        if (obj instanceof Group) {
            children = obj.objects;
        } else if (obj instanceof Block) {
            children = obj.anchors.values();
        } else if (obj instanceof Line) {
            children = [obj.source, obj.target, ...obj.handles];
        } else {
            continue;
        }
        // Enumerate children
        for (const child of children) {
            if (!visited.has(child.instance)) {
                stack.push(child as T);
            }
        }
    }
}

/**
 * Traverses the provided objects in a postfix fashion.
 * @param objects
 *  The objects to traverse.
 * @param match
 *  A predicate which is applied to each object. If the predicate returns
 *  false, the object is not included in the enumeration.
 * @returns
 *  The provided object and all child objects.
 */
export function *traversePostfix<T extends DiagramObject>(
    objects: T | Iterable<T>, match?: (obj: T) => boolean
): Generator<T> {
    const obj = objects;
    let children: Iterable<T> = [];
    if (Array.isArray(obj)) {
        children = obj;
    } else if (obj instanceof Group) {
        children = obj.objects as Iterable<T>;
    } else if (obj instanceof Block) {
        children = obj.anchors.values() as Iterable<T>;
    } else if (obj instanceof Line) {
        children = [obj.source, obj.target, ...obj.handles] as Iterable<T>;
    }
    for (const child of children) {
        yield *traversePostfix<T>(child);
    }
    if (!(obj instanceof DiagramObject)) {
        return;
    }
    if (!match || match(obj)) {
        yield obj;
    }
}

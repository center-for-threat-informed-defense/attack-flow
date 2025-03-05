import type { Primitives } from "./Primitives";
import type { MergeObject } from "./MergeObject";

/**
 * Merges object `src` into `dst`.
 * @param src
 *  The source object.
 * @param dst
 *  The destination object.
 * @returns
 *  The destination object.
 */
export function merge<K extends MergeObject, T extends MergeObject>(src: K, dst: T): T {
    for (const key in src) {
        // Validate value
        if (src[key] === undefined) {
            continue;
        }
        // Validate overlap
        if (!(key in dst)) {
            throw new Error("Objects do not overlap.");
        }
        // Validate types
        const srcType = src[key]?.constructor;
        const dstType = dst[key]?.constructor;
        if (srcType !== dstType) {
            throw new Error(`'${key}' has mismatching types.`);
        }
        // Traverse
        if (srcType === Object) {
            merge(
                src[key] as MergeObject,
                dst[key] as MergeObject
            );
        } else {
            (dst[key] as unknown as Primitives) = src[key] as Primitives;
        }
    }
    return dst;
}

import { DoNothing } from "./DoNothing";

export * from "./Command";
export * from "./AppCommand";
export * from "./FileManagement";
export * from "./DiagramModelEditor";
export * from "./DiagramViewEditor";
export * from "./ApplicationSettings";
export * from "./ViewManagement";

/**
 * Does nothing.
 * @returns
 *  A command that represents the action.
 */
export function doNothing() {
    return new DoNothing();
}

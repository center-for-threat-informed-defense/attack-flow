import type { Primitives } from "./Primitives";

export type MergeObject = { [key: string]: Primitives | Primitives[] | MergeObject };

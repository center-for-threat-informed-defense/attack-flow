import type { Hotkey } from "@/assets/scripts/HotkeyObserver";
import type { PageEditor } from "../PageEditor";
import type { CommandEmitter } from "../Commands/Command";
import type { DiagramObjectModel } from "@/assets/scripts/BlockDiagram";

/**
 * Vue's reactivity system unwraps Pinia's type definitions. However, it only
 * unwraps publicly exposed members. This prevents a class from being passed
 * around to functions that expect the defined type definition (private members
 * and all). {@link https://github.com/vuejs/core/issues/2981}
 *
 * Until this problem is resolved, vital application types will not be
 * unwrapped.
 */
declare module "@vue/reactivity" {
    export interface RefUnwrapBailTypes {
        classes: PageEditor | DiagramObjectModel | Hotkey<CommandEmitter>;
    }
}

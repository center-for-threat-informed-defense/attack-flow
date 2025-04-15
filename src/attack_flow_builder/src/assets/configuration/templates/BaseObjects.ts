import { DiagramObjectType } from "@OpenChart/DiagramModel";
import type { DiagramObjectTemplate } from "@OpenChart/DiagramModel";

export const BaseObjects: DiagramObjectTemplate[] = [
    {
        name: "dynamic_line",
        namespace: ["dynamic_line"],
        type: DiagramObjectType.Line,
        latch_template: {
            source: "generic_latch",
            target: "generic_latch"
        },
        handle_template: "generic_handle"
    },
    {
        name: "vertical_anchor",
        type: DiagramObjectType.Anchor
    },
    {
        name: "horizontal_anchor",
        type: DiagramObjectType.Anchor
    },
    {
        name: "generic_latch",
        type: DiagramObjectType.Latch
    },
    {
        name: "generic_handle",
        type: DiagramObjectType.Handle
    }
];

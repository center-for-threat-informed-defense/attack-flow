import type { FaceType } from "./FaceType";
import type {
    AnchorTemplate,
    BlockTemplate,
    CanvasTemplate,
    GroupTemplate,
    HandleTemplate,
    LatchTemplate,
    LineTemplate
} from "@OpenChart/DiagramModel";

export type TypeToTemplate = {
    [FaceType.AnchorPoint]: AnchorTemplate;
    [FaceType.BranchBlock]: BlockTemplate;
    [FaceType.DictionaryBlock]: BlockTemplate;
    [FaceType.DynamicLine]: LineTemplate;
    [FaceType.HandlePoint]: HandleTemplate;
    [FaceType.LatchPoint]: LatchTemplate;
    [FaceType.Group]: GroupTemplate;
    [FaceType.TextBlock]: BlockTemplate;
    [FaceType.LineGridCanvas]: CanvasTemplate;
    [FaceType.DotGridCanvas]: CanvasTemplate;
};

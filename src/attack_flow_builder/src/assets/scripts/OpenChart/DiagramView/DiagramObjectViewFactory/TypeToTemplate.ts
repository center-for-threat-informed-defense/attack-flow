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
    [FaceType.HandlePoint]: HandleTemplate;
    [FaceType.HorizontalElbowLine]: LineTemplate;
    [FaceType.LatchPoint]: LatchTemplate;
    [FaceType.Group]: GroupTemplate;
    [FaceType.TextBlock]: BlockTemplate;
    [FaceType.VerticalElbowLine]: LineTemplate;
    [FaceType.LineGridCanvas]: CanvasTemplate;
    [FaceType.DotGridCanvas]: CanvasTemplate;
};

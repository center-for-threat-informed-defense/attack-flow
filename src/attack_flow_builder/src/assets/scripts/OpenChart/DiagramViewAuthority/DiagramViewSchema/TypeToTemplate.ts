import type { FaceType } from "./FaceType";
import type { AnchorTemplate, BlockTemplate, GroupTemplate, HandleTemplate, LatchTemplate, LineTemplate } from "../../DiagramModelAuthority";

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
};

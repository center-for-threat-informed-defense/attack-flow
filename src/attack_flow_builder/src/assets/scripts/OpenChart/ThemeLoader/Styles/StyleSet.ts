import type {
    BranchBlockStyleConfiguration,
    CanvasStyleConfiguration,
    DictionaryBlockStyleConfiguration,
    LineStyleConfiguration,
    PointStyleConfiguration,
    TextBlockStyleConfiguration
} from "../ThemeConfigurations";

export type StyleSet = {
    blockBranch: BranchBlockStyleConfiguration;
    blockDictionary: DictionaryBlockStyleConfiguration;
    blockText: TextBlockStyleConfiguration;
    point: PointStyleConfiguration;
    line: LineStyleConfiguration;
    canvas: CanvasStyleConfiguration;
};

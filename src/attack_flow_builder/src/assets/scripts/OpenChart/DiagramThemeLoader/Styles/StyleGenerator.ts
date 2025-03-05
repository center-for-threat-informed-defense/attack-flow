import { merge } from "../../Utilities";
import type { StyleSet } from "./StyleSet";
import type { DeepPartial } from "../TypeHelpers";
import type {
    BranchBlockStyleConfiguration,
    CanvasStyleConfiguration,
    DictionaryBlockStyleConfiguration,
    LineStyleConfiguration,
    PointStyleConfiguration,
    TextBlockStyleConfiguration
} from "../ThemeConfigurations";

export class StyleGenerator {

    /**
     * The generator's style set.
     */
    private readonly styles: StyleSet;


    /**
     * Creates a new {@link StyleGenerator}.
     * @param style
     *  The generator's style set.
     */
    public constructor(style: StyleSet) {
        this.styles = style;
    }


    /**
     * Returns the branch block style.
     * @param style
     *  The style parameters.
     *  (Default: {})
     * @returns
     *  The branch block style.
     */
    public BranchBlock(
        style: DeepPartial<BranchBlockStyleConfiguration> = {}
    ): BranchBlockStyleConfiguration {
        return merge(style, structuredClone(this.styles.blockBranch));
    }

    /**
     * Returns the dictionary block style.
     * @param style
     *  The style parameters.
     *  (Default: {})
     * @returns
     *  The dictionary block style.
     */
    public DictionaryBlock(
        style: DeepPartial<DictionaryBlockStyleConfiguration> = {}
    ): DictionaryBlockStyleConfiguration {
        return merge(style, structuredClone(this.styles.blockDictionary));
    }


    /**
     * Returns the text block style.
     * @param style
     *  The style parameters.
     *  (Default: {})
     * @returns
     *  The text block style.
     */
    public TextBlock(
        style: DeepPartial<TextBlockStyleConfiguration> = {}
    ): TextBlockStyleConfiguration {
        return merge(style, structuredClone(this.styles.blockText));
    }

    /**
     * Returns the point style.
     * @param style
     *  The style parameters.
     *  (Default: {})
     * @returns
     *  The point style.
     */
    public Point(
        style: DeepPartial<PointStyleConfiguration> = {}
    ): PointStyleConfiguration {
        return merge(style, structuredClone(this.styles.point));
    }

    /**
     * Returns the line style.
     * @param style
     *  The style parameters.
     *  (Default: {})
     * @returns
     *  The line style.
     */
    public Line(
        style: DeepPartial<LineStyleConfiguration> = {}
    ): LineStyleConfiguration {
        return merge(style, structuredClone(this.styles.line));
    }

    /**
     * Returns the canvas style.
     * @param style
     *  The style parameters.
     *  (Default: {})
     * @returns
     *  The canvas style.
     */
    public Canvas(
        style: DeepPartial<CanvasStyleConfiguration> = {}
    ): CanvasStyleConfiguration {
        return merge(style, structuredClone(this.styles.canvas));
    }

}

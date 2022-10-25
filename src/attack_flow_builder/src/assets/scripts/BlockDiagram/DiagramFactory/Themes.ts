import { 
    SerializedAnchorPointStyle,
    SerializedBranchBlockStyle,
    SerializedDictionaryBlockStyle,
    SerializedLineEndingPointStyle,
    SerializedLineHandlePointStyle,
    SerializedLineStyle,
    SerializedTextBlockStyle,
    SerializedPageStyle
} from "..";


///////////////////////////////////////////////////////////////////////////////
//  1. Colors  ////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export const Colors = {
    Blue   : { fill_color: "#637bc9", stroke_color: "#708ce6" },
    Orange : { fill_color: "#c26130", stroke_color: "#e57339" },
    Green  : { fill_color: "#2a9642", stroke_color: "#32b34e" },
    Red    : { fill_color: "#c94040", stroke_color: "#dd5050" },
    Gray   : { fill_color: "#737373", stroke_color: "#8c8c8c" }
}


///////////////////////////////////////////////////////////////////////////////
//  2. Block Diagram Theme  ///////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


class BlockDiagramTheme {

    /**
     * The theme definition.
     */
    private readonly _theme: Theme

    
    /**
     * Creates a new {@link Theme}.
     * @param theme
     *  The theme definition.
     */
    public constructor(theme: Theme) {
        this._theme = theme;
    }


    /**
     * Returns the anchor point style.
     * @param style
     *  The style parameters.
     *  (Default: {}) 
     * @returns
     *  The anchor point style.
     */
    public AnchorPoint(
        style: DeepPartial<SerializedAnchorPointStyle> = {}
    ): SerializedAnchorPointStyle {
        return this.merge(style, structuredClone(this._theme.anchor));
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
        style: DeepPartial<SerializedBranchBlockStyle> = {}
    ): SerializedBranchBlockStyle {
        return this.merge(style, structuredClone(this._theme.branch));
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
        style: DeepPartial<SerializedDictionaryBlockStyle> = {}
    ): SerializedDictionaryBlockStyle {
        return this.merge(style, structuredClone(this._theme.dictionary));
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
        style: DeepPartial<SerializedLineStyle> = {}
    ): SerializedLineStyle {
        return this.merge(style, structuredClone(this._theme.line));
    }

    /**
     * Returns the line ending style.
     * @param style
     *  The style parameters.
     *  (Default: {}) 
     * @returns
     *  The line ending style.
     */
    public LineEnding(
        style: DeepPartial<SerializedLineEndingPointStyle> = {}
    ): SerializedLineEndingPointStyle {
        return this.merge(style, structuredClone(this._theme.lineEnding));
    }

    /**
     * Returns the line handle style.
     * @param style
     *  The style parameters.
     *  (Default: {}) 
     * @returns
     *  The line handle style.
     */
    public LineHandle(
        style: DeepPartial<SerializedLineHandlePointStyle> = {}
    ): SerializedLineHandlePointStyle {
        return this.merge(style, structuredClone(this._theme.lineHandle));
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
        style: DeepPartial<SerializedTextBlockStyle> = {}
    ): SerializedTextBlockStyle {
        return this.merge(style, structuredClone(this._theme.text));
    }

    /**
     * Returns the page style.
     * @param style
     *  The style parameters.
     *  (Default: {}) 
     * @returns
     *  The page style.
     */
    public Page(
        style: DeepPartial<SerializedPageStyle> = {}
    ): SerializedPageStyle {
        return this.merge(style, structuredClone(this._theme.page));
    }

    /**
     * Merges object `src` into `dst`.
     * @param src
     *  The source object.
     * @param dst
     *  The destination object.
     * @returns
     *  The destination object.
     */
    private merge<T>(src: T, dst: T) {
        for(let key in src) {
            if(!(key in dst)) {
                throw new Error("Objects do not overlap.");
            }
            if(typeof src[key] !== typeof dst[key]) {
                throw new Error(`'${ key }' has mismatching types.`);
            }

            if(typeof src[key] === "object") {
                this.merge(src[key], dst[key]);
            } else {
                dst[key] = src[key];
            }
        }
        return dst;
    }

}


///////////////////////////////////////////////////////////////////////////////
//  3. Themes  ////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Theme definition.
 */
type Theme = {
    anchor: SerializedAnchorPointStyle,
    branch: SerializedBranchBlockStyle,
    dictionary: SerializedDictionaryBlockStyle,
    line: SerializedLineStyle,
    lineEnding: SerializedLineEndingPointStyle,
    lineHandle: SerializedLineHandlePointStyle,
    text: SerializedTextBlockStyle,
    page: SerializedPageStyle,
}

/**
 * Dark Theme
 */
export const DarkTheme = new BlockDiagramTheme({

    anchor: {
        color: "rgba(255, 255, 255, 0.25)"
    },

    branch: {
        max_width: 320,
        head: {
            fill_color: "#000",
            stroke_color: "#000",
            one_title: {
                title: {
                    font: { family: "Inter", size: "10.5pt", weight: 800 },
                    color: "#d8d8d8"
                }
            },
            two_title: {
                title: {
                    font: { family: "Inter", size: "8pt", weight: 600 },
                    color: "#d8d8d8",
                    padding: 8
                },
                subtitle:  {
                    font: { family: "Inter", size: "13pt", weight: 800 },
                    color: "#d8d8d8",
                    line_height: 23
                }
            },
            vertical_padding: 14
        },
        body: {
            fill_color: "#1f1f1f",
            stroke_color: "#383838",
            field_name: {
                font: { family: "Inter", size: "8pt", weight: 600 },
                color: "#b3b3b3",
                padding: 12
            },
            field_value: {
                font: { family: "Inter", size: "10.5pt" },
                color: "#bfbfbf",
                line_height: 20,
                padding: 22
            },
            vertical_padding: 18
        },
        branch: {
            font: { family: "Inter", size: "10.5pt" },
            color: "#bfbfbf",
            vertical_padding: 12,
            horizontal_padding: 30
        },
        select_outline: {
            color: "#e6d845",
            padding: 4,
            border_radius: 9
        },
        anchor_markers: {
            color: "#ffffff",
            size: 3
        },
        border_radius: 5,
        horizontal_padding: 20
    },

    dictionary: {
        max_width: 320,
        head: {
            fill_color: "#000",
            stroke_color: "#000",
            one_title: {
                title: {
                    font: { family: "Inter", size: "10.5pt", weight: 800 },
                    color: "#d8d8d8"
                }
            },
            two_title: {
                title: {
                    font: { family: "Inter", size: "8pt", weight: 600 },
                    color: "#d8d8d8",
                    padding: 8
                },
                subtitle:  {
                    font: { family: "Inter", size: "13pt", weight: 800 },
                    color: "#d8d8d8",
                    line_height: 23
                }
            },
            vertical_padding: 14
        },
        body: {
            fill_color: "#1f1f1f",
            stroke_color: "#383838",
            field_name: {
                font: { family: "Inter", size: "8pt", weight: 600 },
                color: "#b3b3b3",
                padding: 12
            },
            field_value: {
                font: { family: "Inter", size: "10.5pt" },
                color: "#bfbfbf",
                line_height: 20,
                padding: 22
            },
            vertical_padding: 18
        },
        select_outline: {
            color: "#e6d845",
            padding: 4,
            border_radius: 9
        },
        anchor_markers: {
            color: "#ffffff",
            size: 3
        },
        border_radius: 5,
        horizontal_padding: 20
    },

    line: {
        width: 5,
        cap_size: 16,
        color: "#646464",
        select_color: "#646464"
    },
    
    lineEnding: {
        radius: 6,
        fill_color: "#fedb22",
        stroke_color: "#141414",
        stroke_width: 1.5
    },

    lineHandle: {
        radius: 6,
        fill_color: "#fedb22",
        stroke_color: "#141414",
        stroke_width: 1.5
    },

    text: {
        max_width: 320,
        fill_color: "#000",
        stroke_color: "#000",
        text: {
            font: { family: "Inter", size: "14pt", weight: 800 },
            color: "#d8d8d8",
            line_height: 24
        },
        border_radius: 13,
        select_outline: {
            color: "#e6d845",
            padding: 4,
            border_radius: 19
        },
        anchor_markers: {
            color: "#ffffff",
            size: 3
        },
        vertical_padding: 18,
        horizontal_padding: 20
    },

    page: {
        grid_color: "#1d1d1d",
        background_color: "#141414",
        drop_shadow: {
            color: "rgba(0,0,0,.4)",
            offset: [3, 3]
        }
    },
    
});


///////////////////////////////////////////////////////////////////////////////
//  4. Type Helpers  //////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Recursive version of Partial<T>.
 */
type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;

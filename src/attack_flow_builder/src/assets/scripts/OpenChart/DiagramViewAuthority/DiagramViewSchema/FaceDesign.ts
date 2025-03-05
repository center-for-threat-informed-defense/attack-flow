import type { FaceType } from "./FaceType";
import type {
    BranchBlockStyle,
    DictionaryBlockStyle,
    LineStyle,
    PointStyle,
    TextBlockStyle
} from "../../DiagramView";


///////////////////////////////////////////////////////////////////////////////
//  1. Base Design  ///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * The base design upon which all others are based.
 */
export type BaseDesign<T extends FaceType> = {

    /**
     * The design's type.
     */
    type: T;

    /**
     * The design's attributes.
     */
    attributes: number;

};


///////////////////////////////////////////////////////////////////////////////
//  2. Object Designs  ////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Branch Block Design
 */
export type BranchBlockDesign = BaseDesign<FaceType.BranchBlock> & {

    /**
     * The block's style.
     */
    style: BranchBlockStyle;

};

/**
 * Dictionary Block Design
 */
export type DictionaryBlockDesign = BaseDesign<FaceType.DictionaryBlock> & {

    /**
     * The block's style.
     */
    style: DictionaryBlockStyle;

};

/**
 * Text Block Design
 */
export type TextBlockDesign = BaseDesign<FaceType.TextBlock> & {

    /**
     * The block's style.
     */
    style: TextBlockStyle;

};

/**
 * Line Design
 */
export type LineDesign = BaseDesign<
    FaceType.HorizontalElbowLine | FaceType.VerticalElbowLine
> & {

    /**
     * The line's style.
     */
    style: LineStyle;

};

/**
 * Point Design
 */
export type PointDesign = BaseDesign<
    FaceType.AnchorPoint | FaceType.HandlePoint | FaceType.LatchPoint
> & {

    /**
     * The point's style.
     */
    style: PointStyle;

};

/**
 * Group Design
 */
export type GroupDesign = BaseDesign<FaceType.Group>;


///////////////////////////////////////////////////////////////////////////////
//  3. Object Style  //////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Face Style
 */
export type FaceDesign
    = BranchBlockDesign
    | DictionaryBlockDesign
    | LineDesign
    | GroupDesign
    | PointDesign
    | TextBlockDesign;

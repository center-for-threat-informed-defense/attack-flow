import type { FaceType } from "./FaceType";
import type {
    BranchBlockStyle,
    CanvasStyle,
    DictionaryBlockStyle,
    Enumeration,
    LineStyle,
    PointStyle,
    TextBlockStyle
} from "../DiagramObjectView";


///////////////////////////////////////////////////////////////////////////////
//  1. Base Design  ///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * The base face design upon which all others are based.
 */
export type BaseFaceDesign<T extends FaceType> = {

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
export type BranchBlockDesign = BaseFaceDesign<FaceType.BranchBlock> & {

    /**
     * The properties display.
     */
    properties?: Enumeration;

    /**
     * The block's style.
     */
    style: BranchBlockStyle;

};

/**
 * Dictionary Block Design
 */
export type DictionaryBlockDesign = BaseFaceDesign<FaceType.DictionaryBlock> & {

    /**
     * The properties display.
     */
    properties?: Enumeration;

    /**
     * The block's style.
     */
    style: DictionaryBlockStyle;

};

/**
 * Text Block Design
 */
export type TextBlockDesign = BaseFaceDesign<FaceType.TextBlock> & {

    /**
     * The properties display.
     */
    properties?: Enumeration;

    /**
     * The block's style.
     */
    style: TextBlockStyle;

};

/**
 * Line Design
 */
export type LineDesign = BaseFaceDesign<FaceType.DynamicLine> & {

    /**
     * The line's style.
     */
    style: LineStyle;

};

/**
 * Point Design
 */
export type PointDesign = BaseFaceDesign<
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
export type GroupDesign = BaseFaceDesign<FaceType.Group>;

/**
 * Canvas Design
 */
export type CanvasDesign = BaseFaceDesign<
    FaceType.LineGridCanvas | FaceType.DotGridCanvas
> & {
    
    /**
     * The canvas's style.
     */
    style: CanvasStyle;

};


///////////////////////////////////////////////////////////////////////////////
//  3. Object Style  //////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Face Style
 */
export type FaceDesign
    = BranchBlockDesign
    | CanvasDesign
    | DictionaryBlockDesign
    | LineDesign
    | GroupDesign
    | PointDesign
    | TextBlockDesign;

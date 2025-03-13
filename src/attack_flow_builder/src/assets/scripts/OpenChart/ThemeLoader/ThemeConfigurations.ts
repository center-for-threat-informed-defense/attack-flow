import type { Font, FontDescriptor } from "@OpenChart/Utilities";
import type { SubstituteType, ToSnakeCaseKeys } from "./TypeHelpers";
import type {
    BranchBlockStyle, CanvasStyle, DiagramTheme,
    DictionaryBlockStyle, LineStyle, PointStyle,
    TextBlockStyle
} from "@OpenChart/DiagramView";

type toConfiguration<T extends object> = ToSnakeCaseKeys<SubstituteType<T, Font, FontDescriptor>>;

/**
 * Branch Block Style Configuration
 */
export type BranchBlockStyleConfiguration = toConfiguration<BranchBlockStyle>;

/**
 * Dictionary Block Style Configuration
 */
export type DictionaryBlockStyleConfiguration = toConfiguration<DictionaryBlockStyle>;

/**
 * Text Block Style Configuration
 */
export type TextBlockStyleConfiguration = toConfiguration<TextBlockStyle>;

/**
 * Handle Point Style Configuration
 */
export type PointStyleConfiguration = toConfiguration<PointStyle>;

/**
 * Line Style Configuration
 */
export type LineStyleConfiguration = toConfiguration<LineStyle>;

/**
 * Canvas Style Configuration
 */
export type CanvasStyleConfiguration = toConfiguration<CanvasStyle>;

/**
 * Diagram Theme Configuration
 */
export type DiagramThemeConfiguration = toConfiguration<DiagramTheme>;

import type { Font, FontDescriptor } from "../Utilities";
import type { CanvasStyle, DiagramTheme } from "../DiagramViewAuthority";
import type { SubstituteType, ToSnakeCaseKeys } from "./TypeHelpers";
import type { BranchBlockStyle, DictionaryBlockStyle, LineStyle, PageStyle, PointStyle, TextBlockStyle } from "../DiagramView";

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

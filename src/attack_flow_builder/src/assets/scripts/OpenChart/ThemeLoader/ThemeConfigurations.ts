import type { ToSnakeCaseKeys } from "./TypeHelpers";
import type { Font, FontDescriptor } from "@OpenChart/Utilities";
import type { EnumerationDescriptor } from "./EnumerationDescriptor";
import type {
    BranchBlockStyle, CanvasStyle, DiagramTheme, DictionaryBlockStyle,
    Enumeration, LineStyle, PointStyle, TextBlockStyle
} from "@OpenChart/DiagramView";

/**
 * Swaps configuration types.
 */
type toConfigurationTypes<T> =
    T extends Enumeration ? EnumerationDescriptor :
        T extends Font ? FontDescriptor :
            T extends object ? { [K in keyof T]: toConfigurationTypes<T[K]> } :
                T;

/**
 * Configuration type.
 */
type ToConfiguration<T extends object> = ToSnakeCaseKeys<toConfigurationTypes<T>>;

/**
 * Branch Block Style Configuration
 */
export type BranchBlockStyleConfiguration = ToConfiguration<BranchBlockStyle>;

/**
 * Dictionary Block Style Configuration
 */
export type DictionaryBlockStyleConfiguration = ToConfiguration<DictionaryBlockStyle>;

/**
 * Text Block Style Configuration
 */
export type TextBlockStyleConfiguration = ToConfiguration<TextBlockStyle>;

/**
 * Handle Point Style Configuration
 */
export type PointStyleConfiguration = ToConfiguration<PointStyle>;

/**
 * Line Style Configuration
 */
export type LineStyleConfiguration = ToConfiguration<LineStyle>;

/**
 * Canvas Style Configuration
 */
export type CanvasStyleConfiguration = ToConfiguration<CanvasStyle>;

/**
 * Diagram Theme Configuration
 */
export type DiagramThemeConfiguration = ToConfiguration<DiagramTheme>;

import { Device } from "@/assets/scripts/Browser";
import { toSvg } from "html-to-image";
import type { Component } from "vue";
import type { ApplicationStore } from "@/stores/ApplicationStore";

export interface VisualizationRegistration {

    /**
     * The visualization's unique identifier.
     */
    id: string;

    /**
     * The visualization's display title.
     */
    title: string;

    /**
     * The visualization's Vue component.
     */
    component: Component;

    /**
     * A custom name for the exported file.
     */
    exportName?: string | ((app: ApplicationStore) => string);

    /**
     * A custom root for exports.
     */
    getExportRoot?: (root: HTMLElement) => HTMLElement | null;

    /**
     * A custom exporter for the visualization.
     */
    exporter?: VisualizationExporter;

}

export interface VisualizationModalController {

    /**
     * The available visualizations.
     */
    readonly visualizations: readonly VisualizationRegistration[];

    /**
     * Whether the modal is open.
     */
    active: boolean;

    /**
     * The active visualization.
     */
    readonly activeVisualization?: VisualizationRegistration;

    /**
     * Opens a visualization in the modal.
     * @param id
     *  The visualization's identifier.
     */
    open(id: string): void;

    /**
     * Closes the modal.
     */
    close(): void;

}

export interface VisualizationExportContext {

    /**
     * The application store.
     */
    app: ApplicationStore;

    /**
     * The visualization being exported.
     */
    visualization: VisualizationRegistration;

    /**
     * The visualization's rendered root element.
     */
    root: HTMLElement;

}

export type VisualizationExporter = (
    context: VisualizationExportContext
) => Promise<void>;

/**
 * Exports a visualization with either its custom exporter or the default SVG
 * exporter.
 * @param context
 *  The visualization export context.
 */
export async function exportVisualization(
    context: VisualizationExportContext
): Promise<void> {
    const { visualization } = context;
    if (visualization.exporter) {
        await visualization.exporter(context);
    } else {
        await exportVisualizationAsSvg(context);
    }
}

/**
 * Exports a visualization as an SVG file.
 * @param context
 *  The visualization export context.
 */
export async function exportVisualizationAsSvg(
    context: VisualizationExportContext
): Promise<void> {
    const exportRoot = context.visualization.getExportRoot?.(context.root)
        ?? context.root;
    const svgDataUrl = await toSvg(exportRoot, { cacheBust: true });
    Device.downloadTextFile(
        getVisualizationExportName(context),
        svgDataUrlToText(svgDataUrl),
        "svg"
    );
}

/**
 * Resolves the exported file name for a visualization.
 * @param context
 *  The visualization export context.
 * @returns
 *  The export file name without an extension.
 */
function getVisualizationExportName(
    context: VisualizationExportContext
): string {
    const sourceName = context.app.activeEditor.file.canvas.properties.toString()
        || "attack-flow";
    const exportName = typeof context.visualization.exportName === "function"
        ? context.visualization.exportName(context.app)
        : context.visualization.exportName
            ?? context.visualization.title;
    return sanitizeFileName(`${sourceName} - ${exportName}`);
}

/**
 * Converts an SVG data URL into SVG file contents.
 * @param dataUrl
 *  The data URL to decode.
 * @returns
 *  The SVG file contents.
 */
function svgDataUrlToText(dataUrl: string): string {
    const parts = dataUrl.split(",", 2);
    if (parts.length !== 2) {
        throw new Error("Unable to decode SVG export.");
    }
    const [prefix, content] = parts;
    return prefix.includes(";base64")
        ? atob(content)
        : decodeURIComponent(content);
}

/**
 * Removes characters that are unsafe for downloaded file names.
 * @param value
 *  The file name to sanitize.
 * @returns
 *  A safe file name.
 */
function sanitizeFileName(value: string): string {
    return value
        .replace(/[\\/:*?"<>|]+/g, "-")
        .replace(/\s+/g, " ")
        .trim();
}

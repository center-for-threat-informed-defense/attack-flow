import { ViewportRegion } from "@OpenChart/DiagramView";
import type { RenderSettings } from "@OpenChart/DiagramView";

export interface DiagramInterfaceMarkup {

    /**
     * Renders the markup to a context.
     * @param ctx
     *  The context to render to.
     * @param region
     *  The context's viewport.
     * @param settings
     *  The current render settings.
     */
    render(ctx: CanvasRenderingContext2D, region: ViewportRegion, settings: RenderSettings): void;

}

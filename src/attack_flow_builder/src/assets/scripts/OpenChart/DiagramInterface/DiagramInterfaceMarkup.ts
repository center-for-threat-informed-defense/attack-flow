import { type RenderSettings, ViewportRegion } from "../DiagramView";

export interface DiagramInterfaceMarkup {
    render(ctx: CanvasRenderingContext2D, region: ViewportRegion, settings: RenderSettings): void;
}

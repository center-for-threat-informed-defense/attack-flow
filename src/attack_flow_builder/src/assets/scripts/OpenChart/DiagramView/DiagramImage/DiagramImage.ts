import { traverse, TupleProperty, EnumProperty, StringProperty } from "../../DiagramModel";
import { Focus, Hover, ViewportRegion } from "../DiagramObjectView";
import type { CanvasView } from "@OpenChart/DiagramView";
import type { DiagramObjectView, RenderSettings } from "../DiagramObjectView";

export class DiagramImage {

    /**
     * The diagram's canvas.
     */
    private _canvas: CanvasView;

    /**
     * The image's padding.
     */
    private _padding: number;

    /**
     * If shadow's should be displayed or not.
     */
    private _showShadows: boolean;

    /**
     * If debug information should be displayed or not.
     */
    private _showDebug: boolean;

    /**
     * If the background should be included or not.
     */
    private _showBackground: boolean;


    /**
     * Creates a new {@link DiagramImage}.
     * @param canvas
     *  The diagram's canvas.
     * @param padding
     *  The image's padding.
     * @param showShadows
     *  If shadow's should be displayed or not.
     *  (Default: true)
     * @param showDebug
     *  If debug information should be displayed or not.
     *  (Default: false)
     * @param showBackground
     *  If the background should be included or not.
     *  (Default: true)
     */
    constructor(
        canvas: CanvasView,
        padding: number = 30,
        showShadows: boolean = true,
        showDebug: boolean = false,
        showBackground: boolean = true
    ) {
        this._canvas = canvas;
        this._padding = padding;
        this._showShadows = showShadows;
        this._showDebug = showDebug;
        this._showBackground = showBackground;
    }


    /**
     * Returns an image of the page.
     * @returns
     *  The generated image.
     */
    public capture(): HTMLCanvasElement;

    /**
     * Returns an image of the page focused on a region of objects.
     * @param objs
     *  The objects that define the region.
     * @returns
     *  The generated image.
     */
    public capture(objs?: DiagramObjectView[]): HTMLCanvasElement;
    public capture(objs?: DiagramObjectView[]): HTMLCanvasElement {

        // Calculate region
        let box, xMin, yMin, xMax, yMax;
        if (objs?.length) {
            xMin = Infinity;
            yMin = Infinity;
            xMax = -Infinity;
            yMax = -Infinity;
            for (const obj of objs) {
                box = obj.face.boundingBox;
                xMin = Math.min(xMin, box.xMin);
                yMin = Math.min(yMin, box.yMin);
                xMax = Math.max(xMax, box.xMax);
                yMax = Math.max(yMax, box.yMax);
            }
        } else {
            box = this._canvas.face.boundingBox;
            xMin = box.xMin;
            yMin = box.yMin;
            xMax = box.xMax;
            yMax = box.yMax;
        }

        // Configure canvas
        const can = document.createElement("canvas");
        can.width  = Math.round(xMax - xMin) + (this._padding * 2);
        can.height = Math.round(yMax - yMin) + (this._padding * 2);

        // Configure context
        const ctx = can.getContext("2d")!;
        ctx.setTransform(
            1, 0, 0, 1,
            -xMin + this._padding,
            -yMin + this._padding
        );

        // Configure viewport
        const viewport = new ViewportRegion();
        viewport.xMin = xMin - this._padding;
        viewport.yMin = yMin - this._padding;
        viewport.xMax = xMax + this._padding;
        viewport.yMax = yMax + this._padding;

        // Cache and clear visual attributes
        const attrCache = new Map<DiagramObjectView, number>();
        const attrObjs = traverse<DiagramObjectView>(this._canvas,
            o => o.focused || o.hovered !== Hover.Off
        );
        for (const obj of attrObjs) {
            attrCache.set(obj, obj.attributes);
            obj.focused = Focus.False;
            obj.hovered = Hover.Off;
        }

        // Configure render settings
        const settings: RenderSettings = {
            shadowsEnabled: this._showShadows,
            animationsEnabled: false
        };

        // Render image
        if (this._showBackground) {
            this._canvas.renderSurfaceTo(ctx, viewport);
        }
        this._canvas.renderTo(ctx, viewport, settings);
        if (this._showDebug) {
            this._canvas.renderDebugTo(ctx, viewport);
        }


        // Add classification markings to image export
        const classification = this._canvas.properties.get<TupleProperty>("classification");
        const marking = classification?.get<EnumProperty>("marking");
        const group = classification?.get<StringProperty>("group");
        if (marking?.value) {
            const markingText = marking?.toString() ?? null;
            const groupText = group?.value ?? null;
            const fullText = groupText ? `${markingText} - ${groupText}` : markingText;

            // Reset transform to draw in image space
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);

            // Styling similar to classification markings in AppTitleBar.vue. Change both together.
            ctx.textBaseline = "top";
            const paddingX = 5;
            const paddingY = 2;
            const metrics = ctx.measureText(fullText);
            const textWidth = metrics.width;
            const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
            const rectWidth = Math.ceil(textWidth + paddingX * 2);
            const rectHeight = Math.ceil(textHeight + paddingY * 2);
            const rectX = Math.round((can.width - rectWidth) / 2);
            const rectY = 0;
            // Background
            ctx.fillStyle = "#000000";
            ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
            // Text color based on marking key
            let textColor = "#FFFFFF";
            switch (markingText) {
                case "TLP:RED":
                    textColor = "#FF2B2B";
                    break;
                case "TLP:AMBER":
                case "TLP:AMBER+STRICT":
                    textColor = "#FFC000";
                    break;
                case "TLP:GREEN":
                    textColor = "#33FF00";
                    break;
            }
            ctx.fillStyle = textColor;
            ctx.fillText(fullText, rectX + paddingX, rectY + paddingY);
            ctx.restore();
        }

        // Restore visual attributes
        for (const [obj, attrs] of attrCache) {
            obj.attributes = attrs;
        }

        // Return image
        return can;

    }

}

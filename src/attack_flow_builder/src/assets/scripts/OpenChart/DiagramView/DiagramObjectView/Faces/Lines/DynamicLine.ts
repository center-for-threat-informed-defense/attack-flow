import { LineFace } from "../Bases";
import { Orientation } from "../../ViewAttributes";
import { findUnlinkedObjectAt } from "../../ViewLocators";
import { 
    doRegionsOverlap,
    drawAbsoluteMultiElbowPath,
    drawAbsolutePolygon,
    drawBoundingRegion,
    getAbsoluteArrowHead,
    isInsideRegion
} from "@OpenChart/Utilities";
import {
    runHorizontalElbowLayout,
    runHorizontalTwoElbowLayout,
    runVerticalElbowLayout,
    runVerticalTwoElbowLayout
} from "./LineLayoutStrategies";
import type { LineStyle } from "../Styles";
import type { BoundingBox } from "../BoundingBox";
import type { ViewportRegion } from "../../ViewportRegion";
import type { RenderSettings } from "../../RenderSettings";
import type { DiagramObjectView } from "../../Views";
import type { LayoutStrategyMap } from "./LayoutMap";
import type { GenericLineInternalState } from "./GenericLineInternalState";

export class DynamicLine extends LineFace {

    /**
     * The line's layout strategies.
     */
    private static readonly LayoutStrategy: LayoutStrategyMap = {
        [Orientation.D0]: { 
            [Orientation.D0]      : runHorizontalTwoElbowLayout,
            [Orientation.D90]     : runHorizontalElbowLayout,
            [Orientation.Unknown] : runHorizontalElbowLayout,
        },
        [Orientation.D90]: {
            [Orientation.D0]      : runVerticalElbowLayout,
            [Orientation.D90]     : runVerticalTwoElbowLayout,
            [Orientation.Unknown] : runVerticalElbowLayout
        },
        [Orientation.Unknown]: {
            [Orientation.D0]      : runVerticalElbowLayout,
            [Orientation.D90]     : runHorizontalElbowLayout
        }
    }

    /**
     * The line's style.
     */
    private readonly style: LineStyle;

    /**
     * The line's grid.
     */
    private readonly grid: [number, number];

    /**
     * The line's visible points.
     */
    private points: DiagramObjectView[];

    /**
     * The line's vertices.
     */
    private vertices: number[];

    /**
     * The line's arrow head shape.
     */
    private arrow: number[];

    /**
     * The line's hitboxes.
     */
    private hitboxes: number[][];


    /**
     * Creates a new {@link HorizontalElbowLine}.
     * @param style
     *  The line's style.
     * @param grid
     *  The line's grid.
     */
    constructor(style: LineStyle, grid: [number, number]) {
        super();
        this.style = style;
        this.grid = grid;
        this.points = [];
        this.vertices = [];
        this.arrow = getAbsoluteArrowHead(0,0,0,0, style.capSize);
        this.hitboxes = [];
    }
    
    
    ///////////////////////////////////////////////////////////////////////////
    //  1. Selection  /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns the topmost view at the specified coordinate.
     * @param x
     *  The x coordinate.
     * @param y
     *  The y coordinate.
     * @returns
     *  The topmost view, undefined if there isn't one.
     */
    public getObjectAt(x: number, y: number): DiagramObjectView | undefined {
        // Try points
        const obj = findUnlinkedObjectAt(this.points, x, y);
        if (obj) {
            return obj;
        }
        if (this.isAnchored()) {
            // Try segments
            for (let i = 0; i < this.hitboxes.length; i++) {
                if (!isInsideRegion(x, y, this.hitboxes[i])) {
                    continue;
                }
                if (0 < i && i < this.hitboxes.length - 1) {
                    return this.view.handles[i - 1];
                } else {
                    return this.view;
                }
            }
        } else {
            // Try segments
            for (const hitbox of this.hitboxes) {
                if (isInsideRegion(x, y, hitbox)) {
                    return this.view;
                }
            }
        }
        return undefined;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Layout / Rendering  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Calculates the face's layout.
     * @returns
     *  True if the layout changed, false otherwise.
     */
    public calculateLayout(): boolean {
        const src = this.view.source;
        const hdl = this.view.handles[0];
        const trg = this.view.target;
        if (!src || !hdl || !trg) {
            // Bail if object incomplete
            return false;
        }

        // Forecast dimensions
        const [width, height] = this.forecastDimensions(src, hdl, trg);

        // Resolve latch orientations
        let srcO: number;
        let trgO: number;
        if(src.isLinked() && trg.isLinked()) {
            srcO = src.anchor!.orientation;
            trgO = trg.anchor!.orientation;
        } else if(src.isLinked() || trg.isLinked()) {
            const o = src.anchor?.orientation ?? trg.anchor!.orientation;
            let inProportion = true;
            switch(o) {
                case Orientation.D0:
                    inProportion = height <= width;
                    break;
                case Orientation.D90:
                    inProportion = width <= height;
                    break;
            }
            if(inProportion) {
                srcO = o;
                trgO = o;
            } else {
                srcO = src.anchor?.orientation ?? Orientation.Unknown;
                trgO = trg.anchor?.orientation ?? Orientation.Unknown;
            }
        } else if(height < width) {
            srcO = Orientation.D0;
            trgO = Orientation.D0;
        } else {
            srcO = Orientation.D90;
            trgO = Orientation.D90;
        }

        // Resolve layout strategy
        const runLayout = DynamicLine.LayoutStrategy[srcO]?.[trgO];
        if(runLayout) {
            // Expose internal state
            const face = this as unknown as GenericLineInternalState;
            // Run layout
            runLayout(this.view, face);
        } else {
            throw new Error(`No layout strategy: '${srcO}' -> '${trgO}'`);
        }
        
        // Calculate bounding box
        this.calculateBoundingBoxFromViews(this.points);

        // Update relative location
        this.boundingBox.x = this.boundingBox.xMid;
        this.boundingBox.y = this.boundingBox.yMid;

        return true;
    }

    /**
     * Renders the face to a context.
     * @param ctx
     *  The context to render to.
     * @param region
     *  The context's viewport.
     * @param settings
     *  The current render settings.
     */
    public renderTo(
        ctx: CanvasRenderingContext2D,
        region: ViewportRegion, settings: RenderSettings
    ): void {
        if (!this.isVisible(region)) {
            return;
        }

        // Init
        const { width, color, selectColor } = this.style;

        // Configure context
        ctx.lineWidth = width;
        if(this.view.focused) {
            if(settings.animationsEnabled) {
                ctx.setLineDash([5, 2]);
            }
            ctx.fillStyle = selectColor;
            ctx.strokeStyle = selectColor;
        } else {
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
        }

        // Draw line
        drawAbsoluteMultiElbowPath(ctx, this.vertices);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw arrow head
        drawAbsolutePolygon(ctx, this.arrow);
        ctx.fill();

        // Draw handles and ends
        if (this.view.focused) {
            for(const point of this.points) {
                point.renderTo(ctx, region, settings);
            }
        }

    }

    /**
     * Renders the face's debug information to a context.
     * @param ctx
     *  The context to render to.
     * @param region
     *  The context's viewport.
     * @returns
     *  True if the view is visible, false otherwise.
     */
    public renderDebugTo(ctx: CanvasRenderingContext2D, region: ViewportRegion): boolean {
        if(!this.isVisible(region)) {
            return false;
        }
        // Draw line
        drawBoundingRegion(ctx, this.boundingBox);
        ctx.stroke();
        // Draw points
        for(const object of this.points) {
            object.renderDebugTo(ctx, region);
        }
        const radius = 2;
        const p = Math.PI * 2;
        // Draw hitboxes
        ctx.beginPath();
        for (const hitbox of this.hitboxes) {
            for (let i = 0; i < hitbox.length; i += 2) {
                ctx.moveTo(hitbox[i] + radius, hitbox[i + 1]);
                ctx.arc(hitbox[i], hitbox[i + 1], radius, 0, p);
            }
        }
        ctx.fill();
        return true;
    }

    /**
     * Forecasts the final dimensions of the line.
     * @remarks
     *  This function allows `calculateLayout()` to estimate the line's final
     *  width and height before they're calculated.
     * @param points
     *  The points to factor into the forecast.
     * @returns
     *  The line's forecasted [width, height].
     */
    private forecastDimensions(...points: DiagramObjectView[]): [number, number] {
        let bb;
        let xMin = Infinity, xMax = -Infinity, 
            yMin = Infinity, yMax = -Infinity;
        for(const point of points) {
            bb = point.face.boundingBox;
            xMin = Math.min(xMin, bb.xMin);
            yMin = Math.min(yMin, bb.yMin);
            xMax = Math.max(xMax, bb.xMax);
            yMax = Math.max(yMax, bb.yMax);
        }
        return [xMax - xMin, yMax - yMin];
    }


    ///////////////////////////////////////////////////////////////////////////
    //  3. Cloning  ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns a clone of the face.
     * @returns
     *  A clone of the face.
     */
    public clone(): DynamicLine {
        return new DynamicLine(this.style, this.grid);
    }
    
    
    ///////////////////////////////////////////////////////////////////////////
    //  4. Shape  /////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Tests if a bounding region overlaps the face.
     * @param region
     *  The bounding region.
     * @returns
     *  True if the bounding region overlaps the face, false otherwise.
     */
    public overlaps(region: BoundingBox): boolean {
        // If bounding boxes don't overlap...
        if(!this.boundingBox.overlaps(region)) {
            // ...skip additional checks
            return false;
        }
        // Otherwise...
        const vertices = region.vertices;
        for(const hitbox of this.hitboxes) {
            if(doRegionsOverlap(vertices, hitbox)) {
                return true;
            }
        }
        return false;
    }

}

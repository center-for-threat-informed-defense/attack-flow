import { clamp, round } from "../Math";
import type { BorderRadius } from "./BorderRadius";


///////////////////////////////////////////////////////////////////////////////
//  1. Arrow Heads  ///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Returns an arrow head's shape relative to [0,0].
 * @param sx
 *  The arrow's source x-axis coordinate.
 * @param sy
 *  The arrow's source y-axis coordinate.
 * @param tx
 *  The arrow's target x-axis coordinate.
 * @param ty
 *  The arrow's target y-axis coordinate.
 * @param h
 *  The arrow's height.
 * @returns
 *  The arrow's vertices relative to [0,0].
 */
export function getRelativeArrowHead(
    sx: number, sy: number,
    tx: number, ty: number,
    h: number = 12
): [
        number, number,
        number, number,
        number, number
    ] {
    const dx = tx - sx;
    const dy = ty - sy;
    const angle = Math.atan2(dy, dx);
    return [
        -round(h * Math.cos(angle - Math.PI / 6)),
        -round(h * Math.sin(angle - Math.PI / 6)),
        -round(h * Math.cos(angle + Math.PI / 6)),
        -round(h * Math.sin(angle + Math.PI / 6)),
        0, 0
    ];
}

/**
 * Returns an arrow head's shape.
 * @param sx
 *  The arrow's source x-axis coordinate.
 * @param sy
 *  The arrow's source y-axis coordinate.
 * @param tx
 *  The arrow's target x-axis coordinate.
 * @param ty
 *  The arrow's target y-axis coordinate.
 * @param h
 *  The arrow's height.
 * @returns
 *  The arrow's vertices.
 */
export function getAbsoluteArrowHead(
    sx: number, sy: number,
    tx: number, ty: number,
    h: number = 12
): [
        number, number,
        number, number,
        number, number
    ] {
    const dx = tx - sx;
    const dy = ty - sy;
    const angle = Math.atan2(dy, dx);
    return [
        tx - round(h * Math.cos(angle - Math.PI / 6)),
        ty - round(h * Math.sin(angle - Math.PI / 6)),
        tx - round(h * Math.cos(angle + Math.PI / 6)),
        ty - round(h * Math.sin(angle + Math.PI / 6)),
        tx, ty
    ];
}

/**
 * Draws an arrow head to the context.
 * @param ctx
 *  The context to draw to.
 * @param sx
 *  The arrow's source x-axis coordinate.
 * @param sy
 *  The arrow's source y-axis coordinate.
 * @param tx
 *  The arrow's target x-axis coordinate.
 * @param ty
 *  The arrow's target y-axis coordinate.
 * @param h
 *  The arrow's height.
 *  (Default: 12)
 */
export function drawArrowHead(
    ctx: CanvasRenderingContext2D,
    sx: number, sy: number,
    tx: number, ty: number,
    h: number = 12
) {
    const dx = tx - sx;
    const dy = ty - sy;
    const angle = Math.atan2(dy, dx);
    const a = round(tx - h * Math.cos(angle - Math.PI / 6));
    const b = round(ty - h * Math.sin(angle - Math.PI / 6));
    const c = round(tx - h * Math.cos(angle + Math.PI / 6));
    const d = round(ty - h * Math.sin(angle + Math.PI / 6));
    ctx.beginPath();
    ctx.moveTo(a, b);
    ctx.lineTo(c, d);
    ctx.lineTo(tx, ty);
    ctx.closePath();
}


///////////////////////////////////////////////////////////////////////////////
//  2. Rectangles  ////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Draws a rectangular path to the context.
 * @param ctx
 *  The context to draw to.
 * @param x
 *  The top-left x coordinate.
 * @param y
 *  The top-left y coordinate.
 * @param w
 *  The width of the rectangle.
 * @param h
 *  The height of the rectangle.
 * @param r
 *  The rectangle's border radius.
 * @param s
 *  The rectangle's stroke width.
 *  (Default: 1)
 */
export function drawRect(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    w: number, h: number,
    r: number, s?: number
): void;

/**
 * Draws a rectangular path to a context.
 * @param ctx
 *  The context to draw to.
 * @param x
 *  The top-left x coordinate.
 * @param y
 *  The top-left y coordinate.
 * @param w
 *  The width of the rectangle.
 * @param h
 *  The height of the rectangle.
 * @param r
 *  An object which defines the border radius of each corner. If a corner
 *  is not specified, it is assumed to be 0.
 * @param s
 *  The rectangle's stroke width.
 *  (Default: 1)
 */
export function drawRect(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    w: number, h: number,
    r: BorderRadius,
    s?: number
): void;

export function drawRect(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    w: number, h: number,
    r: BorderRadius | number,
    s: number = 1
): void {
    // Account for stroke width
    x += s / 2;
    y += s / 2;
    w -= s;
    h -= s;
    // Parse radius
    if (typeof r === "number") {
        r = { tl: r, tr: r, br: r, bl: r };
    } else {
        r = { tl: 0, tr: 0, br: 0, bl: 0, ...r };
    }
    // Draw rectangular path
    ctx.beginPath();
    ctx.moveTo(x + w, y + h - r.br!);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r.br!, y + h);
    ctx.lineTo(x + r.bl!, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl!);
    ctx.lineTo(x, y + r.tl!);
    ctx.quadraticCurveTo(x, y, x + r.tl!, y);
    ctx.lineTo(x + w - r.tr!, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr!);
    ctx.closePath();
}

/**
 * Draws a rectangular path to the context.
 * @param ctx
 *  The context to draw to.
 * @param x
 *  The top-left x coordinate.
 * @param y
 *  The top-left y coordinate.
 * @param w
 *  The width of the rectangle.
 * @param h
 *  The height of the rectangle.
 * @param r
 *  The rectangle's border radius.
 * @param s
 *  The rectangle's stroke width.
 *  (Default: 1)
 */
export function drawChip(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    w: number, h: number,
    r: number, s?: number
): void;

/**
 * Draws a rectangular chip to a context.
 * @param ctx
 *  The context to draw to.
 * @param x
 *  The top-left x coordinate.
 * @param y
 *  The top-left y coordinate.
 * @param w
 *  The width of the rectangle.
 * @param h
 *  The height of the rectangle.
 * @param r
 *  An object which defines the border radius of each corner. If a corner
 *  is not specified, it is assumed to be 0.
 * @param s
 *  The rectangle's stroke width.
 *  (Default: 1)
 */
export function drawChip(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    w: number, h: number,
    r: BorderRadius,
    s?: number
): void;

export function drawChip(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    w: number, h: number,
    r: BorderRadius | number,
    s: number = 1
): void {
    // Account for stroke width
    x += s / 2;
    y += s / 2;
    w -= s;
    h -= s;
    // Parse radius
    if (typeof r === "number") {
        r = { tl: r, tr: r, br: r, bl: r };
    } else {
        r = { tl: 0, tr: 0, br: 0, bl: 0, ...r };
    }
    // Draw chip path
    ctx.beginPath();
    ctx.moveTo(x, y + h + 0.5);
    ctx.lineTo(x, y + r.tl!);
    ctx.quadraticCurveTo(x, y, x + r.tl!, y);
    ctx.lineTo(x + w - r.tr!, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr!);
    ctx.lineTo(x + w, y + h + 0.5);
}


///////////////////////////////////////////////////////////////////////////////
//  3. Paths  /////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Returns a multi-elbow line.
 * @param vertices
 *  The line's vertices.
 * @param r
 *  The line's border radius.
 * @returns
 *  The line's computed vertices.
 */
export function getAbsoluteMultiElbowPath(
    vertices: number[],
    r: number
): number[] {
    let i = 0;
    const v = new Array(4 + (vertices.length - 4) * 3);
    // Prepare iteration
    let sx = 0, sy = 1, mx = 2,
        my = 3, tx = 4, ty = 5,
        dx, dy, rx, ry, rad, mask;
    const length = vertices.length - 2;
    // Calculate line
    v[i++] = vertices[0];
    v[i++] = vertices[1];
    for (; mx < length; sx += 2, sy += 2, mx += 2, my += 2, tx += 2, ty += 2) {
        // Calculate radius
        dx = (vertices[tx] - vertices[sx]) >> 1;
        dy = (vertices[ty] - vertices[sy]) >> 1;
        rad = Math.min(Math.abs(dx), Math.abs(dy), r);
        // Calculate segment
        // @ts-ignore
        mask = (vertices[mx] - vertices[sx] !== 0) * -1;
        rx = rad & mask;
        ry = rad & ~mask;
        dx = Math.sign(dx);
        dy = Math.sign(dy);
        v[i++] = vertices[mx] - dx * rx;
        v[i++] = vertices[my] - dy * ry;
        v[i++] = vertices[mx];
        v[i++] = vertices[my];
        v[i++] = vertices[mx] + dx * ry,
        v[i++] = vertices[my] + dy * rx;
    }
    v[i++] = vertices[mx];
    v[i++] = vertices[my];
    return v;
}

/**
 * Draws an arbitrary multi-elbow line to a context.
 * @param ctx
 *  The context to draw to.
 * @param vertices
 *  The line's vertices.
 */
export function drawAbsoluteMultiElbowPath(
    ctx: CanvasRenderingContext2D,
    vertices: number[]
) {
    let i = 2;
    ctx.beginPath();
    ctx.moveTo(vertices[0], vertices[1]);
    const length = vertices.length - 2;
    for (;i < length;) {
        ctx.lineTo(
            vertices[i++], vertices[i++]
        );
        ctx.quadraticCurveTo(
            vertices[i++], vertices[i++],
            vertices[i++], vertices[i++]
        );
    }
    ctx.lineTo(vertices[i++], vertices[i++]);
}

/**
 * Draws a multi-elbow path to the context.
 * @param ctx
 *  The context to draw to.
 * @param vertices
 *  The line's vertices.
 * @param r
 *  The line's border radius.
 */
export function drawMultiElbowPath(
    ctx: CanvasRenderingContext2D,
    vertices: number[],
    r: number
) {
    let sx = 0, sy = 1, mx = 2,
        my = 3, tx = 4, ty = 5,
        dx, dy, rx, ry, rad, mask;
    const length = vertices.length - 2;
    // Draw line
    ctx.beginPath();
    ctx.moveTo(vertices[0], vertices[1]);
    for (; mx < length; sx += 2, sy += 2, mx += 2, my += 2, tx += 2, ty += 2) {
        // Calculate radius
        dx = (vertices[tx] - vertices[sx]) >> 1;
        dy = (vertices[ty] - vertices[sy]) >> 1;
        rad = Math.min(Math.abs(dx), Math.abs(dy), r);
        // Calculate segment
        // @ts-ignore
        mask = (vertices[mx] - vertices[sx] !== 0) * -1;
        rx = rad & mask;
        ry = rad & ~mask;
        dx = Math.sign(dx);
        dy = Math.sign(dy);
        // Draw segment
        ctx.lineTo(
            vertices[mx] - dx * rx,
            vertices[my] - dy * ry
        );
        ctx.quadraticCurveTo(
            vertices[mx], vertices[my],
            vertices[mx] + dx * ry,
            vertices[my] + dy * rx
        );
    }
    ctx.lineTo(vertices[mx], vertices[my]);
}

/**
 * Draws a horizontal elbow path to a context.
 * @param ctx
 *  The context to draw to.
 * @param sx
 *  The source x-coordinate.
 * @param sy
 *  The source y-coordinate.
 * @param hx
 *  The handle x-coordinate.
 * @param hy
 *  The handle y-coordinate.
 * @param tx
 *  The target x-coordinate.
 * @param ty
 *  The target y-coordinate.
 * @param r
 *  The line's border radius.
 */
export function drawHorizontalElbow(
    ctx: CanvasRenderingContext2D,
    sx: number, sy: number,
    hx: number, hy: number,
    tx: number, ty: number,
    r: number
) {
    ctx.beginPath();
    if (sy === ty) {
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        return;
    }
    // Calculate radius
    const r0 = Math.abs(ty - hy);
    const hs = Math.sign(ty - hy);
    const r1 = Math.min(Math.abs(hx - sx), r0, r);
    const r2 = Math.min(Math.abs(tx - hx), r0, r);
    // Draw rectangular path
    ctx.moveTo(sx, sy);
    ctx.lineTo(hx - Math.sign(hx - sx) * r1, sy);
    ctx.quadraticCurveTo(hx, sy, hx, sy + hs * r1);
    ctx.lineTo(hx, ty - hs * r2);
    ctx.quadraticCurveTo(hx, ty, hx + Math.sign(tx - hx) * r2, ty);
    ctx.lineTo(tx, ty);
}

/**
 * Draws a vertical elbow path to a context.
 * @param ctx
 *  The context to draw to.
 * @param sx
 *  The source x-coordinate.
 * @param sy
 *  The source y-coordinate.
 * @param hx
 *  The handle x-coordinate.
 * @param hy
 *  The handle y-coordinate.
 * @param tx
 *  The target x-coordinate.
 * @param ty
 *  The target y-coordinate.
 * @param r
 *  The line's border radius.
 */
export function drawVerticalElbow(
    ctx: CanvasRenderingContext2D,
    sx: number, sy: number,
    hx: number, hy: number,
    tx: number, ty: number,
    r: number
) {
    ctx.beginPath();
    if (sx === tx) {
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        return;
    }
    // Calculate radius
    const r0 = Math.abs(tx - hx);
    const hs = Math.sign(tx - hx);
    const r1 = Math.min(Math.abs(hy - sy), r0, r);
    const r2 = Math.min(Math.abs(ty - hy), r0, r);
    // Draw rectangular path
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx, hy - Math.sign(hy - sy) * r1);
    ctx.quadraticCurveTo(sx, hy, sx + hs * r1, hy);
    ctx.lineTo(tx - hs * r2, hy);
    ctx.quadraticCurveTo(tx, hy, tx, hy + Math.sign(ty - hy) * r2);
    ctx.lineTo(tx, ty);

}

/**
 * Draws a horizontal elbow path to a context.
 * @remarks
 *  This was my first implementation attempt. The curves aren't calculated
 *  quite right but it *might* be faster. I'm keeping this function around
 *  until I can benchmark it.
 * @param ctx
 *  The context to draw to.
 * @param sx
 *  The source x-coordinate.
 * @param sy
 *  The source y-coordinate.
 * @param hx
 *  The handle x-coordinate.
 * @param hy
 *  The handle y-coordinate.
 * @param tx
 *  The target x-coordinate.
 * @param ty
 *  The target y-coordinate.
 * @param r
 *  The line's border radius.
 */
export function drawHorizontalElbowFast(
    ctx: CanvasRenderingContext2D,
    sx: number, sy: number,
    hx: number, hy: number,
    tx: number, ty: number,
    r: number
) {
    ctx.beginPath();
    if (sy === ty) {
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        return;
    }
    // Calculate offsets
    const o1 = clamp(hx - sx, -r, r);
    const o2 = clamp(ty - hy, -r, r);
    const o3 = clamp(tx - hx, -r, r);
    // Draw rectangular path
    ctx.moveTo(sx, sy);
    ctx.lineTo(hx - o1, sy);
    ctx.quadraticCurveTo(hx, sy, hx, sy + o2);
    ctx.lineTo(hx, ty - o2);
    ctx.quadraticCurveTo(hx, ty, hx + o3, ty);
    ctx.lineTo(tx, ty);
}


///////////////////////////////////////////////////////////////////////////////
//  4. Polygons  //////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Draws an arbitrary polygon to a context.
 * @param ctx
 *  The context to draw to.
 * @param x
 *  The polygon's x-coordinate.
 * @param y
 *  The polygon's y-coordinate.
 * @param vertices
 *  The polygon's vertices relative to [0,0].
 */
export function drawRelativePolygon(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    vertices: number[]
) {
    ctx.beginPath();
    ctx.moveTo(vertices[0] + x, vertices[1] + y);
    for (let i = 2; i < vertices.length; i += 2) {
        ctx.lineTo(vertices[i] + x, vertices[i + 1] + y);
    }
    ctx.closePath();
}

/**
 * Draws an arbitrary polygon to a context.
 * @param ctx
 *  The context to draw to.
 * @param vertices
 *  The polygon's vertices.
 */
export function drawAbsolutePolygon(
    ctx: CanvasRenderingContext2D,
    vertices: number[]
) {
    ctx.beginPath();
    ctx.moveTo(vertices[0], vertices[1]);
    for (let i = 2; i < vertices.length; i += 2) {
        ctx.lineTo(vertices[i], vertices[i + 1]);
    }
    ctx.closePath();
}


///////////////////////////////////////////////////////////////////////////////
//  5. Debug Regions  /////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Draws a bounding region to a context.
 * @param ctx
 *  The context to draw to.
 * @param region
 *  The bounding region.
 */
export function drawBoundingRegion(
    ctx: CanvasRenderingContext2D,
    region: { xMin: number, yMin: number, xMax: number, yMax: number }
) {
    ctx.beginPath();
    ctx.moveTo(region.xMin + 0.5, region.yMin + 0.5);
    ctx.lineTo(region.xMax - 0.5, region.yMin + 0.5);
    ctx.lineTo(region.xMax - 0.5, region.yMax - 0.5);
    ctx.lineTo(region.xMin + 0.5, region.yMax - 0.5);
    ctx.lineTo(region.xMin + 0.5, region.yMin + 0.5);
    ctx.lineTo(region.xMax - 0.5, region.yMax - 0.5);
}

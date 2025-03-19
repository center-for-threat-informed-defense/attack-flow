import { clamp } from "../Math";
import type { BorderRadius } from "./BorderRadius";

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
    const a = tx - h * Math.cos(angle - Math.PI / 6);
    const b = ty - h * Math.sin(angle - Math.PI / 6);
    const c = tx - h * Math.cos(angle + Math.PI / 6);
    const d = ty - h * Math.sin(angle + Math.PI / 6);
    ctx.beginPath();
    ctx.moveTo(a, b);
    ctx.lineTo(c, d);
    ctx.lineTo(tx, ty);
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
    if(sy === ty) {
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        return;
    }
    // Calculate offsets
    let r0 = Math.abs(ty - hy);
    let hs = Math.sign(ty - hy);
    let r1 = Math.min(Math.abs(hx - sx), r0, r);
    let r2 = Math.min(Math.abs(tx - hx), r0, r);
    // Draw rectangular path
    ctx.moveTo(sx, sy);
    ctx.lineTo(hx - Math.sign(hx - sx) * r1, sy);
    ctx.quadraticCurveTo(hx, sy, hx, sy + hs * r1);
    ctx.lineTo(hx, ty - hs * r2);
    ctx.quadraticCurveTo(hx, ty, hx + Math.sign(tx - hx) * r2, ty);
    ctx.lineTo(tx, ty);
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
export function drawVerticalElbow(
    ctx: CanvasRenderingContext2D,
    sx: number, sy: number,
    hx: number, hy: number,
    tx: number, ty: number,
    r: number
) {
    ctx.beginPath();
    if(sx === tx) {
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        return;
    }
    // Calculate offsets
    let r0 = Math.abs(tx - hx);
    let hs = Math.sign(tx - hx);
    let r1 = Math.min(Math.abs(hy - sy), r0, r);
    let r2 = Math.min(Math.abs(ty - hy), r0, r);
    // Draw rectangular path
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx, hy - Math.sign(hy - sy) * r1);
    ctx.quadraticCurveTo(sx, hy, sx + hs * r1, hy)
    ctx.lineTo(tx - hs * r2, hy)
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
    if(sy === ty) {
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        return;
    }
    // Calculate offsets
    let o1 = clamp(hx - sx, -r, r);
    let o2 = clamp(ty - hy, -r, r);
    let o3 = clamp(tx - hx, -r, r);
    // Draw rectangular path
    ctx.moveTo(sx, sy);
    ctx.lineTo(hx - o1, sy);
    ctx.quadraticCurveTo(hx, sy, hx, sy + o2);
    ctx.lineTo(hx, ty - o2);
    ctx.quadraticCurveTo(hx, ty, hx + o3, ty);
    ctx.lineTo(tx, ty);
}

/**
 * Resizes a canvas context according to the current screen's pixel ratio.
 * @param context
 *  The context to resize.
 * @param width
 *  The new width of the context.
 * @param height
 *  The new height of the context.
 */
export function resizeContext(
    context: CanvasRenderingContext2D,
    width: number,
    height: number
) {
    context.canvas.width = width * window.devicePixelRatio;
    context.canvas.height = height * window.devicePixelRatio;
    context.canvas.style.width = `${ width }px`;
    context.canvas.style.height = `${ height }px`;
    context.scale(window.devicePixelRatio, window.devicePixelRatio);
}

/**
 * Transforms a canvas context according to the current screen's pixel ratio.
 * @param context
 *  The context to resize.
 * @param k
 *  The context's scale.
 * @param x
 *  The context's x translation.
 * @param y
 *  The context's y translation.
 */
export function transformContext(
    context: CanvasRenderingContext2D,
    k: number,
    x: number,
    y: number
) {
    k *= window.devicePixelRatio,
    x *= window.devicePixelRatio,
    y *= window.devicePixelRatio;
    context.setTransform(
        k, 0, 0,
        k, x, y
    );
}

/**
 * Resizes and transforms a canvas context according to the current screen's
 * pixel ratio.
 * @param context
 *  The context to resize.
 * @param width
 *  The new width of the context.
 * @param height
 *  The new height of the context.
 * @param k
 *  The context's scale.
 * @param x
 *  The context's x translation.
 * @param y
 *  The context's y translation.
 */
export function resizeAndTransformContext(
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
    k: number,
    x: number,
    y: number
) {
    context.canvas.width = width * window.devicePixelRatio;
    context.canvas.height = height * window.devicePixelRatio;
    context.canvas.style.width = `${ width }px`;
    context.canvas.style.height = `${ height }px`;
    transformContext(context, k, x, y);
}

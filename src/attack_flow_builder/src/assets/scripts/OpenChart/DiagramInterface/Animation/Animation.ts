export abstract class Animation {

    /**
     * The animation's id.
     */
    public readonly id: string;

    /**
     * The animation's frame count.
     */
    public readonly frames: number;

    /**
     * The current animation frame.
     */
    private frame: number;


    /**
     * Creates an {@link Animation}.
     * @param id
     *  The animation's identifier.
     * @param frames
     *  The animation's frame count.
     */
    constructor(id: string, frames: number) {
        this.id = id;
        this.frames = frames;
        this.frame = 1;
    }


    /**
     * Renders the next frame.
     * @param context
     *  The render context.
     * @returns
     *  False when the animation is complete.
     */
    public nextFrame(context: CanvasRenderingContext2D): boolean {
        this.renderFrame(context, this.frame);
        return this.frame++ !== this.frames;
    }

    /**
     * Renders a frame.
     * @remarks
     *  The interface runs animations in two steps:
     *   1. The interface invokes `nextFrame()` on each of its registered
     *      animations.
     *   2. The interface re-renders the diagram.
     *  
     *  As a result, anything drawn to `context` in this function **will be
     *  overwritten**. Animations exist primarily to animate diagram object
     *  properties, not the context itself. `context` is provided primarily so
     *  that animations can reconfigure options that impact the final render.
     *  (e.g. `lineDashOffset`)
     * 
     *  If a need arises to render arbitrary animations to the context,
     *  consider performing these animations on a separate context
     *  (superimposed on the primary context). This will offer much better
     *  performance than attempting to animate the primary context directly.
     * @param context
     *  The render context.
     * @param frame
     *  The frame number.
     */
    public abstract renderFrame(context: CanvasRenderingContext2D, frame: number): void;

}

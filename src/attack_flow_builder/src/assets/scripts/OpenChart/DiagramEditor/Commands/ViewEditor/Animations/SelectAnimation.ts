import { round } from "@OpenChart/Utilities";
import { Animation } from "@OpenChart/DiagramInterface";

export class SelectAnimation extends Animation {

    /**
     * Creates a new {@link SelectAnimation}.
     * @param id
     *  The animation's identifier.
     * @param frames
     *  The animation's frame count.
     */
    constructor(id: string, frames: number) {
        super(id, frames);
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
    public renderFrame(context: CanvasRenderingContext2D, frame: number): void {
        context.lineDashOffset = -round(frame / 2) % 7;
    }

}

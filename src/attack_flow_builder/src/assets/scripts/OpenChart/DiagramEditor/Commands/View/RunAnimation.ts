import { SynchronousEditorCommand } from "../SynchronousEditorCommand";
import type { Animation, DiagramInterface } from "@OpenChart/DiagramInterface";

export class RunAnimation extends SynchronousEditorCommand {

    /**
     * The interface to run the animation on.
     */
    public readonly interface: DiagramInterface;

    /**
     * The animation.
     */
    public readonly animation: Animation;

    /**
     * Whether the animation was running pre-execution.
     */
    public readonly wasAnimationRunning: boolean;


    /**
     * Runs an animation on an interface.
     * @param ui
     *  The interface to run the animation on.
     * @param animation
     *  The animation.
     */
    constructor(ui: DiagramInterface, animation: Animation) {
        super();
        this.interface = ui;
        this.animation = animation;
        this.wasAnimationRunning = ui.isAnimationRunning(animation);
    }


    /**
     * Executes the editor command.
     */
    public execute(): void {
        if(!this.wasAnimationRunning) {
            this.interface.runAnimation(this.animation);
        }
    }

    /**
     * Undoes the editor command.
     */
    public undo(): void {
        if(!this.wasAnimationRunning) {
            this.interface.stopAnimation(this.animation.id);
        }
    }

}

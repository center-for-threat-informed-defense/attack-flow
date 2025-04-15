import { EditorCommand } from "../EditorCommand";
import type { Animation, DiagramInterface } from "@OpenChart/DiagramInterface";

export class StopContinuousAnimation extends EditorCommand { 

    /**
     * The interface to run the animation on.
     */
    public readonly interface: DiagramInterface<EditorCommand>;

    /**
     * The animation's identifier.
     */
    public readonly animation: Animation;


    /**
     * Runs an animation on an interface.
     * @param ui
     *  The interface to run the animation on.
     * @param animation
     *  The animation.
     */
    constructor(ui: DiagramInterface<EditorCommand>, animation: Animation) {
        super();
        this.interface = ui;
        this.animation = animation;
    }
    

    /**
     * Executes the editor command.
     */
    public execute(): void {
        this.interface.stopAnimation(this.animation.id);
    }

    /**
     * Undoes the editor command.
     */
    public undo(): void {
        this.interface.runAnimation(this.animation);
    }

}

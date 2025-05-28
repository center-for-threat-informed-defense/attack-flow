import { EditorCommand } from "../EditorCommand";
import type { Animation, DiagramInterface } from "@OpenChart/DiagramInterface";

export class RunAnimation extends EditorCommand {

    /**
     * The interface to run the animation on.
     */
    public readonly interface: DiagramInterface<EditorCommand>;

    /**
     * The animation.
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
        this.interface.runAnimation(this.animation);
    }

    /**
     * Undoes the editor command.
     */
    public undo(): void {}

}

import { EditorCommand } from "../EditorCommand";
import type { Animation, DiagramInterface } from "@OpenChart/DiagramInterface";

export class StopAnimation extends EditorCommand { 

    /**
     * The interface to run the animation on.
     */
    public readonly interface: DiagramInterface<EditorCommand>;

    /**
     * The animation's identifier.
     */
    public readonly animation: string;


    /**
     * Runs an animation on an interface.
     * @param ui
     *  The interface to run the animation on.
     * @param animation
     *  The animation or its identifier.
     */
    constructor(ui: DiagramInterface<EditorCommand>, animation: Animation | string) {
        super();
        const id = typeof animation === "string" ? animation : animation.id;
        this.interface = ui;
        this.animation = id;
    }
    

    /**
     * Executes the editor command.
     */
    public execute(): void {
        this.interface.stopAnimation(this.animation);
    }

    /**
     * Undoes the editor command.
     */
    public undo(): void {}

}

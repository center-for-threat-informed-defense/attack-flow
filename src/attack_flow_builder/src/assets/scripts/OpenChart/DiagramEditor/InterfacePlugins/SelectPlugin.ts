import * as EditorCommands from "../Commands";
import { HoverPlugin } from "./HoverPlugin";
import { SelectionAnimation } from "./Animations";
import type { EditorCommand } from "../Commands";
import type { DiagramInterface } from "@OpenChart/DiagramInterface";
import type { DiagramObjectView } from "@OpenChart/DiagramView";

export abstract class SelectPlugin extends HoverPlugin {

    /**
     * Creates a new {@link SelectPlugin}.
     * @param ui
     *  The plugin's interface.
     */
    constructor(ui: DiagramInterface<EditorCommand>) {
        super(ui);
    }


    /**
     * Sets the current selection.
     * @param obj
     *  The object being selected.
     * @param event
     *  The mouse event.
     */
    protected select(obj: DiagramObjectView | undefined, event: MouseEvent) {
        // Update selection 
        if(!obj?.focused && !event.ctrlKey) {
            this.execute(EditorCommands.unselectGroupObjects(this.interface.root));
            this.execute(EditorCommands.stopAnimation(this.interface, SelectionAnimation));
        }
        if(obj) {
            this.execute(EditorCommands.selectObject(obj));
            this.execute(EditorCommands.runAnimation(this.interface, SelectionAnimation));
        }
    }

}

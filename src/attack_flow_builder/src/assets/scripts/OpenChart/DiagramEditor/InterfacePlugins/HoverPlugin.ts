import * as EditorCommands from "../Commands";
import { EditorCommand } from "../Commands";
import { Cursor, DiagramInterface, DiagramInterfacePlugin } from "@OpenChart/DiagramInterface";
import type { DiagramObjectView } from "@OpenChart/DiagramView";

export abstract class HoverPlugin extends DiagramInterfacePlugin<EditorCommand> {
   
    /**
     * The plugin's interface.
     */
    protected interface: DiagramInterface<EditorCommand>;


    /**
     * Creates a new {@link SelectPlugin}.
     * @param ui
     *  The plugin's interface.
     */
    constructor(ui: DiagramInterface<EditorCommand>) {
        super();
        this.interface = ui;
    }

    
    ///////////////////////////////////////////////////////////////////////////
    //  1. Hover Interactions  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Tests if the plugin can handle a hover event.
     * @param obj
     *  The object being hovered.
     * @param event
     *  The mouse event.
     * @returns
     *  True if the plugin can handle the event, false otherwise.
     */
    public canHandleHover(obj: DiagramObjectView | undefined, event: MouseEvent): boolean {
        return obj === undefined;
    }

    /**
     * Hover start logic.
     * @param obj
     *  The object being hovered.
     * @returns
     *  The active cursor type.
     */
    public handleHoverStart(obj: DiagramObjectView | undefined): Cursor | undefined {
        this.execute(EditorCommands.clearHover(this.interface.root));
        if(obj) {
          this.execute(EditorCommands.hoverObject(obj, true));
        }
        return Cursor.Default;
    }

}

import * as EditorCommands from "../Commands";
import { EditorCommand } from "../Commands";
import { DiagramInterface } from "@OpenChart/DiagramInterface";
import { LineLatchMoverPlugin } from "./LineLatchMoverPlugin";
import { AnchorView, LineView } from "@OpenChart/DiagramView";
import type { DiagramObjectView, DiagramObjectViewFactory } from "@OpenChart/DiagramView";

export class CreateLineControllerPlugin extends LineLatchMoverPlugin {

    /**
     * The plugin's view factory.
     */
    private readonly factory: DiagramObjectViewFactory;


    /**
     * Creates a new {@link CreateLineControllerPlugin}.
     * @param ui
     *  The plugin's interface.
     * @param factory
     *  The plugin's view factory.
     */
    constructor(ui: DiagramInterface<EditorCommand>, factory: DiagramObjectViewFactory) {
        super(ui);
        this.factory = factory;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Selection Interactions  ////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    

    /**
     * Tests if the plugin can handle a selection.
     * @param obj
     *  The object being selected.
     * @param event
     *  The mouse event.
     * @returns
     *  True if the plugin can handle the event, false otherwise.
     */
    public canHandleSelection(obj: DiagramObjectView | undefined, event: MouseEvent): boolean {
        return obj instanceof AnchorView;
    }

    /**
     * Selection start logic.
     * @param obj
     *  The object being selected.
     * @param event
     *  The mouse event.
     * @returns
     *  True if control should be transferred back to the interface, false
     *  otherwise. If true, subsequent drag events will directly manipulate the
     *  view instead of the plugin's selection (`handleSelectDrag()` and
     *  `handleSelectEnd()` will not be invoked).
     */
    protected handleSelectStart(obj: DiagramObjectView | undefined, event: MouseEvent): boolean {
        if(!(obj instanceof AnchorView)) {
            return false;
        }
        const { addObjectToGroup, moveObjectsBy, attachLatchToAnchor} = EditorCommands;
        // Start stream command
        // Create line
        // TODO: Pull line type from anchor template
        const line = this.factory.createNewDiagramObject("generic_line", LineView);
        this.execute(addObjectToGroup(line, this.interface.root));
        // TODO: Switch to move objects to
        this.execute(moveObjectsBy(line.source, obj.x, obj.y));
        this.execute(moveObjectsBy(line.target, obj.x, obj.y));
        this.execute(attachLatchToAnchor(line.source, obj));
        // Handle latch
        super.handleSelectStart(line.target, event);
        // Assume control of movement
        return false;
    }

}

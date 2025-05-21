import * as EditorCommands from "@OpenChart/DiagramEditor/Commands";
import { AppCommand } from "../AppCommand";
import { DiagramViewEditor } from "@OpenChart/DiagramEditor";
import type { OpenChartFinder } from "@/assets/scripts/OpenChartFinder";
import type { DiagramObjectView } from "@OpenChart/DiagramView";

export class ToPreviousSearchResult extends AppCommand {

    /**
     * The finder to operate on.
     */
    public readonly finder: OpenChartFinder;


    /**
     * Advances the finder to the previous search result.
     * @param finder
     *  The finder to operate on.
     */
    constructor(finder: OpenChartFinder) {
        super();
        this.finder = finder;
    }


    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        this.finder.movetoPreviousResult();
        // Update selection
        const editor = this.finder.editor;
        const result = this.finder.result;
        if(result && editor instanceof DiagramViewEditor) {
            const object = result?.object as DiagramObjectView;
            editor.execute(EditorCommands.unselectAllObjects(editor));
            editor.execute(EditorCommands.selectObject(editor, object));
            editor.execute(EditorCommands.moveCameraToObjects(editor, [object]));
        }
    }

}

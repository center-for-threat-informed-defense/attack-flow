import * as EditorCommands from "@OpenChart/DiagramEditor/Commands";
import { AppCommand } from "../AppCommand";
import { DiagramViewEditor } from "@OpenChart/DiagramEditor";
import type { OpenChartFinder } from "@/assets/scripts/OpenChartFinder";
import type { DiagramObjectView } from "@OpenChart/DiagramView";

export class RunSearch extends AppCommand {

    /**
     * The finder to operate on.
     */
    public readonly finder: OpenChartFinder;

    /**
     * The editor to search.
     */
    public readonly editor: DiagramViewEditor;

    /**
     * The search query.
     */
    public readonly query: string;


    /**
     * Runs a search on an editor.
     * @param finder
     *  The finder to operate on.
     * @param editor
     *  The editor to search.
     * @param query
     *  The search query.
     */
    constructor(finder: OpenChartFinder, editor: DiagramViewEditor, query: string) {
        super();
        this.finder = finder;
        this.editor = editor;
        this.query = query;
    }


    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        this.finder.search(this.editor, this.query);
        // Update selection
        const editor = this.finder.editor;
        const result = this.finder.result;
        if (result && editor instanceof DiagramViewEditor) {
            const object = result?.object as DiagramObjectView;
            editor.execute(EditorCommands.unselectAllObjects(editor));
            editor.execute(EditorCommands.selectObject(editor, object));
            editor.execute(EditorCommands.moveCameraToObjects(editor, [object]));
        }
    }

}

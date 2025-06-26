import { AppCommand } from "../AppCommand";
import { DiagramViewFile } from "@OpenChart/DiagramView";
import { roundNearestMultiple } from "@OpenChart/Utilities";
import { 
    addGroupToGroup, DiagramViewEditor, 
    GroupCommand, selectObject, unselectAllObjects
} from "@OpenChart/DiagramEditor";
import type { ApplicationStore } from "@/stores/ApplicationStore";

export class ImportFile extends AppCommand {

    /**
     * The application context.
     */
    public readonly context: ApplicationStore;

    /**
     * The editor to import into.
     */
    public readonly editor: DiagramViewEditor;

    /**
     * The file to import.
     */
    public readonly file: DiagramViewFile;


    /**
     * Imports a diagram file into an existing editor.
     * @param context
     *  The application context.
     * @param editor
     *  The editor to import into.
     * @param file
     *  The file to import.
     */
    constructor(context: ApplicationStore, editor: DiagramViewEditor, file: DiagramViewFile) {
        super();
        this.editor = editor;
        this.context = context;
        // Validate import
        const trgId = file.factory.id;
        const srcId = this.editor.file.factory.id;
        if(srcId !== trgId) {
            throw new Error(
                `Destination file schema '${trgId}' ` +
                `does not match import schema '${srcId}'.`
            );
        }
        // Clone file
        this.file = file.clone();
    }


    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {

        // Position file
        const canvas = this.editor.file.canvas;
        if(this.file.canvas.instance === canvas.instance) {
            // If import is from the same file, insert it at an offset
            const offset = this.solvePlacement(this.editor.file, this.file);
            this.file.canvas.moveBy(
                roundNearestMultiple(offset[0], canvas.grid[0]),
                roundNearestMultiple(offset[1], canvas.grid[1])
            );
        } else {
            // Otherwise, insert it at the last pointer location
            const pointer = this.editor.pointer;
            this.file.canvas.moveTo(
                roundNearestMultiple(pointer[0], canvas.grid[0]),
                roundNearestMultiple(pointer[1], canvas.grid[1])
            );
        }

        // Import the file
        const cmd = new GroupCommand();
        cmd.do(addGroupToGroup(this.file.canvas, this.editor.file.canvas));
        cmd.do(unselectAllObjects(this.editor));
        for(const object of this.file.canvas.objects) {
            cmd.do(selectObject(this.editor, object));
        }
        this.editor.execute(cmd);
    
    }
    
    /**
     * Determines `src` file's best offset in `dst` file.
     * @param dst
     *  The destination view file.
     * @param src
     *  The source view file.
     * @returns
     *  The `src` file's best offset in `dst` file.
     */
    private solvePlacement(dst: DiagramViewFile, src: DiagramViewFile): [number, number] {
        const objects = [...src.canvas.objects];
        if(!objects.length) {
            return [0,0];
        }
        // Compile placements
        const placements = new Set<string>();
        for(const object of dst.canvas.objects) {
            placements.add(`${object.x}:${object.y}`);
        }
        // Locate collisions
        const grid = dst.canvas.grid;
        const offset: [number, number] = [0,0];
        const offsetUnits = this.context.settings.edit.clone_offset;
        const leader = objects[0];
        for(let x = leader.x, y = leader.y;;) {
            x = leader.x + offset[0];
            y = leader.y + offset[1];
            if(!placements.has(`${x}:${y}`)) {
                return offset;
            }
            offset[0] += offsetUnits[0] * grid[0];
            offset[1] += offsetUnits[1] * grid[1];
        }
    }

}

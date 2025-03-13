import { DiagramViewFile } from "@OpenChart/DiagramView";
import { DiagramInterface } from "@OpenChart/DiagramInterface";
import { DiagramModelEditor } from "./DiagramModelEditor";
import type { ViewEditorEvents } from "./ViewEditorEvents";

export class DiagramViewEditor extends DiagramModelEditor<DiagramViewFile, ViewEditorEvents> {

    /**
     * The editor's diagram interface.
     */
    public interface: DiagramInterface;


    /**
     * Creates a new {@link DiagramEditor}.
     * @param file
     *  The editor's file.
     */
    constructor(file: DiagramViewFile);

    /**
     * Creates a new {@link DiagramEditor}.
     * @param file
     *  The editor's file.
     * @param name
     *  The editor's file name.
     * @param autosaveInterval
     *  How long a period of inactivity must be before autosaving.
     *  (Default: 1500ms)
     */
    constructor(file: DiagramViewFile, name?: string, autosaveInterval?: number);
    constructor(file: DiagramViewFile, name?: string, autosaveInterval: number = 1500) {
        super(file, name, autosaveInterval);
        this.interface = new DiagramInterface(file.canvas);
        this.interface.render();
    }

}

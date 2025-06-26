import { Canvas, DiagramObject } from "./DiagramObject";
import { DiagramObjectSerializer } from "./DiagramObjectSerializer";
import type { DiagramModelExport } from "./DiagramModelExport";
import type { DiagramObjectFactory } from "./DiagramObjectFactory";

export class DiagramModelFile {

    /**
     * The file's canvas object.
     */
    public readonly canvas: Canvas;

    /**
     * The file's object factory.
     */
    public readonly factory: DiagramObjectFactory;


    /**
     * Creates a new {@link DiagramModelFile}.
     * @param factory
     *  The file's object factory.
     */
    constructor(factory: DiagramObjectFactory);

    /**
     * Imports a {@link DiagramModelFile}.
     * @param factory
     *  The file's object factory.
     * @param diagram
     *  The file or canvas to import.
     */
    constructor(factory: DiagramObjectFactory, diagram?: DiagramModelExport | Canvas);
    constructor(factory: DiagramObjectFactory, diagram?: DiagramModelExport | Canvas) {
        this.factory = factory;
        if (diagram && diagram instanceof Canvas) {
            this.canvas = diagram;
        }
        else if (diagram) {
            // Import existing file
            const roots = DiagramObjectSerializer.importObjects(factory, diagram.objects);
            if (roots.length === 1 && roots[0] instanceof Canvas) {
                this.canvas = roots[0];
            } else {
                throw new Error("File export includes multiple root objects.");
            }
        } else {
            // Create new file
            this.canvas = factory.createNewDiagramObject(factory.canvas);
        }
    }


    /**
     * Clones the {@link DiagramModelFile}.
     * @param match
     *  A predicate which is applied to each child of the canvas. If the 
     *  predicate returns false, the child is excluded from the clone.
     */
    public clone(match?: (obj: DiagramObject) => boolean): DiagramModelFile {
        // Clone canvas
        const canvas = this.canvas.clone(this.canvas.instance, undefined, match);
        // Return clone
        return new DiagramModelFile(
            this.factory,
            {
                schema  : this.factory.id,
                objects : DiagramObjectSerializer.exportObjects([canvas])
            }
        );
    }

    /**
     * Exports the file.
     * @returns
     *  The serialized file.
     */
    public toExport(): DiagramModelExport {
        return {
            schema: this.factory.id,
            objects: DiagramObjectSerializer.exportObjects([this.canvas])
        };
    }

}

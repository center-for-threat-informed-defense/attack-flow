import { Canvas } from "./DiagramObject";
import { DiagramObjectSerializer } from "./DiagramObjectSerializer";
import type { DiagramModelExport } from "./DiagramModelExport";
import type { DiagramObjectFactory } from "./DiagramObjectFactory";
import { StixToFlow, type StixBundle } from "../../StixToFlow/StixToFlow";

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
     *  The file to import.
     * @param stix
     * The STIX bundle to import.
     */
    constructor(factory: DiagramObjectFactory, diagram?: DiagramModelExport, stix?: StixBundle);
    constructor(factory: DiagramObjectFactory, diagram?: DiagramModelExport, stix?: StixBundle) {
        this.factory = factory;
        if (diagram) {
            // Import existing file
            const roots = DiagramObjectSerializer.importObjects(factory, diagram.objects);
            if (roots.length === 1 && roots[0] instanceof Canvas) {
                this.canvas = roots[0];
            } else {
                throw new Error("File export includes multiple root objects.");
            }
        } else if (stix) {
            // Import STIX
            this.canvas = StixToFlow.toFlow(stix, factory);
        } else {
            // Create new file
            this.canvas = factory.createNewDiagramObject(factory.canvas);
        }
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

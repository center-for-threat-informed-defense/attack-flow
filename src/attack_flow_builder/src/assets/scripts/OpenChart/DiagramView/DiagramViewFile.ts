import { Canvas, DiagramModelFile } from "@OpenChart/DiagramModel";
import { ManualLayoutEngine } from "./DiagramLayoutEngine";
import type { CanvasView } from "./DiagramObjectView";
import type { CameraLocation } from "./CameraLocation";
import type { DiagramViewExport } from "./DiagramViewExport";
import type { DiagramLayoutEngine } from "./DiagramLayoutEngine";
import type { DiagramTheme, DiagramObjectViewFactory } from "./DiagramObjectViewFactory";

export class DiagramViewFile extends DiagramModelFile {

    /**
     * The file's camera location.
     */
    public readonly camera: CameraLocation;

    /**
     * The file's canvas.
     */
    declare readonly canvas: CanvasView;

    /**
     * The file's object factory.
     */
    declare readonly factory: DiagramObjectViewFactory;


    /**
     * Creates a new {@link DiagramModelFile}.
     * @param factory
     *  The file's object factory.
     */
    constructor(factory: DiagramObjectViewFactory);

    /**
     * Imports a {@link DiagramModelFile}.
     * @param factory
     *  The file's object factory.
     * @param diagram
     *  The file to import.
     * @param stix
     * The STIX bundle to import.
     */
    constructor(factory: DiagramObjectViewFactory, diagram?: DiagramViewExport | Canvas);
    constructor(factory: DiagramObjectViewFactory, diagram?: DiagramViewExport | Canvas) {
        // Create / Import
        super(factory, diagram);
        // Calculate layout
        this.canvas.calculateLayout();
        // Run layout engine
        if (diagram && !(diagram instanceof Canvas) && diagram.layout) {
            new ManualLayoutEngine(diagram.layout).run([this.canvas]);
        }
        // Set camera
        this.camera = diagram instanceof Canvas || !diagram?.camera ? ({ x: 0, y: 0, k: 1 }) : diagram.camera;
    }


    /**
     * Applies a new theme to the diagram.
     * @param theme
     *  The theme to apply.
     */
    public async applyTheme(theme: DiagramTheme) {
        // Replace factory theme
        this.factory.theme = theme;
        // Restyle diagram
        this.factory.restyleDiagramObject([this.canvas]);
    }

    /**
     * Runs the specified layout engine on the file's diagram.
     * @param layout
     *  The layout engine to apply.
     */
    public runLayout(layout: DiagramLayoutEngine) {
        layout.run([this.canvas]);
    }

    /**
     * Exports the file.
     * @returns
     *  The serialized file.
     */
    public toExport(): DiagramViewExport {
        const model = super.toExport();
        return {
            schema  : model.schema,
            theme   : this.factory.theme.id,
            objects : model.objects,
            layout  : ManualLayoutEngine.generatePositionMap([this.canvas]),
            camera  : this.camera
        };
    }

}

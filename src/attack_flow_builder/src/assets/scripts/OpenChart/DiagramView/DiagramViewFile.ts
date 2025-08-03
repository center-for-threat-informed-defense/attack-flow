import { ManualLayoutEngine } from "./DiagramLayoutEngine";
import { Canvas, DiagramModelFile, DiagramObjectSerializer } from "@OpenChart/DiagramModel";
import type { CameraLocation } from "./CameraLocation";
import type { DiagramViewExport } from "./DiagramViewExport";
import type { DiagramLayoutEngine } from "./DiagramLayoutEngine";
import type { CanvasView, DiagramObjectView } from "./DiagramObjectView";
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
     */
    constructor(factory: DiagramObjectViewFactory, diagram?: DiagramViewExport);
    constructor(factory: DiagramObjectViewFactory, diagram?: DiagramViewExport) {
        // Create / Import
        super(factory, diagram);
        // Calculate layout
        this.canvas.calculateLayout();
        // Run layout engine
        if (diagram && !(diagram instanceof Canvas) && diagram.layout) {
            new ManualLayoutEngine(diagram.layout).run([this.canvas]);
        }
        // Set camera
        this.camera = diagram?.camera ?? { x: 0, y: 0, k: 1 };
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
     * Clones the {@link DiagramViewFile}.
     * @param match
     *  A predicate which is applied to each child of the canvas. If the
     *  predicate returns false, the child is excluded from the clone.
     */
    public clone(match?: (obj: DiagramObjectView) => boolean): DiagramViewFile {

        // Clone canvas
        const instanceMap = new Map<string, string>();
        const canvas = this.canvas.clone(this.canvas.instance, instanceMap, match);

        // Calculate layout
        canvas.calculateLayout();

        // Apply existing layout to clone
        const existingLayout = ManualLayoutEngine.generatePositionMap([this.canvas]);
        const remappedLayout = Object.fromEntries(
            Object.entries(existingLayout).map(
                ([i, p]) => [instanceMap.get(i)!, p]
            )
        );
        new ManualLayoutEngine(remappedLayout).run([canvas]);

        /**
         * Developer's Note:
         * You may be wondering why we generate a new position map from `canvas`
         * instead of simply using `remappedLayout`.
         *
         * Simply put, `layout` and `remappedLayout` are not always equivalent.
         *
         * For example, `remappedLayout` excludes the positions of latches
         * linked to block anchors. Those same latches may be unlinked in
         * `canvas` if their blocks were omitted from the clone.
         *
         * To ensure these latches are included in the position map, we have to
         * generate a new position map directly from `canvas`.
         */

        // Calculate final layout
        const layout = ManualLayoutEngine.generatePositionMap([canvas]);

        // Return clone
        return new DiagramViewFile(
            this.factory,
            {
                schema  : this.factory.id,
                theme   : this.factory.theme.id,
                objects : DiagramObjectSerializer.exportObjects([canvas]),
                layout  : layout,
                camera  : { ...this.camera }
            }
        );

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

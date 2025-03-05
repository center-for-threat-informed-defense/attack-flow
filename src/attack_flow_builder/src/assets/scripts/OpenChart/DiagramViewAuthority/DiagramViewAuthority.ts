import { ManualLayoutEngine } from "../DiagramLayoutEngine";
import { DiagramModelAuthority, DiagramSerializer } from "../DiagramModelAuthority";
import type { DiagramObjectView } from "../DiagramView";
import type { DiagramViewExport } from "./DiagramViewSerializer";
import type { DiagramViewFactory } from "./DiagramViewSchema";
import type { DiagramLayoutEngine } from "../DiagramLayoutEngine";

export class DiagramViewAuthority extends DiagramModelAuthority<DiagramViewFactory> {


    /**
     * Creates a new {@link DiagramViewAuthority}.
     * @param serializer
     *  The authority's {@link DiagramSerializer}.
     *  (Default: The native serializer.)
     */
    constructor(serializer?: DiagramSerializer) {
        super(serializer);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Create Diagram  ////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Exports a set of diagram objects.
     * @param schema
     *  The diagram's schema identifier.
     * @param diagram
     *  The diagram objects.
     * @returns
     *  The diagram exports.
     */
    public override exportObjects(schema: string, ...diagram: DiagramObjectView[]): DiagramViewExport {
        // Compute base
        const base = this.serializer.exportObjects(
            this.resolveEquivalentFactory(schema),
            diagram
        );
        // Export layout
        const layout = ManualLayoutEngine.generatePositionMap(diagram);
        // Return export
        return { ...base, layout };
    }

    /**
     * Imports a set of diagram objects.
     * @param diagram
     *  The diagram exports.
     * @param layout
     *  The layout to use if the export contains no layout data.
     * @returns
     *  The diagram objects.
     */
    public override importObjects(diagram: DiagramViewExport, layout?: DiagramLayoutEngine): DiagramObjectView[] {
        // Construct objects
        const objects = this.serializer.importObjects(
            this.resolveEquivalentFactory(diagram.schema),
            diagram.objects
        ) as DiagramObjectView[];
        // Apply layout
        if (diagram.layout) {
            new ManualLayoutEngine(diagram.layout).run(objects);
        } else if (layout) {
            layout.run(objects);
        }
        // Return objects
        return objects;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Restyle Diagram  ///////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Restyles a set of diagram objects.
     * @param schema
     *  The schema to use (specified by id).
     * @param diagram
     *  The diagram objects.
     */
    public restyleDiagram(schema: string, diagram: DiagramObjectView[]) {
        this.resolveEquivalentFactory(schema).restyleDiagramObject(diagram);
    }

}

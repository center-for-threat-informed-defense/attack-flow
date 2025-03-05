import { DiagramObject } from "../DiagramModel";
import { DiagramObjectFactory } from "./DiagramSchema";
import { DiagramSerializer } from "./DiagramSerializer";
import type { DiagramExport } from "./DiagramSerializer";

export class DiagramModelAuthority<T extends DiagramObjectFactory = DiagramObjectFactory> {

    /**
     * The authority's diagram serializer.
     */
    public readonly serializer: DiagramSerializer;

    /**
     * The authority's registered object factories.
     */
    private _factory: Map<string, T>;


    /**
     * The authority's registered object factories.
     */
    public get schemas(): ReadonlyMap<string, T> {
        return this._factory;
    }


    /**
     * Creates a new {@link DiagramModelAuthority}.
     * @param serializer
     *  The authority's {@link DiagramSerializer}.
     *  (Default: The native serializer.)
     */
    constructor(serializer: DiagramSerializer = new DiagramSerializer()) {
        this.serializer = serializer;
        this._factory = new Map();
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Factory Registration / Resolution //////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Registers a diagram object factory with the authority.
     * @param factory
     *  The factory.
     */
    public registerObjectFactory(factory: T) {
        this._factory.set(factory.id, factory);
    }


    /**
     * Resolves the requested diagram object factory or an equivalent one.
     * @remarks
     *  In the future, a {@link DiagramModelAuthority} should be configured
     *  with an object that can resolve an equivalent factory based on a
     *  schema's id.
     * @param id
     *  The schema's id.
     */
    public resolveEquivalentFactory(id: string): T {
        const schema = this._factory.get(id);
        if (!schema) {
            throw new Error(`Could not resolve factory: '${id}'.`);
        }
        return schema;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Create Diagram  ////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Creates an empty diagram file.
     * @param schema
     *  The diagram schema to use.
     * @returns
     *  The empty diagram.
     */
    public createEmptyFile(schema: string): DiagramObject {
        const factory = this.resolveEquivalentFactory(schema);
        return factory.createNewDiagramObject(factory.page);
    }

    /**
     * Exports a set of diagram objects.
     * @param schema
     *  The diagram's schema identifier.
     * @param diagram
     *  The diagram objects.
     * @returns
     *  The diagram exports.
     */
    public exportObjects(schema: string, ...diagram: DiagramObject[]): DiagramExport {
        return this.serializer.exportObjects(
            this.resolveEquivalentFactory(schema),
            diagram
        );
    }

    /**
     * Imports a set of diagram objects.
     * @param diagram
     *  The diagram exports.
     * @returns
     *  The diagram objects.
     */
    public importObjects(diagram: DiagramExport): DiagramObject[] {
        return this.serializer.importObjects(
            this.resolveEquivalentFactory(diagram.schema),
            diagram.objects
        );
    }

}

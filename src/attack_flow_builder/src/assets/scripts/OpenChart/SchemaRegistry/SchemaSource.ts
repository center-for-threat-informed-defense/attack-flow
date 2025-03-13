import type { DiagramSchemaConfiguration } from "@OpenChart/DiagramModel";

export abstract class SchemaSource {

    /**
     * The schema's id.
     */
    public readonly id: string;


    /**
     * Creates a new {@link SchemaSource}.
     * @param id
     *  The schema's id.
     */
    constructor(id: string) {
        this.id = id;
    }


    /**
     * Returns the schema configuration.
     * @returns
     *  A Promise that resolves with the schema configuration.
     */
    abstract getSchema(): Promise<DiagramSchemaConfiguration>;

}

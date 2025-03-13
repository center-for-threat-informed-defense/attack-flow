import { SchemaSource } from "./SchemaSource";
import type { DiagramSchemaConfiguration } from "@OpenChart/DiagramModel";

export class SchemaSourceFile extends SchemaSource {

    /**
     * The schema's configuration.
     */
    private readonly file: DiagramSchemaConfiguration;


    /**
     * Creates a {@link SchemaSourceFile}.
     * @param file
     *  The schema's configuration file.
     */
    constructor(file: DiagramSchemaConfiguration) {
        super(file.id);
        this.file = file;
    }


    /**
     * Returns the schema configuration.
     * @returns
     *  A Promise that resolves with the schema configuration.
     */
    override async getSchema(): Promise<DiagramSchemaConfiguration> {
        return Promise.resolve(this.file);
    }

}

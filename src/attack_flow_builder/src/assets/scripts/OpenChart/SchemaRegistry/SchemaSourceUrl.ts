import { SchemaSource } from "./SchemaSource";
import type { DiagramSchemaConfiguration } from "@OpenChart/DiagramModel";

export class SchemaSourceUrl extends SchemaSource {

    /**
     * The schema's url.
     */
    private readonly url: string;

    /**
     * The schema's configuration file.
     */
    private file: DiagramSchemaConfiguration | undefined;


    /**
     * Creates a {@link SchemaSourceUrl}.
     * @param id
     *  The schema's id.
     * @param url
     *  The schema's url.
     */
    constructor(id: string, url: string) {
        super(id);
        this.url = `${import.meta.env.BASE_URL}${url}`;
    }


    /**
     * Returns the schema configuration.
     * @returns
     *  A Promise that resolves with the schema configuration.
     */
    async getSchema(): Promise<DiagramSchemaConfiguration> {
        if (this.file === undefined) {
            try {
                this.file = await (await fetch(this.url)).json() as DiagramSchemaConfiguration;
            } catch (err) {
                throw new Error(`Failed to download schema '${this.url}'.`);
            }
            if (this.id !== this.file.id) {
                const dl = this.file.id;
                const ex = this.id;
                throw new Error(`Downloaded schema '${dl}', expected '${ex}'.`);
            }
        }
        return this.file;
    }

}

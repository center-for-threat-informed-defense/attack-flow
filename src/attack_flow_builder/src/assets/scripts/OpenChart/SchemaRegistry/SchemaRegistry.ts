import type { SchemaSource } from "./SchemaSource";
import type { DiagramSchemaConfiguration } from "@OpenChart/DiagramModel";

export class SchemaRegistry {

    /**
     * The schema registry.
     */
    private registry: Map<string, SchemaSource>;


    /**
     * Creates a new {@link SchemaRegistry}.
     */
    constructor(schemas?: SchemaSource[]);

    /**
     * Creates a new {@link SchemaRegistry}.
     * @param schemas
     *  The registry's schemas.
     */
    constructor(schemas?: SchemaSource[]);
    constructor(schemas?: SchemaSource[]) {
        this.registry = new Map();
        for (const schema of schemas ?? []) {
            this.registerSchema(schema);
        }
    }


    /**
     * Registers a schema.
     * @param source
     *  The schema's source.
     */
    public registerSchema(source: SchemaSource) {
        this.registry.set(source.id, source);
    }

    /**
     * Deregisters a schema, if it exists.
     * @param id
     *  The schema's id.
     * @returns
     *  True if the schema was removed, false otherwise.
     */
    public deregisterSchema(id: string): boolean {
        return this.registry.delete(id);
    }

    /**
     * Lists the registered schemas.
     * @returns
     *  The registered schemas.
     */
    public listSchema(): { id: string }[] {
        return [...this.registry.values()]
            .map(t => ({ id: t.id }));
    }

    /**
     * Returns a registered {@link DiagramSchemaConfiguration}.
     * @param id
     *  The schema's id.
     */
    public async getSchema(id: string): Promise<DiagramSchemaConfiguration> {
        const source = this.registry.get(id);
        if (!source) {
            throw new Error(`Registry has no schema '${id}'.`);
        }
        return await source.getSchema();
    }

}

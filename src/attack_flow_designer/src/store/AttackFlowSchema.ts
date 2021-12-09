export class AttackFlowSchema implements Types.IAttackFlowSchema {
    
    public lists: Map<string, Array<any>>;
    public nodes: Map<string, Types.NodeSchema>;
    public edges: Map<string, Types.EdgeSchema>;
    
    /**
     * Creates a new Attack Flow Schema
     * @param schema The schema configuration object.
     */
    public constructor(schema: any) {
        // Define Maps
        this.lists = new Map<string, Array<any>>();
        this.nodes = new Map<string, Types.NodeSchema>();
        this.edges = new Map<string, Types.EdgeSchema>();
        // Parse Lists
        for(let key in schema.lists) {
            this.lists.set(key, schema.lists[key]);
        }
        // Parse Node Schemas
        for(let key in schema.nodes) {
            this.nodes.set(key, {
                color      : schema.nodes[key].color,
                outline    : schema.nodes[key].outline,
                subtype    : this.parseField(schema.nodes[key].subtype),
                fields     : this.parseFields(schema.nodes[key].fields),
                fieldsText : schema.nodes[key].fields
            })
        }
        // Parse Edge Schemas
        for(let key in schema.edges) {
            this.edges.set(key, {
              color      : schema.edges[key].color,
              fields     : this.parseFields(schema.edges[key].fields),
              fieldsText : schema.edges[key].fields
            })
        }
    }

    /**
     * Parses an object of recursively defined fields and flattens them into a single array.
     * @param fields The object of fields to parse and flatten.
     * @returns The list of parsed fields.
     */
    private parseFields(fields: any): Map<string, Types.NodeField> {
        let list = new Map<string, Types.NodeField>();
        (function getFields(this: any, fields: any, namespace: string){
            for(let key in fields) {
                if(fields[key].type.toLocaleLowerCase() === "object") {
                    getFields.apply(this, [fields[key].object, `${namespace}${key}.`])
                } else {
                    list.set(`${namespace}${key}`, this.parseField(fields[key]));
                }
            }
        }).apply(this, [fields, ""])
        return list;
    }

    /**
     * Parses an individual field. Links auxillary data (e.g. options for dropdown fields).
     * @param field The field to parse.
     * @returns The parsed field.
     */
    private parseField(field: any) {
        if(field === null)
            return field;
        switch(field.type.toLocaleLowerCase()) {
            case "dropdown":
                let options = this.lists.get(field.list);
                return { ...field, options };
            default:
                return field;
        }
    }

}
import { DiagramValidator } from "./scripts/DiagramValidator/DiagramValidator";
import { 
    DiagramObjectModel, 
    DictionaryProperty, 
    GraphObjectExport, 
    ListProperty, 
    Property, 
    PropertyType,
    SemanticAnalyzer 
} from "./scripts/BlockDiagram";

class AttackFlowValidator extends DiagramValidator {

    /**
     * Validates a diagram.
     * @param diagram
     *  The diagram to validate.
     */
    protected override validate(diagram: DiagramObjectModel): void {
        let graph = SemanticAnalyzer.toGraph(diagram);

        // Validate nodes
        for (let [id, node] of graph.nodes) {
            this.validateNode(id, node);
        }
        // Validate edges
        for (let [id, edge] of graph.edges) {
            this.validateEdge(id, edge);
        }
    }

    /**
     * Validates a node.
     * @param id
     *  The node's id.
     * @param node
     *  The node.
     */
    protected validateNode(id: string, node: GraphObjectExport) {
        // Validate properties
        for (const [key, value] of node.props.value) {
            this.validateProperty(id, key, value)

            // Additional validation for reference-based (tactic_ref + technique_ref) properties
            const STIXregex = /^(?:[a-z][a-z0-9-]+[a-z0-9]--[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|Null)$/i

            if(key == "tactic_ref" && !STIXregex.test(String(value))) {
                this.addError(id, "Invalid STIX tactic reference.");
            } else if (key == "technique_ref" && !STIXregex.test(String(value))) {
                this.addError(id, "Invalid STIX technique reference.");
            }
        }
        // Validate links
        switch(node.template.id) {
            case "note":
                if(node.next.length === 0) {
                    this.addError(id, "A Note must point to at least one object.");
                }
                break;
        }
    }

    /**
     * Validates a property against its descriptor.
     * @param id
     *  The property's node id.
     * @param name
     *  The property's name.
     * @param property
     *  The property.
     */
    protected validateProperty(id: string, name: string, property: Property) {
        switch (property.type) {
            case PropertyType.Int:
            case PropertyType.Float:
            case PropertyType.String:
            case PropertyType.Date:
            case PropertyType.Enum:
                let descriptor = property.descriptor as any;
                if(descriptor.is_required && !property.isDefined()) {
                    this.addError(id, `Missing required field: '${ name }'`);
                }
                break;
            case PropertyType.Dictionary:
                if(property instanceof DictionaryProperty) {
                    for(let [k, v] of property.value) {
                        this.validateProperty(id, `${ name }.${ k }`, v);
                    }
                }
                break;
            case PropertyType.List:
                if(property instanceof ListProperty) {
                    for(let v of property.value.values()) {
                        switch(v.type) {
                            case PropertyType.Int:
                            case PropertyType.Float:
                            case PropertyType.String:
                            case PropertyType.Date:
                            case PropertyType.Enum:
                                let descriptor = v.descriptor as any;
                                if(descriptor.is_required && !v.isDefined()) {
                                    this.addError(id, `Empty item in list: '${ name }'.`);
                                }
                                break;
                            case PropertyType.List:
                                throw new Error("Unexpected list property.");
                            case PropertyType.Dictionary:
                                this.validateProperty(id, name, v);
                                break;
                        }
                    }
                }
                break;
        }
    }

    /**
     * Validates an edge.
     * @param id
     *  The edge's id.
     * @param edge
     *  The edge.
     */
    protected validateEdge(id: string, edge: GraphObjectExport) {
        if (edge.prev.length === 0 || edge.next.length === 0) {
            this.addWarning(id, "Edge should connect on both ends.");
        }
    }

}

export default AttackFlowValidator;

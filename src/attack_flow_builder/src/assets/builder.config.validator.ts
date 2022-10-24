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
        let nodes = new Map<string, GraphObjectExport>();

        // Check nodes:
        for (let node of graph.nodes) {
            this.checkNode(node);
            nodes.set(node.id, node);
        }
        // Check edges:
        for (let edge of graph.edges) {
            this.checkEdge(edge);
        }

    }

    /**
     * Check that the edge is connected to a source and target node.
     *
     * @param edge
     */
    protected checkEdge(edge: GraphObjectExport) {
        if (edge.prev.length === 0 || edge.next.length === 0) {
            this.addWarning(edge, "Edges should be connected on both ends.");
        }
    }

    /**
     * Validate a node.
     *
     * @param node
     */
    protected checkNode(node: GraphObjectExport) {
        for (const [key, value] of node.data.value) {
            if (node.template.properties) {
                this.checkProperty(node, key, value)
            }
        }
    }

    /**
     * Check a value against a property descriptor.
     *
     * @param node - The node associated with this value
     * @param name - The property name
     * @param value - The property value
     * @param prop - The property descriptor
     */
    protected checkProperty(node: GraphObjectExport, name: string, value: Property) {
        switch (value.type) {
            case PropertyType.Int:
            case PropertyType.Float:
            case PropertyType.String:
            case PropertyType.Date:
            case PropertyType.Enum:
                if((value.descriptor as any).is_required && !value.isDefined()) {
                    this.addError(node, `Missing required field: ${name}`);
                }
                break;
            case PropertyType.Dictionary:
                if(value instanceof DictionaryProperty) {
                    for(let [k, v] of value.value) {
                        this.checkProperty(node, k, v);
                    }
                }
                break;
            case PropertyType.List:
                if(value instanceof ListProperty) {
                    for(let [k, v] of value.value) {
                        if((v.descriptor as any).is_required && !v.isDefined()) {
                            this.addError(node, `Empty item in list: ${name}.`);
                        }
                    }
                }
                break;
        }
    }

}

export default AttackFlowValidator;

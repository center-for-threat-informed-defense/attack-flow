import { DiagramValidator } from "./scripts/DiagramValidator/DiagramValidator";
import { DiagramObjectModel, GraphObjectExport, SemanticAnalyzer } from "./scripts/BlockDiagram";
import {
    PropertyType,
    RestrictedPropertyDescriptor,
    StringPropertyDescriptor,
    NumberPropertyDescriptor,
    DatePropertyDescriptor,
    DropdownPropertyDescriptor,
    ListPropertyDescriptor,
    DictionaryPropertyDescriptor
} from "./scripts/BlockDiagram/Property/PropertyDescriptorTypes";

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
            this.addError(edge, "This edge must be connected on both ends.");
        }
    }

    /**
     * Validate a node.
     *
     * @param node
     */
    protected checkNode(node: GraphObjectExport) {
        const propertyDefs = node.template.properties;

        for (const [key, value] of node.data.properties) {
            if (node.template.properties) {
                this.checkProperty(node, key, value, node.template.properties[key])
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
    protected checkProperty(node: GraphObjectExport, name: string, value: number|string|Date, prop: RestrictedPropertyDescriptor) {
        switch (prop.type) {
            case PropertyType.Int:
                this.checkIntProperty(node, name, value as number, prop as NumberPropertyDescriptor);
                break;
            case PropertyType.Float:
                this.checkFloatProperty(node, name, value as number, prop as NumberPropertyDescriptor);
                break;
            case PropertyType.String:
                this.checkStringProperty(node, name, value as string, prop as StringPropertyDescriptor);
                break;
            case PropertyType.Date:
                this.checkDateProperty(node, name, value as Date, prop as DatePropertyDescriptor);
                break;
            case PropertyType.Dropdown:
                this.checkDropdownProperty(node, name, value as number, prop as DropdownPropertyDescriptor);
                break;
            // TODO implement these types:
            // case PropertyType.List:
            //     this.checkListProperty(node, name, values, prop as ListPropertyDescriptor);
            //     break;
            // case PropertyType.Dictionary:
            //     this.checkDictionaryProperty(node, name, values, prop as DictionaryPropertyDescriptor);
            //     break;
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
    protected checkIntProperty(node: GraphObjectExport, name: string, value: number, prop: NumberPropertyDescriptor) {
        if (prop.is_required && value === null) {
            this.addError(node, `Missing required field: ${name}`);
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
    protected checkFloatProperty(node: GraphObjectExport, name: string, value: number, prop: NumberPropertyDescriptor) {
        if (prop.is_required && value === null) {
            this.addError(node, `Missing required field: ${name}`);
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
    protected checkStringProperty(node: GraphObjectExport, name: string, value: string, prop: StringPropertyDescriptor) {
        if (prop.is_required && (value === null || value.trim().length == 0)) {
            this.addError(node, `Missing required field: ${name}`);
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
    protected checkDateProperty(node: GraphObjectExport, name: string, value: Date,
        prop: DatePropertyDescriptor) {
        if (prop.is_required && value === null) {
            this.addError(node, `Missing required field: ${name}`);
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
    protected checkDropdownProperty(node: GraphObjectExport, name: string, value: number,
        prop: DropdownPropertyDescriptor) {
        if (prop.is_required && value === null) {
            this.addError(node, `Missing required field: ${name}`);
        }
    }
}

export default AttackFlowValidator;

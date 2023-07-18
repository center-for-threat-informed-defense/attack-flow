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

    static WindowsRegistryregex = /^(Computer\\)?((HKEY_LOCAL_MACHINE)|(HKEY_CURRENT_CONFIG)|(HKEY_CLASSES_ROOT)|(HKEY_CURRENT_USER)|(HKEY_YSERS))\\(.*)[^\\]/
    static IPv4regex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2][0-9]|[0-9]))?$/;
    static IPv6regex = /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?(\/(12[0-8]|1[0-1][0-9]|[1-9][0-9]|[0-9]))?$/i;
    static MACregex = /^([0-9a-f]{2}[:]){5}([0-9a-f]{2})$/i;

    /**
     * Validates a diagram.
     * @param diagram
     *  The diagram to validate.
     */
    protected override validate(diagram: DiagramObjectModel): void {
        let graph = SemanticAnalyzer.toGraph(diagram);

        // Validate nodes
        let actionNodeCount = 0;
        let flowId;
        for (let [id, node] of graph.nodes) {
            if (node.template.id == "flow") {
                flowId = id;
            }
            if (node.template.id == "action") {
                actionNodeCount++;
            }
            this.validateNode(id, node);
        }

        // The flow requires at least one start_ref, which means it must have at least one action node.
        if (flowId && actionNodeCount == 0) {
            this.addError(flowId, "The flow must have at least one action in it.");
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

            // Additional validation for network address properties
            if (node.template.id == "ipv4_addr" && !AttackFlowValidator.IPv4regex.test(String(value))) {
               this.addError(id, "Invalid IPv4 address."); 
            } else if (node.template.id == "ipv6_addr" && !AttackFlowValidator.IPv6regex.test(String(value))) {
                this.addError(id, "Invalid IPv6 address.");
            } else if (node.template.id == "mac_addr" && !AttackFlowValidator.MACregex.test(String(value))) {
                this.addError(id, "Invalid MAC address.");
            }
        }
        // Validate links
        switch(node.template.id) {
            case "note":
                if(node.next.length === 0) {
                    this.addError(id, "A Note must point to at least one object.");
                }
                break;
            case "windows_registry_key": // Additional validation for windows registry keys
                if (!AttackFlowValidator.WindowsRegistryregex.test(String(node.props.value.get("key")))) {
                    this.addError(id, "Invalid Windows registry key.");
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

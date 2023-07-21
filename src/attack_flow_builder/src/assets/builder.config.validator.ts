import { DiagramValidator } from "./scripts/DiagramValidator/DiagramValidator";
import {
    DiagramObjectModel,
    DictionaryProperty,
    GraphExport,
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
    static Emailregex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    protected graph?: GraphExport;

    static STIXregex = /^(?:[a-z][a-z0-9-]+[a-z0-9]--[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|null)$/i

    /**
     * Validates a diagram.
     * @param diagram
     *  The diagram to validate.
     */
    protected override validate(diagram: DiagramObjectModel): void {
        this.graph = SemanticAnalyzer.toGraph(diagram);
        // Validate nodes
        let actionNodeCount = 0;
        let flowId;
        for (let [id, node] of this.graph.nodes) {
            if (node.template.id === "flow") {
                flowId = id;
            }
            if (node.template.id === "action") {
                actionNodeCount++;
            }
            this.validateNode(id, node);
        }

        // The flow requires at least one start_ref, which means it must have at least one action node.
        if (flowId && actionNodeCount === 0) {
            this.addError(flowId, "The flow must have at least one action in it.");
        }

        // Validate edges
        for (let [id, edge] of this.graph.edges) {
            this.validateEdge(id, edge);
        }
    }

    /**
     * Get a node from the graph.
     * @param id
     *  Node identifier.
     * @returns a node
     */
    protected getNode(id: string): GraphObjectExport {
        if (this.graph) {
            const node = this.graph.nodes.get(id);
            if (node) {
                return node;
            } else {
                throw new Error(`Node id=${id} not found in graph.`);
            }
        } else {
            throw new Error("Cannot call getNode() before validate()");
        }
    }

    /**
     * Enumerate inbound nodes for a given node ID.
     * @param id
     *  Node identifier.
     * @returns a generator
     */
    protected* getInboundNodes(id: string): Generator<[string, GraphObjectExport]> {
        const node = this.getNode(id);
        for (const edgeId of node.prev) {
            const edge = this.getEdge(edgeId);
            for (const prevId of edge.prev) {
                yield [prevId, this.getNode(prevId)];
            }
        }
    }

    /**
     * Enumerate outbound nodes for a given node ID.
     * @param id
     *  Node identifier.
     * @returns a generator
     */
    protected* getOutboundNodes(id: string): Generator<[string, GraphObjectExport]> {
        const node = this.getNode(id);
        for (const edgeId of node.next) {
            const edge = this.getEdge(edgeId);
            for (const nextId of edge.next) {
                yield [nextId, this.getNode(nextId)];
            }
        }
    }

    /**
     * Get an edge from the graph.
     * @param id
     *  Edge identifier.
     * @returns an edge
     */
    protected getEdge(id: string): GraphObjectExport {
        if (this.graph) {
            const edge = this.graph.edges.get(id);
            if (edge) {
                return edge;
            } else {
                throw new Error(`Edge id=${id} not found in graph.`);
            }
        } else {
            throw new Error("Cannot call getEdge() before validate()");
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
            if(key === "tactic_ref" && !AttackFlowValidator.STIXregex.test(String(value))) {
                this.addError(id, "Invalid STIX tactic reference.");
            } else if (key === "technique_ref" && !AttackFlowValidator.STIXregex.test(String(value))) {
                this.addError(id, "Invalid STIX technique reference.");
            }
            // Additional validation for network address properties
            else if (node.template.id === "ipv4_addr" && !AttackFlowValidator.IPv4regex.test(String(value))) {
               this.addError(id, "Invalid IPv4 address."); 
            } else if (node.template.id === "ipv6_addr" && !AttackFlowValidator.IPv6regex.test(String(value))) {
                this.addError(id, "Invalid IPv6 address.");
            } else if (node.template.id === "mac_addr" && !AttackFlowValidator.MACregex.test(String(value))) {
                this.addError(id, "Invalid MAC address.");
            }
        }
        // Validate links
        switch(node.template.id) {
            case "grouping":
                if(node.next.length === 0) {
                    this.addError(id, "A Grouping must point to at least one object.");
                }
            break;
            case "malware_analysis":
                if(!node.props.value.get("result")?.isDefined()) {
                    // If "result" is empty, check for "analysis_sco_refs"
                    if(node.next.length === 0) {
                        this.addError(id, "A Malware Analysis must have the Result field filled out or point to at least one object captured during analysis.")
                    }
                }
                break;
            case "network_traffic":
                this.validateNetworkTrafficLinks(id, node);
                break;
            case "note":
                if(node.next.length === 0) {
                    this.addError(id, "A Note must point to at least one object.");
                }
                break;
            case "report":
                if(node.next.length === 0) {
                    this.addError(id, "A Report must point to at least one object.");
                }
                break;
            case "windows_registry_key": // Additional validation for windows registry keys
                if (!AttackFlowValidator.WindowsRegistryregex.test(String(node.props.value.get("key")))) {
                    this.addError(id, "Invalid Windows registry key.");
                }
                break;
            case "email_address": // Additional validation for email addresses
                if (!AttackFlowValidator.Emailregex.test(String(node.props.value.get("value")))) {
                    this.addError(id, "Invalid email address.")
                }
                break;
            case "location": // Additional validation for location object
                const region = node.props.value.get("region");
                const country = node.props.value.get("country");
                const latitude = node.props.value.get("latitude");
                const longitude = node.props.value.get("longitude");

                // Verify one of the required properties is set
                if(!region?.isDefined() && !country?.isDefined() && !(latitude?.isDefined() || longitude?.isDefined())) {
                    this.addError(id, "Location requires one of the following properties: Region, Country, Latitude+Longitude.");
                }

                // Latitude + Longitude check
                if(latitude?.isDefined() !== longitude?.isDefined()) {
                    this.addError(id, "Latitude and Longitude must be supplied together.");
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
                    let descriptor = property.descriptor as any;
                    if (descriptor.min_items != null && property.value.size < descriptor.min_items) {
                        const suffix = descriptor.min_items === 1 ? "" : "s";
                        this.addError(id, `${name}: Requires at least ${descriptor.min_items} item${suffix}`);
                    }
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

    /**
     * Validates the links to/from a network-traffic node.
     *
     * The requirements are a bit tricky: it must have a source node pointing to it, or it needs to point at
     * at a destination node. The source/destination must be an IP address, MAC address, or domain name.
     *
     * Reference: https://docs.oasis-open.org/cti/stix/v2.1/os/stix-v2.1-os.html#_rgnc3w40xy
     *
     * @param id
     *  The node's id.
     * @param node
     *  The node.
     */
    protected validateNetworkTrafficLinks(id: string, node: GraphObjectExport) {
        let networkSrc = null, networkDst = null;
        const validSrcDst = /^((ipv[46]|mac)_addr|domain_name)$/;

        // Check inbound nodes for a single valid networkSrc.
        for (const [inboundId, inboundNode] of this.getInboundNodes(id)) {
            if (validSrcDst.test(inboundNode.template.id)) {
                if (networkSrc) {
                    this.addWarning(inboundId,
                        "Network Traffic should only have one incoming IP, MAC, or domain name.");
                } else {
                    networkSrc = inboundNode;
                }
            }
        }

        // Check outbound nodes for a single valid networkDst.
        for (const [outboundId, outboundNode] of this.getOutboundNodes(id)) {
            if (validSrcDst.test(outboundNode.template.id)) {
                if (networkDst) {
                    this.addWarning(outboundId,
                        "Network Traffic should only have one outgoing IP, MAC, or domain name.");
                } else {
                    networkDst = outboundNode;
                }
            }
        }

        if (!(networkSrc || networkDst)) {
            this.addError(id, "Network Traffic must be linked to an IP, MAC, or domain name.")
        }
    }
}

export default AttackFlowValidator;

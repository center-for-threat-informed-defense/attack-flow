import { DiagramValidator } from "../scripts/DiagramValidator/DiagramValidator";
import {
    DiagramObjectModel,
    DictionaryProperty,
    GraphExport,
    GraphObjectExport,
    ListProperty,
    Property,
    PropertyType,
    RawEntries,
    SemanticAnalyzer
} from "../scripts/BlockDiagram";

class AttackFlowValidator extends DiagramValidator {
    
    /**
     * Windows Registry Regex
     */
    static WindowsRegistryRegex = /^(Computer\\)?((HKEY_LOCAL_MACHINE)|(HKEY_CURRENT_CONFIG)|(HKEY_CLASSES_ROOT)|(HKEY_CURRENT_USER)|(HKEY_USERS))\\(.*)[^\\]/
    
    /**
     * IPv4 Regex
     */
    static IPv4Regex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2][0-9]|[0-9]))?$/;
    
    /**
     * IPv6 Regex
     */
    static IPv6Regex = /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?(\/(12[0-8]|1[0-1][0-9]|[1-9][0-9]|[0-9]))?$/i;
    
    /**
     * Mac Address Regex
     */
    static MacAddressRegex = /^([0-9a-f]{2}[:]){5}([0-9a-f]{2})$/i;
    
    /**
     * Email Address Regex
     */
    static EmailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
    /**
     * STIX Regex
     */
    static StixRegex = /^(?:[a-z][a-z0-9-]+[a-z0-9]--[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|null)$/i

    /**
     * STIX Observables list
     */
    static StixObservables = new Set<string>(["artifact", "directory", "file", "mutex", "process", "software", "user_account", "windows_registry_key", "x509_certificate", "autonomous_system", "domain_name", "email_address", "email_message", "ipv4_addr", "ipv6_addr", "mac_addr", "network_traffic", "url"]);

    /**
     * Payload Regex
     */
    static PayloadRegex = /^([a-z0-9+/]{4})*([a-z0-9+/]{4}|[a-z0-9+/]{3}=|[a-z0-9+/]{2}==)$/i;
    
    /**
     * MIME Type Regex
     */
    static MimeTypeRegex = /^(application|audio|font|image|message|model|multipart|text|video)\/[a-zA-Z0-9.+_-]+/;

    /**
     * Regex for different hash types
     */
    static HashRegexes = new Map<string, RegExp>([
        ["md5", /^[a-zA-Z0-9]{32}$/],
        ["sha-1", /^[a-zA-Z0-9]{40}$/], 
        ["sha-256", /^[a-zA-Z0-9]{64}$/], 
        ["sha-512", /^[a-zA-Z0-9]{128}$/], 
        ["sha3-256", /^[a-zA-Z0-9]{64}$/], 
    ]);

    /**
     * The validator's parsed graph.
     */
    protected graph?: GraphExport;


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
            this.validateProperty(id, key, value);
            // Additional validation for reference-based (tactic_ref + technique_ref) properties
            if(key === "tactic_ref" && !AttackFlowValidator.StixRegex.test(value.toString())) {
                this.addError(id, "Invalid STIX tactic reference.");
            }
            else if (key === "technique_ref" && !AttackFlowValidator.StixRegex.test(value.toString())) {
                this.addError(id, "Invalid STIX technique reference.");
            }
        }
        // Validate links
        switch(node.template.id) {

            case "artifact": {
                const url = node.props.value.get("url");
                const hashes = node.props.value.get("hashes");
                const mimeType = node.props.value.get("mime_type");
                const payloadBin = node.props.value.get("payload_bin");
                const decryptionKey = node.props.value.get("decryption_key");
                const encryptionAlg = node.props.value.get("encryption_algorithm")
                // Validate regex
                if(payloadBin?.isDefined() && !AttackFlowValidator.PayloadRegex.test(payloadBin.toString())) {
                    this.addError(id, "Invalid Payload Bin.");
                }
                if(mimeType?.isDefined() && !AttackFlowValidator.MimeTypeRegex.test(mimeType.toString())) {
                    this.addError(id, "Invalid MIME Type.");
                }
                // Validate Payload Bin, URL, and Hashes
                if (payloadBin?.isDefined() && url?.isDefined()) {
                    this.addError(id, "An artifact can have either a payload or a URL, but not both.");
                }
                if (url?.isDefined() && !hashes?.isDefined()) {
                    this.addError(id, "An artifact with a URL must have at least one hash.");
                }
                // Validate hashes
                if(hashes?.isDefined()) {
                    this.validateHash(id, hashes as ListProperty);
                }
                // Validate encryption and decryption algorithms
                if(encryptionAlg?.isDefined()) {
                    if(encryptionAlg.toRawValue()?.toString() == "mime-type-indicated" && !mimeType?.isDefined()) {
                        this.addError(id, "For Encryption Algorithm to be 'Mime Type Indicated', the field 'Mime Type' cannot be empty.");
                    }
                } else if(decryptionKey?.isDefined()) {
                    this.addError(id, "An Artifact with a Decryption Key must also have an Encryption Algorithm.");
                }
                break;
            }

            case "email_address": // Additional validation for email addresses
                const email = node.props.value.get("value");
                if(email?.isDefined() && !AttackFlowValidator.EmailRegex.test(email?.toString())) {
                    this.addError(id, "Invalid email address.");
                }                
                break;

            case "file":
                const name = node.props.value.get("name");
                const hashes = node.props.value.get("hashes");
                if(!hashes?.isDefined() && !name?.isDefined()) {
                    this.addError(id, "File requires one of the following properties: Hashes, Name");
                }
                if(hashes?.isDefined()) {
                    this.validateHash(id, hashes as ListProperty);
                }
                break;
            
            case "flow":
                const scope = node.props.value.get("scope");
                if (!scope?.isDefined()) {
                    this.addError(id, "The flow properties must have a selected scope.")
                }
                break;

            case "grouping":
                if(node.next.length === 0) {
                    this.addError(id, "A Grouping must point to at least one object.");
                }
                break;
            
            case "ipv4_addr":
                const ipv4 = node.props.value.get("value");
                if(ipv4?.isDefined() && !AttackFlowValidator.IPv4Regex.test(ipv4?.toString())) {
                    this.addError(id, "Invalid IPv4 address."); 
                }
                break;
            
            case "ipv6_addr":
                const ipv6 = node.props.value.get("value");
                if(ipv6?.isDefined() && !AttackFlowValidator.IPv6Regex.test(ipv6.toString())) {
                    this.addError(id, "Invalid IPv6 address.");
                }
                break;
            
            case "location":
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

            case "mac_addr":
                const mac = node.props.value.get("value");
                if(mac?.isDefined() && !AttackFlowValidator.MacAddressRegex.test(mac?.toString())) {
                    this.addError(id, "Invalid MAC address.");
                }
                break;
                
            case "malware_analysis":
                if(!node.props.value.get("result")?.isDefined()) {
                    // If "result" is empty, check for "analysis_sco_refs"
                    if(node.next.length === 0) {
                        this.addError(id, "A Malware Analysis must have the Result field filled out or point to at least one object captured during analysis.");
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
            
            case "observed_data":
                if(node.next.length === 0) {
                    this.addError(id, "Observed Data must point to at least one stix observable.");
                } else {
                    // Check the template.id of every child node
                    for (let [childId, childNode] of this.getOutboundNodes(node.props.object.id)) {
                        if(!AttackFlowValidator.StixObservables.has(childNode.template.id)) {
                            this.addError(childId, "Observed Data can only be linked to Stix Observables.");
                        }
                    }
                }
                break;
            
            case "opinion":
                if(node.next.length === 0) {
                    this.addError(id, "An Opinion must point to at least one object.");
                }
                break;
            
            case "report":
                if(node.next.length === 0) {
                    this.addError(id, "A Report must point to at least one object.");
                }
                break;
            
            case "windows_registry_key": // Additional validation for windows registry keys
                const windows_key = node.props.value.get("key");
                if(windows_key?.isDefined() && !AttackFlowValidator.WindowsRegistryRegex.test(windows_key.toString())) {
                    this.addError(id, "Invalid Windows registry key.");
                }
                const regValues = node.props.value.get("values") as ListProperty;
                for (const regValue of regValues.value.values()) {
                    const regName = (regValue as DictionaryProperty).value.get("name");
                    const regData = (regValue as DictionaryProperty).value.get("data");
                    const regType = (regValue as DictionaryProperty).value.get("data_type");
                    if (!regName?.isDefined() && !regData?.isDefined() && !regType?.isDefined()) {
                        this.addError(id, "Windows registry value must define name, data, or data type.");
                    }
                    break; // only show once per node
                }
                break;
            
            case "x509_certificate": {
                const hashes = node.props.value.get("hashes");
                if(hashes?.isDefined()) {
                    this.validateHash(id, hashes as ListProperty);
                }
                break;
            }
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
                                if(!v.isDefined()) {
                                    this.addError(id, `Empty item in "${ name }" list.`);
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
     * Validate a hash from any hash-containing node.
     * 
     * Reference: https://docs.oasis-open.org/cti/stix/v2.1/os/stix-v2.1-os.html#_odoabbtwuxyd
     * 
     * @param id
     *  The node's id.
     * @param hashes
     *  The list of hashes to validate.
     */
    protected validateHash(id: string, hashes: ListProperty) {
        const validKey = /^[a-zA-Z0-9_-]{3,250}$/;
        const hashDictionaryProps = hashes.value;

        if(!hashDictionaryProps) {
            // This is an older AFB file that does not have the Hash property updated to current version.
            this.addWarning(id, "This AFB is outdated, please remake it in a new file.");
            return; 
        }

        for(let hashDictionary of hashDictionaryProps.values()) {
            if(!hashDictionary.isDefined()) {
                this.addError(id, "Hash Value cannot be empty.");
            }
            // Make sure hash_type is not empty.
            let entries = hashDictionary.toRawValue()! as RawEntries;
            let hashType = Object.fromEntries(entries).hash_type?.toString();
            if (hashType === undefined) {
                this.addError(id, "Hash Type cannot be left empty.");
            } else {
                let value = hashDictionary.toString();
                let regex = AttackFlowValidator.HashRegexes.get(hashType);
                if (regex && !regex.test(value)) {
                    this.addError(id, "Invalid hash value.");
                }
            }
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

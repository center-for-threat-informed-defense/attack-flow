import { FileValidator } from "@/assets/scripts/Application";
import { 
    DiagramModelFile, DictionaryProperty,
    ListProperty, Property, SemanticAnalyzer
} from "@OpenChart/DiagramModel";
import {
    EmailRegex, HashRegexes, IPv4Regex, IPv6Regex, 
    MacAddressRegex, MimeTypeRegex, PayloadRegex,
    StixObservables, StixRegex, WindowsRegistryRegex
} from "./AttackFlowRegex";
import type { 
    GraphExport, SemanticGraphNode, SemanticGraphEdge
} from "@OpenChart/DiagramModel";

class AttackFlowValidator extends FileValidator {

    /**
     * The validator's parsed graph.
     */
    protected graph?: GraphExport;


    /**
     * Validates a {@link DiagramModelFile}.
     * @param file
     *  The file to validate.
     */
    protected validate(file: DiagramModelFile) {
        this.graph = SemanticAnalyzer.toGraph(file.canvas);
        // Validate nodes
        let actionNodeCount = 0;
        let flowId;
        for (const [instance, node] of this.graph.nodes) {
            if (node.id === "flow") {
                flowId = instance;
            }
            if (node.id === "action") {
                actionNodeCount++;
            }
            this.validateNode(instance, node);
        }

        // The flow requires at least one start_ref, which means it must have at least one action node.
        if (flowId && actionNodeCount === 0) {
            this.addError(flowId, "The flow must have at least one action in it.");
        }

        // Validate edges
        for (const [id, edge] of this.graph.edges) {
            this.validateEdge(id, edge);
        }
    }

    /**
     * Validates a node.
     * @param instance
     *  The node's instance id.
     * @param node
     *  The node.
     */
    protected validateNode(instance: string, node: SemanticGraphNode) {
        // Validate properties
        for (const [key, value] of node.props.value) {
            this.validateProperty(instance, key, value);
            // Additional validation for reference-based (tactic_ref + technique_ref) properties
            if (key === "tactic_ref" && value.isDefined() && !StixRegex.test(value.toString())) {
                this.addError(instance, "Invalid STIX tactic reference.");
            }
            else if (key === "technique_ref" && value.isDefined() && !StixRegex.test(value.toString())) {
                this.addError(instance, "Invalid STIX technique reference.");
            }
        }
        // Validate links
        switch (node.id) {

            case "artifact": {
                const url = node.props.value.get("url");
                const hashes = node.props.value.get("hashes");
                const mimeType = node.props.value.get("mime_type");
                const payloadBin = node.props.value.get("payload_bin");
                const decryptionKey = node.props.value.get("decryption_key");
                const encryptionAlg = node.props.value.get("encryption_algorithm");
                // Validate regex
                if (payloadBin?.isDefined() && !PayloadRegex.test(payloadBin.toString())) {
                    this.addError(instance, "Invalid Payload Bin.");
                }
                if (mimeType?.isDefined() && !MimeTypeRegex.test(mimeType.toString())) {
                    this.addError(instance, "Invalid MIME Type.");
                }
                // Validate Payload Bin, URL, and Hashes
                if (payloadBin?.isDefined() && url?.isDefined()) {
                    this.addError(instance, "An artifact can have either a payload or a URL, but not both.");
                }
                if (url?.isDefined() && !hashes?.isDefined()) {
                    this.addError(instance, "An artifact with a URL must have at least one hash.");
                }
                // Validate hashes
                if (hashes?.isDefined()) {
                    this.validateHash(instance, hashes as ListProperty);
                }
                // Validate encryption and decryption algorithms
                if (encryptionAlg?.isDefined()) {
                    if (encryptionAlg.toJson()?.toString() == "mime-type-indicated" && !mimeType?.isDefined()) {
                        this.addError(instance, "For Encryption Algorithm to be 'Mime Type Indicated', the field 'Mime Type' cannot be empty.");
                    }
                } else if (decryptionKey?.isDefined()) {
                    this.addError(instance, "An Artifact with a Decryption Key must also have an Encryption Algorithm.");
                }
                break;
            }

            case "email_address": // Additional validation for email addresses
                const email = node.props.value.get("value");
                if (email?.isDefined() && !EmailRegex.test(email?.toString())) {
                    this.addError(instance, "Invalid email address.");
                }
                break;

            case "file":
                const name = node.props.value.get("name");
                const hashes = node.props.value.get("hashes");
                if (!hashes?.isDefined() && !name?.isDefined()) {
                    this.addError(instance, "File requires one of the following properties: Hashes, Name");
                }
                if (hashes?.isDefined()) {
                    this.validateHash(instance, hashes as ListProperty);
                }
                break;

            case "flow":
                const scope = node.props.value.get("scope");
                if (!scope?.isDefined()) {
                    this.addError(instance, "The flow properties must have a selected scope.");
                }
                break;

            case "grouping":
                if (node.next.size === 0) {
                    this.addError(instance, "A Grouping must point to at least one object.");
                }
                break;

            case "ipv4_addr":
                const ipv4 = node.props.value.get("value");
                if (ipv4?.isDefined() && !IPv4Regex.test(ipv4?.toString())) {
                    this.addError(instance, "Invalid IPv4 address.");
                }
                break;

            case "ipv6_addr":
                const ipv6 = node.props.value.get("value");
                if (ipv6?.isDefined() && !IPv6Regex.test(ipv6.toString())) {
                    this.addError(instance, "Invalid IPv6 address.");
                }
                break;

            case "location":
                const region = node.props.value.get("region");
                const country = node.props.value.get("country");
                const latitude = node.props.value.get("latitude");
                const longitude = node.props.value.get("longitude");
                // Verify one of the required properties is set
                if (!region?.isDefined() && !country?.isDefined() && !(latitude?.isDefined() || longitude?.isDefined())) {
                    this.addError(instance, "Location requires one of the following properties: Region, Country, Latitude+Longitude.");
                }
                // Latitude + Longitude check
                if (latitude?.isDefined() !== longitude?.isDefined()) {
                    this.addError(instance, "Latitude and Longitude must be supplied together.");
                }
                break;

            case "mac_addr":
                const mac = node.props.value.get("value");
                if (mac?.isDefined() && !MacAddressRegex.test(mac?.toString())) {
                    this.addError(instance, "Invalid MAC address.");
                }
                break;

            case "malware_analysis":
                if (!node.props.value.get("result")?.isDefined()) {
                    // If "result" is empty, check for "analysis_sco_refs"
                    if (node.next.size === 0) {
                        this.addError(instance, "A Malware Analysis must have the Result field filled out or point to at least one object captured during analysis.");
                    }
                }
                break;

            case "network_traffic":
                this.validateNetworkTrafficLinks(node);
                break;

            case "note":
                if (node.next.size === 0) {
                    this.addError(instance, "A Note must point to at least one object.");
                }
                break;

            case "observed_data":
                if (node.next.size === 0) {
                    this.addError(instance, "Observed Data must point to at least one stix observable.");
                } else {
                    // Check the template.id of every child node
                    for (const outboundNode of node.nextNodes) {
                        if (!StixObservables.has(outboundNode.instance)) {
                            this.addError(outboundNode.instance, "Observed Data can only be linked to Stix Observables.");
                        }
                    }
                }
                break;

            case "opinion":
                if (node.next.size === 0) {
                    this.addError(instance, "An Opinion must point to at least one object.");
                }
                break;

            case "report":
                if (node.next.size === 0) {
                    this.addError(instance, "A Report must point to at least one object.");
                }
                break;

            case "windows_registry_key": // Additional validation for windows registry keys
                const windows_key = node.props.value.get("key");
                if (windows_key?.isDefined() && !WindowsRegistryRegex.test(windows_key.toString())) {
                    this.addError(instance, "Invalid Windows registry key.");
                }
                const regValues = node.props.value.get("values") as ListProperty;
                for (const regValue of regValues.value.values()) {
                    const regName = (regValue as DictionaryProperty).value.get("name");
                    const regData = (regValue as DictionaryProperty).value.get("data");
                    const regType = (regValue as DictionaryProperty).value.get("data_type");
                    if (!regName?.isDefined() && !regData?.isDefined() && !regType?.isDefined()) {
                        this.addError(instance, "Windows registry value must define name, data, or data type.");
                    }
                    break; // only show once per node
                }
                break;

            case "x509_certificate": {
                const hashes = node.props.value.get("hashes");
                if (hashes?.isDefined()) {
                    this.validateHash(instance, hashes as ListProperty);
                }
                break;
            }
        }
    }

    /**
     * Validates a property against its descriptor.
     * @param instance
     *  The property's node instance id.
     * @param name
     *  The property's name.
     * @param property
     *  The property.
     */
    protected validateProperty(instance: string, name: string, property: Property) {
        const metadata = property.metadata?.validator ?? {};
        if(property instanceof DictionaryProperty) {
            for (const [k, v] of property.value) {
                this.validateProperty(instance, `${name}.${k}`, v);
            }
        } else if(property instanceof ListProperty) {
            const min_items = metadata.min_items ?? null;
            if (min_items != null && property.value.size < min_items) {
                const suffix = min_items === 1 ? "" : "s";
                this.addError(instance, `${name}: Requires at least ${min_items} item${suffix}`);
            }
            for (const v of property.value.values()) {
                if(v instanceof DictionaryProperty) {
                    this.validateProperty(instance, name, v);
                } else if(v instanceof ListProperty) {
                    throw new Error("Unexpected list property.");
                } else if (!v.isDefined()) {
                    this.addError(instance, `Empty item in "${name}" list.`);
                }
            }
        } else if (metadata.is_required && !property.isDefined()) {
            this.addError(instance, `Missing required field: '${name}'`);
        }
    }

    /**
     * Validates an edge.
     * @param id
     *  The edge's id.
     * @param edge
     *  The edge.
     */
    protected validateEdge(id: string, edge: SemanticGraphEdge) {
        if (!(edge.source && edge.target)) {
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
        const hashDictionaryProps = hashes.value;

        if (!hashDictionaryProps) {
            // This is an older AFB file that does not have the Hash property updated to current version.
            this.addWarning(id, "This AFB is outdated, please remake it in a new file.");
            return;
        }

        const hashList = hashDictionaryProps.values() as MapIterator<DictionaryProperty>;
        for (const hashDictionary of hashList) {
            if (!hashDictionary.isDefined()) {
                this.addError(id, "Hash Value cannot be empty.");
            }
            // Make sure hash_type is not empty.
            const entries = hashDictionary.toJson();
            const hashType = entries.hash_type?.toString();
            if (hashType === undefined) {
                this.addError(id, "Hash Type cannot be left empty.");
            } else {
                const value = hashDictionary.toString();
                const regex = HashRegexes.get(hashType);
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
    protected validateNetworkTrafficLinks(node: SemanticGraphNode) {
        let networkSrc = null, networkDst = null;
        const validSrcDst = /^((ipv[46]|mac)_addr|domain_name)$/;

        // Check inbound nodes for a single valid networkSrc.
        for (const inboundNode of node.prevNodes) {
            if (validSrcDst.test(inboundNode.id)) {
                if (networkSrc) {
                    this.addWarning(inboundNode.instance,
                        "Network Traffic should only have one incoming IP, MAC, or domain name.");
                } else {
                    networkSrc = inboundNode;
                }
            }
        }

        // Check outbound nodes for a single valid networkDst.
        for (const outboundNode of node.nextNodes) {
            if (validSrcDst.test(outboundNode.id)) {
                if (networkDst) {
                    this.addWarning(outboundNode.instance,
                        "Network Traffic should only have one outgoing IP, MAC, or domain name.");
                } else {
                    networkDst = outboundNode;
                }
            }
        }

        if (!(networkSrc || networkDst)) {
            this.addError(node.instance, "Network Traffic must be linked to an IP, MAC, or domain name.");
        }
    }
}

export default AttackFlowValidator;

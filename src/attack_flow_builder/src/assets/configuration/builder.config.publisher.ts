import { Crypto } from "../scripts/BlockDiagram/Utilities/Crypto";
import { DiagramPublisher } from "../scripts/DiagramPublisher/DiagramPublisher";
import {
    CollectionProperty,
    DiagramObjectModel,
    DictionaryProperty,
    EnumProperty,
    GraphExport,
    GraphObjectExport,
    ListProperty,
    Property,
    PropertyType,
    RawEntries,
    SemanticAnalyzer,
    StringProperty
} from "../scripts/BlockDiagram";


///////////////////////////////////////////////////////////////////////////////
//  Publisher Constants  //////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


const AttackFlowExtensionId
    = "fb9c968a-745b-4ade-9b25-c324172197f4";

const AttackFlowSchemaUrl
    = "https://center-for-threat-informed-defense.github.io/attack-flow/stix/attack-flow-schema-2.0.0.json";

const AttackFlowSchemaVersion
    = "2.0.0";

const AttackFlowExtensionCreatedDate
    = "2022-08-02T19:34:35.143Z";

const AttackFlowExtensionModifiedDate
    = AttackFlowExtensionCreatedDate;

const AttackFlowDocsExternalReference =
    {
        source_name: "Documentation",
        description: "Documentation for Attack Flow",
        url: "https://center-for-threat-informed-defense.github.io/attack-flow"
    };

const AttackFlowGitHubExternalReference =
    {
        source_name: "GitHub",
        description: "Source code repository for Attack Flow",
        url: "https://github.com/center-for-threat-informed-defense/attack-flow"
    };

const AttackFlowExtensionCreatorName
    = "MITRE Engenuity Center for Threat-Informed Defense";

const AttackFlowSdos
    = new Set<string>([
        "attack-flow",
        "attack-action",
        "attack-asset",
        "attack-condition",
        "attack-operator"
    ]);

const AttackFlowTemplatesMap: Map<string, string>
    = new Map([
        ["flow", "attack-flow"],
        ["action", "attack-action"],
        ["asset", "attack-asset"],
        ["condition", "attack-condition"],
        ["or", "attack-operator"],
        ["and", "attack-operator"],
        ["email_address", "email-addr"],
    ]);


///////////////////////////////////////////////////////////////////////////////
//  Attack Flow Publisher  ////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


class AttackFlowPublisher extends DiagramPublisher {

    /**
     * Returns the published diagram in text form.
     * @param diagram
     *  The diagram to publish.
     * @returns
     *  The published diagram in text form.
     */
    public override publish(diagram: DiagramObjectModel): string {
        let graph = SemanticAnalyzer.toGraph(diagram);

        // Extract page
        let pageId = diagram.id;
        let page = graph.nodes.get(pageId);
        if(page) {
            graph.nodes.delete(pageId);
        } else {
            throw new Error("Page object missing from export.")
        }

        // Create bundle
        let stixBundle = this.createStixBundle();
        let author = this.createFlowAuthorSdo(page);
        let startRefs = this.computeStartRefs(graph);
        let flow = this.createFlowSdo(pageId, page, author.id, startRefs);
        stixBundle.objects.push(flow);
        stixBundle.objects.push(author);

        // Graph ID -> STIX node.
        let stixNodes = new Map<string, Sdo>();
        // Parent STIX node -> Child Links
        let stixChildren = new Map<Sdo, Link[]>();

        // Create SDOs and SCOs from graph nodes
        for (let [id, node] of graph.nodes) {
            let stixNode = this.toStixNode(id, node);
            stixBundle.objects.push(stixNode);
            stixNodes.set(id, stixNode);
            stixChildren.set(stixNode, []);
        }

        // Create adjacency list from graph edges
        for (let edge of graph.edges.values()) {
            let prev = edge.prev;
            let next = edge.next;
            // Skip edges that don't connect two nodes
            if(prev.length !== 1 || next.length !== 1)
                continue;
            // Register link
            let prevNode = stixNodes.get(prev[0]);
            let nextNode = stixNodes.get(next[0]);
            if (prevNode && nextNode) {
                stixChildren.get(prevNode)!.push({
                    obj: nextNode,
                    via: edge.prevLinkMap.keys().next().value
                });
            } else {
                throw new Error(`Edge '${ edge }' is missing one or more nodes.`);
            }
        }

        // Embed references
        for (let [node, children] of stixChildren) {
            let SROs = this.tryEmbed(node, children);
            // If any embeds failed, append SROs
            stixBundle.objects.push(...SROs);
        }

        // Return bundle as string
        return JSON.stringify(stixBundle, null, 2);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Stix Node Creation  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Exports a graph object to an SDO or SCO.
     * @param id
     *  The graph object's id.
     * @param node
     *  The graph object.
     * @returns
     *  The exported SDO or SCO.
     */
    private toStixNode(id: string, node: GraphObjectExport): Sdo {
        let obj = this.createSdo(node.template.id, id);
        switch(obj.type) {
            case "attack-action":
                this.mergeActionProperty(obj, node.props);
                break;
            default:
                this.mergeBasicDictProperty(obj, node.props);
                break;
        }
        return obj;
    }

    /**
     * Merges an action's properties into a STIX action node.
     * @param node
     *  The STIX action node.
     * @param property
     *  The action's properties.
     */
    private mergeActionProperty(node: Sdo, property: DictionaryProperty) {
        for(let [key, prop] of property.value) {
            switch(key) {
                case "confidence":
                    if(!(prop instanceof EnumProperty)) {
                        throw new Error("'confidence' is improperly defined.");
                    }
                    if(!prop.isDefined()) {
                        break;
                    }
                    prop = prop.toReferenceValue()!;
                    if(!(prop instanceof DictionaryProperty)) {
                        throw new Error("'confidence' is improperly defined.");
                    }
                    [ prop ] = this.getSubproperties(prop, "value");
                    // Fall through
                default:
                    if(prop.isDefined()) {
                        node[key] = prop.toRawValue();
                    }
            }

            // Remove trailing whitespace on StringProperties
            if (prop instanceof StringProperty && prop.isDefined()) {
                node[key] = prop.toString().trim();
            }
        }
    }

    /**
     * Merges a basic dictionary into a STIX node.
     * @param node
     *  The STIX node.
     * @param property
     *  The dictionary property.
     */
    private mergeBasicDictProperty(node: Sdo, property: DictionaryProperty) {
        for(let [key, prop] of property.value) {
            switch(prop.type) {
                case PropertyType.Dictionary:
                    throw new Error("Basic dictionaries cannot contain dictionaries.");
                case PropertyType.Enum:
                    if (prop instanceof EnumProperty && prop.isDefined()) {
                        let value = prop.toRawValue()!;
                        if(["true", "false"].includes(value.toString())) {
                            // case(BoolEnum)
                            node[key] = value === "true";
                        }
                        else {
                            // case(String | List | Dictionary | null)
                            node[key] = value;
                        }
                    }
                    break;
                case PropertyType.List:
                    if (prop.isDefined()) {
                        if(key === "hashes") {
                            this.mergeComplexListProperty(node, key, prop as ListProperty);
                            break;
                        }
                        this.mergeBasicListProperty(node, key, prop as ListProperty);
                    }
                    break;
                case PropertyType.String: // Remove trailing whitespace on StringProperties
                    if (prop.isDefined()) {
                        node[key] = prop.toString().trim();
                    }
                    break;
                default:
                    if(prop.isDefined()) {
                        if(node.type === "mac-addr") {
                            node[key] = prop.toRawValue()!.toString().toLowerCase();
                            break;
                        }
                        node[key] = prop.toRawValue();
                    }
                    break;
            }
        }
    }

    /**
     * Merges a basic list into a STIX node.
     * @param node
     *  The STIX node.
     * @param key
     *  The list property's key.
     * @param property
     *  The list property.
     */
    private mergeBasicListProperty(node: Sdo, key: string, property: ListProperty) {
        node[key] = [];
        for(let prop of property.value.values()) {
            switch(prop.type) {
                case PropertyType.Dictionary:
                    const obj = {} as any;
                    this.mergeBasicDictProperty(obj, prop as DictionaryProperty);
                    node[key].push(obj);
                    break;
                case PropertyType.List:
                    throw new Error("Basic lists cannot contain lists.");
                case PropertyType.Enum:
                    throw new Error("Basic lists cannot contain enums.");
                case PropertyType.String: // Remove trailing whitespace on StringProperties
                    if(prop.isDefined()) {
                        node[key].push(prop.toString().trim());
                    }
                    break;
                default:
                    if(prop.isDefined()) {
                        node[key].push(prop.toRawValue());
                    }
                    break;
            }
        }
    }

    /**
     * Merges a more complicated list into a STIX node.
     * @param node
     *  The STIX node.
     * @param key
     *  The list property's key.
     * @param property
     *  The list property.
     */
    private mergeComplexListProperty(node: Sdo, key: string, property: ListProperty) {
        switch(key) {
            case "hashes":
                let hashList = [];
                for(let prop of property.value.values()) {
                    switch(prop.type) {
                        case PropertyType.Dictionary:
                            if(prop.isDefined()) {
                                let entries = prop.toRawValue() as RawEntries;
                                hashList.push(Object.fromEntries(entries));
                            }
                            break;
                    }
                }
                if (hashList.length > 0) {
                    let hashes = hashList.map(hash => [hash.hash_type, hash.hash_value]); // Drop the property labels
                    node[key] = Object.fromEntries(hashes);
                }
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    //  2. Relationships Embeddings  //////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Embed a reference to each child in the parent. If any of the children
     * cannot be embedded, return a new SRO in its place.
     *
     * @remarks
     * While processing each node, we also process the in edges and out edges of that
     * node. Some edges may be represented as embedded refs in the node's SDO, and
     * others may be represented as separate relationship objects (i.e. SROs), therefore
     * this method can return multiple objects.
     *
     * @param parent
     *  The STIX node.
     * @param children
     *  The STIX node's children.
     * @returns
     *  Zero or more SROs.
     */
    private tryEmbed(parent: Sdo, children: Link[]): Sro[] {
        let SROs = [];
        // Attempt to embed children in parent
        for (const c of children) {
            let sro = null;
            switch (parent.type) {
                case "attack-action":
                    sro = this.tryEmbedInAction(parent, c.obj);
                    break;
                case "attack-asset":
                    sro = this.tryEmbedInAsset(parent, c.obj);
                    break;
                case "attack-condition":
                    sro = this.tryEmbedInCondition(parent, c.obj, c.via);
                    break;
                case "attack-operator":
                    sro = this.tryEmbedInOperator(parent, c.obj);
                    break;
                case "ipv4-addr": // falls through
                case "ipv6-addr": // falls through
                case "mac-addr": // falls through
                case "domain-name":
                    // Network traffic is a special case where it's _parent_ can be embedded if its one of the
                    // above types.
                    if (c.obj.type === "network-traffic") {
                        sro = this.tryEmbedInNetworkTraffic(parent, c.obj);
                    } else {
                        sro = this.tryEmbedInDefault(parent, c.obj);
                    }
                    break;
                case "grouping":
                    this.tryEmbedInNote(parent, c.obj);
                    break;
                case "malware-analysis":
                    this.tryEmbedInMalwareAnalysis(parent, c.obj);
                    break;
                case "network-traffic":
                    sro = this.tryEmbedInNetworkTraffic(parent, c.obj);
                    break;
                case "note":
                    this.tryEmbedInNote(parent, c.obj);
                    break;
                case "observed-data":
                    this.tryEmbedInNote(parent, c.obj);
                    break;
                case "opinion":
                    this.tryEmbedInNote(parent, c.obj);
                    break;
                case "report":
                    this.tryEmbedInNote(parent, c.obj);
                    break;
                default:
                    sro = this.tryEmbedInDefault(parent, c.obj);
            }
            // If embed failed, append SRO
            if (sro) {
                SROs.push(sro);
            }
        }
        return SROs;
    }

    /**
     * Embed a reference to the child in the action. If the child cannot be
     * embedded, return a new SRO.
     * @param parent
     *  A STIX action node.
     * @param child
     *  A STIX child node.
     * @returns
     *  An SRO, if one was created.
     */
    private tryEmbedInAction(parent: Sdo, child: Sdo): Sro | undefined {
        let sro;
        switch (child.type) {
            case "process":
                /**
                 * Note:
                 * If there are multiple children with type "process", only the
                 * first one will be set as the command ref. The others will be
                 * set as SROs.
                 */
                if (parent.command_ref) {
                    sro = this.createSro(parent, child);
                } else {
                    parent.command_ref = child.id;
                }
                break;
            case "attack-asset":
                if (!parent.asset_refs) {
                    parent.asset_refs = [];
                }
                parent.asset_refs.push(child.id);
                break;
            case "attack-action":
                // Falls through
            case "attack-operator":
                // Falls through
            case "attack-condition":
                if (!parent.effect_refs) {
                    parent.effect_refs = [];
                }
                parent.effect_refs.push(child.id);
                break;
            default:
                sro = this.createSro(parent, child);
        }
        return sro;
    }

    /**
     * Embed a reference to the child in the asset. If the child cannot be
     * embedded, return a new SRO.
     * @param parent
     *  A STIX asset node.
     * @param child
     *  A STIX child node.
     * @returns
     *  An SRO, if one was created.
     */
    private tryEmbedInAsset(parent: Sdo, child: Sdo): Sro | undefined {
        let sro;
        /**
         * Note:
         * If there are multiple children, only the first one will be set as
         * the object_ref. The others will be set as SROs.
         */
        if (parent.object_ref) {
            sro = this.createSro(parent, child);
        } else {
            parent.object_ref = child.id;
        }
        return sro;
    }

    /**
     * Embed a reference to the child in the condition. If the child cannot be
     * embedded, return a new SRO.
     * @param parent
     *  A STIX condition node.
     * @param child
     *  A STIX child node.
     * @param via
     *  The route the child is connected through.
     * @returns
     *  An SRO, if one was created.
     */
    private tryEmbedInCondition(parent: Sdo, child: Sdo, via: string): Sro | undefined {
        let sro;
        switch (child.type) {
            case "attack-action":
                // Falls through
            case "attack-operator":
                // Falls through
            case "attack-condition":
                switch(via) {
                    case "true_anchor":
                        if (!parent.on_true_refs) {
                            parent.on_true_refs = [];
                        }
                        parent.on_true_refs.push(child.id);
                        break;
                    case "false_anchor":
                        if (!parent.on_false_refs) {
                            parent.on_false_refs = [];
                        }
                        parent.on_false_refs.push(child.id);
                        break;
                    default:
                        sro = this.createSro(parent, child);
                        break;
                }
                break;
            default:
                sro = this.createSro(parent, child);
        }
        return sro;
    }

    /**
     * Try to embed a reference in a network-traffic object, otherwise return a new SRO.
     *
     * Either parent or child must be a network-traffic, the other one should not be a network-traffic.
     *
     * @param parent
     *  A STIX node (network-traffic, ipv4-addr, ipv6-addr, mac-addr, or domain-name)
     * @param child
     *  A STIX node (network-traffic, ipv4-addr, ipv6-addr, mac-addr, or domain-name)
     * @returns
     *  An SRO, if one was created.
     */
    private tryEmbedInNetworkTraffic(parent: Sdo, child: Sdo): Sro | undefined {
        if (parent.type === "network-traffic" && !parent["dst_ref"]) {
            parent["dst_ref"] = child.id;
        } else if (child.type === "network-traffic" && !child["src_ref"]) {
            child["src_ref"] = parent.id;
        } else {
            return this.createSro(parent, child);
        }
    }

    /**
     * Embed a reference to the child in the operator. If the child cannot be
     * embedded, return a new SRO.
     * @param parent
     *  A STIX operator node.
     * @param child
     *  A STIX child node.
     * @returns
     *  An SRO, if one was created.
     */
    private tryEmbedInOperator(parent: Sdo, child: Sdo): Sro | undefined {
        let sro;
        switch (child.type) {
            case "attack-action":
                // Falls through
            case "attack-operator":
                // Falls through
            case "attack-condition":
                if (!parent.effect_refs) {
                    parent.effect_refs = [];
                }
                parent.effect_refs.push(child.id);
                break;
            default:
                sro = this.createSro(parent, child);
        }
        return sro;
    }

    /**
     * Embed a reference to the child in the note. If the child cannot be
     * embedded, return a new SRO.
     * @param parent
     *  A STIX note node.
     * @param child
     *  A STIX child node.
     * @returns
     *  An SRO, if one was created.
     */
    private tryEmbedInNote(parent: Sdo, child: Sdo): void {
        if(!parent.object_refs) {
            parent.object_refs = [];
        }
        parent.object_refs.push(child.id);
    }

    /**
     * Embed a reference to the child in the malware analysis. If the child cannot be
     * embedded, return a new SRO.
     * @param parent
     *  A STIX malware analysis node.
     * @param child
     *  A STIX child node.
     * @returns
     *  An SRO, if one was created.
     */
    private tryEmbedInMalwareAnalysis(parent: Sdo, child: Sdo): void {
        if (!parent.analysis_sco_refs) {
            parent.analysis_sco_refs = [];
        }
        parent.analysis_sco_refs.push(child.id);
    }

    /**
     * Embed a reference to the child in the parent. If the child cannot be
     * embedded, return a new SRO.
     * @param parent
     *  A STIX parent node.
     * @param child
     *  A STIX child node.
     * @returns
     *  An SRO, if one was created.
     */
    private tryEmbedInDefault(parent: Sdo, child: Sdo): Sro {
        return this.createSro(parent, child);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  3. Stix Bundle  ///////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Create the initial STIX bundle with required extension/creator SDOs.
     * @returns
     *  The initial STIX bundle with required extension/creator SDOs.
     */
    private createStixBundle(): BundleSdo {
        const extensionAuthor = this.createExtensionAuthorSdo();
        const extension = this.createExtensionSdo(extensionAuthor.id);
        return {
            ...this.createSdo("bundle"),
            objects             : [extension, extensionAuthor]
        };
    }

    /**
     * Creates the extension-definition SDO.
     * @param creatorId
     *  The creator's id.
     * @returns
     *  The extension-definition SDO.
     */
    private createExtensionSdo(creatorId: string): ExtensionSdo {
        let obj = this.createSdo("extension-definition", AttackFlowExtensionId);
        return {
            ...obj,
            name                : "Attack Flow",
            description         : "Extends STIX 2.1 with features to create Attack Flows.",
            created             : AttackFlowExtensionCreatedDate,
            modified            : AttackFlowExtensionModifiedDate,
            created_by_ref      : creatorId,
            schema              : AttackFlowSchemaUrl,
            version             : AttackFlowSchemaVersion,
            extension_types     : ["new-sdo"],
            external_references : [
                AttackFlowDocsExternalReference,
                AttackFlowGitHubExternalReference,
            ]
        }
    }

    /**
     * Creates the extension-definition author SDO.
     * @returns
     *  The extension-definition author SDO.
     */
    private createExtensionAuthorSdo(): ExtensionAuthorSdo {
        let obj = this.createSdo("identity", AttackFlowExtensionId);
        return {
            ...obj,
            created_by_ref      : obj.id,
            name                : AttackFlowExtensionCreatorName,
            identity_class      : "organization",
            created             : AttackFlowExtensionCreatedDate,
            modified            : AttackFlowExtensionModifiedDate
        };
    }

    /**
     * Creates the attack flow SDO.
     * @param id
     *  The page's id.
     * @param page
     *  The page object.
     * @param authorId
     *  The author's id.
     * @param startRefs
     *  A list of node IDs to use as the flow's start_refs.
     */
    private createFlowSdo(id: string, page: GraphObjectExport, authorId: string, startRefs: string[]): Sdo {

        // Create flow
        let flow: Sdo = {
            ...this.createSdo(page.template.id, id),
            created_by_ref      : authorId,
            start_refs          : startRefs,
        }

        // Merge properties
        for(let [key, prop] of page.props.value) {
            switch(key) {
                case "author":
                    // Author SDO is exported separately
                    break;
                case "external_references":
                    if(!(prop instanceof ListProperty)) {
                        throw new Error(`'${ key }' is improperly defined.`);
                    }
                    if(prop.descriptor.form.type !== PropertyType.Dictionary) {
                        throw new Error(`'${ key }' is improperly defined.`);
                    }
                    const extRefs = [];
                    for(let ref of prop.value.values()) {
                        let entries = ref.toRawValue() as RawEntries;
                        const entry = {} as any;
                        for (const [key, value] of entries) {
                            if (value !== null) {
                                entry[key] = value;
                            }
                        }
                        extRefs.push(entry);
                    }
                    if (extRefs.length > 0) {
                        flow[key] = extRefs;
                    }
                    break;
                case "scope":
                    if(!(prop instanceof EnumProperty)) {
                        throw new Error(`'${ key }' is improperly defined.`);
                    }
                    if(!prop.isDefined()) {
                        break;
                    }
                    flow[key] = prop.toRawValue();
                    break;
                default:
                    if(prop.isDefined()) {
                        flow[key] = prop.toRawValue()
                    }
                    break;
            }
        }

        // Return flow
        return flow;

    }

    /**
     * Determine which action/condition nodes are the starting points for the flow.
     *
     * The logic for determining start_refs is:
     *   1. Impute the graph consisting of only actions and conditions.
     *   2. Any node with in-degree equal to zero is a start ref.
     *
     * @param graph
     *  A semantic graph
     * @returns
     *  A list of node IDs.
     */
    private computeStartRefs(graph: GraphExport): string[] {
        const imputedEdges = new Map<string, string[]>();

        // This helper returns the IDs of child nodes of the given node.
        const getChildNodes = (nodeId: string) => {
            const children: string[] = [];
            const node = graph.nodes.get(nodeId);
            if (node) {
                for (const edgeId of node.next) {
                    const edge = graph.edges.get(edgeId);
                    if (edge) {
                        children.push(...edge.next);
                    }
                }
            }
            return children;
        };

        // Impute the graph containing only actions and conditions.
        const stack: string[] = [];
        for (const [parentId, parentNode] of graph.nodes) {
            // Ignore nodes that are not actions or conditions.
            const parentType = parentNode.template.id;
            if (parentType !== "action" && parentType !== "condition") {
                continue;
            }
            const edges: string[] = [];
            const parentStixType = AttackFlowTemplatesMap.get(parentType);
            const parentStixId = `${parentStixType}--${parentId}`;
            imputedEdges.set(parentStixId, edges);

            // Initialize stack with the node's children.
            stack.push(...getChildNodes(parentId));

            // Breadth-first search of this node's descendants, terminating when an action or condition is
            // reached.
            let descendantId;
            const visited = new Set<string>();
            while (descendantId = stack.pop()) {
                // Don't visit the same node twice otherwise we could get caught in an infinite loop.
                if (visited.has(descendantId)) {
                    continue;
                }
                visited.add(descendantId);

                // Search a descendant node.
                const descendantNode = graph.nodes.get(descendantId);
                if (descendantNode) {
                    const descendantType = descendantNode.template.id;
                    if (descendantType === "action" || descendantType === "condition") {
                        const descendantStixType = AttackFlowTemplatesMap.get(descendantType);
                        const descendantStixId = `${descendantStixType}--${descendantId}`;
                        edges.push(descendantStixId);
                    } else {
                        stack.push(...getChildNodes(descendantId));
                    }
                }
            }
        }

        // Compute which nodes have no in-bound edges.
        const startRefs = new Set<string>(imputedEdges.keys());
        for (const [parentId, children] of imputedEdges) {
            for (const childId of children) {
                startRefs.delete(childId);
            }
        }

        // I don't know if this will be a problem in practice, but in theory a cycle in the graph could lead
        // to a situation where none of the action/conditions nodes have in-degree zero. It's not clear what
        // the logic should even be in that situation, so for now just throw an exception so that we don't
        // produce an invalid Attack Flow.
        if (startRefs.size === 0) {
            throw new Error("Unable to compute start refs -- does the flow contain a cycle?");
        }

        return [...startRefs];
    }

    /**
     * Creates the attack flow author SDO.
     * @param page
     *  The page object.
     * @returns
     *  The attack flow author SDO.
     */
    private createFlowAuthorSdo(page: GraphObjectExport): Sdo {
        let props = page.props.value.get("author");

        // Create author
        let author = this.createSdo("identity");

        // Merge properties
        if(props instanceof CollectionProperty) {
            for(let [key, prop] of props.value) {
                switch(key) {
                    case "identity_class":
                        if(!(prop instanceof EnumProperty)) {
                            throw new Error(`'${ key }' is improperly defined.`);
                        }
                        if(!prop.isDefined()) {
                            break;
                        }
                        author[key] = prop
                            .toReferenceValue()!
                            .toString()
                            .trim()
                            .toLocaleLowerCase();
                        break;
                    default:
                        if(prop.isDefined()) {
                            author[key] = prop.toString().trim();
                        }
                        break;
                }
            }
        } else {
            throw new Error("'author' is improperly defined.");
        }

        // Return author
        return author;

    }


    ///////////////////////////////////////////////////////////////////////////
    //  4. SDO & SRO  /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Creates a STIX Domain Object (SDO).
     * @param template
     *  The STIX object's template.
     * @param stixId
     *  The STIX object's id.
     *  (Default: Randomly generated)
     * @returns
     *  The SDO object.
     */
    private createSdo(template: string, stixId: string = Crypto.randomUUID()): Sdo {
        let now = new Date().toISOString();
        let type = (AttackFlowTemplatesMap.get(template) ?? template).replace(/_/g, "-");

        // Create SDO
        let sdo: Sdo = {
            type                : type,
            id                  : `${ type }--${ stixId }`,
            spec_version        : "2.1",
            created             : now,
            modified            : now,
        }

        // Declare extension on Attack Flow SDOs.
        if (AttackFlowSdos.has(type)) {
            sdo.extensions = {
                [`extension-definition--${ AttackFlowExtensionId }`] : {
                    extension_type: "new-sdo",
                }
            };
        }

        // Return SDO
        return sdo;
    }

    /**
     * Creates a STIX Relationship Object (SRO).
     * @param parent
     *  The parent STIX node.
     * @param child
     *  The child STIX node.
     * @param type
     *  The relationship type.
     *  (Default: related-to)
     * @returns
     *  The SRO object.
     */
    private createSro(parent: Sdo, child: Sdo, type: string = "related-to"): Sro {
        const stixId = Crypto.randomUUID();
        const now = new Date().toISOString();
        return {
            type                : "relationship",
            id                  : `relationship--${ stixId }`,
            spec_version        : "2.1",
            created             : now,
            modified            : now,
            relationship_type   : type,
            source_ref          : parent.id,
            target_ref          : child.id
        };
    }


    ///////////////////////////////////////////////////////////////////////////
    //  5. Helpers  ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Resolves a set of subproperties from a collection property.
     * @param property
     *  The collection property.
     * @param ids
     *  The subproperty id's.
     * @returns
     *  The subproperties.
     */
    private getSubproperties(property: CollectionProperty, ...ids: string[]): Property[] {
        let subproperties = [];
        for(let id of ids) {
            let prop = property.value.get(id);
            if(prop) {
                subproperties.push(prop);
            } else {
                throw new Error(`${ id } was not defined on root property.`);
            }
        }
        return subproperties;
    }

}

export default AttackFlowPublisher;


///////////////////////////////////////////////////////////////////////////
//  Internal Types  ///////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////


type Sdo = {
    type         : string,
    id           : string,
    spec_version : string,
    created      : string,
    modified     : string,
    extensions?   : {
        [key: string] : {
            extension_type: string
        }
    },
    [key: string]: any
}

type Sro = {
    type              : string,
    id                : string,
    spec_version      : string,
    created           : string,
    modified          : string,
    relationship_type : string,
    source_ref        : string,
    target_ref        : string
}

type ExtensionSdo = Sdo & {
    name                : string,
    description         : string,
    created             : string,
    modified            : string,
    created_by_ref      : string,
    schema              : string,
    version             : string,
    extension_types     : string[],
    external_references : {
        source_name: string,
        description: string,
        url: string
    }[]
}

type ExtensionAuthorSdo = Sdo & {
    created_by_ref : string,
    name           : string,
    identity_class : string,
    created        : string,
    modified       : string
}

type BundleSdo = Sdo & {
    objects : [ExtensionSdo, ExtensionAuthorSdo, ...Sdo[]]
}

type Link = {
    obj: Sdo,
    via: string
}

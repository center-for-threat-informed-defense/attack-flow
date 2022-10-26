import { DiagramPublisher } from "./scripts/DiagramPublisher/DiagramPublisher";
import { DiagramObjectModel, DictionaryProperty, GraphObjectExport, ListProperty, PropertyType, SemanticAnalyzer } from "./scripts/BlockDiagram";

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
const AttackFlowDocsExternalReference
    = {
        "source_name": "Documentation",
        "description": "Documentation for Attack Flow",
        "url": "https://center-for-threat-informed-defense.github.io/attack-flow"
    };
const AttackFlowGitHubExternalReference
    = {
        "source_name": "GitHub",
        "description": "Source code repository for Attack Flow",
        "url": "https://github.com/center-for-threat-informed-defense/attack-flow"
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
const AttackFlowTemplates: Map<string, string>
    = new Map([
        ["action", "attack-action"],
        ["asset", "attack-asset"],
        ["condition", "attack-condition"],
        ["or", "attack-operator"],
        ["and", "attack-operator"],
    ]);

class AttackFlowPublisher extends DiagramPublisher {

    /**
     * Returns the published diagram in text form.
     * @param diagram
     *  The diagram to publish.
     * @returns
     *  The published diagram in text form.
     */
     public override publish(diagram: DiagramObjectModel): string {
        const graph = SemanticAnalyzer.toGraph(diagram);
        const stixBundle = this.createStixBundle();
        // Map STIX id -> STIX node.
        const stixNodes = new Map<string, any>();
        // Map parent's stix ID -> children STIX IDs
        const stixChildren = new Map<string, Array<string>>();
        // Map graph node ID -> stix node ID
        const graphToStixId = new Map<string, string>();

        // Iterate over graph nodes and create corresponding STIX nodes (either SDO
        // or SCO).
        for (const [id, node] of graph.nodes) {
            const stixNode = this.exportNodeObject(id, node)
            stixBundle.objects.push(stixNode);
            stixNodes.set(stixNode.id, stixNode);
            stixChildren.set(stixNode.id, new Array<string>());
            graphToStixId.set(id, stixNode.id);
        }

        // Iterate over edges and create an adjacency list for each STIX node.
        for (const [id, edge] of graph.edges) {
            const stixParentId = graphToStixId.get(edge.prev[0]);
            const stixChildId = graphToStixId.get(edge.next[0]);
            if (stixParentId && stixChildId) {
                stixChildren.get(stixParentId)?.push(stixChildId);
            } else {
                throw new Error(`The endpoints for this edge do not exist: ${edge}`);
            }
        }

        // Iterate over the STIX nodes and process their children by adding embedded
        // refs to the existing objects and creating new SROs as needed.
        for (const stixNode of stixNodes.values()) {
            const children = new Array<any>();
            const childIds = stixChildren.get(stixNode.id);
            if (!childIds) {
                throw new Error(`Cannot look up children of STIX node: id=${stixNode.id}`);
            }
            for (const childId of childIds) {
                children.push(stixNodes.get(childId));
            }
            const newNodes = this.handleChildren(stixNode, children);
            stixBundle.objects.push(...newNodes);
        }

        // TODO - Create flow authors.
        const author = this.createStixObj("identity");
        author.name = "John Doe";
        author.identity_class = "individual";
        author.contact_information = "johndoe@mitre.org";
        stixBundle.objects.splice(2, 0, author)

        // TODO - Set flow metadata.
        const flowObject = this.createStixObj("attack-flow");
        flowObject.name = "Placeholder name";
        flowObject.scope = "other";
        flowObject.description = "Placeholder description.";
        flowObject.created_by_ref = author.id;
        // flowObject.created = "TODO";
        // flowObject.modified = "TODO";
        flowObject.start_refs = this.findFlowRoots(stixNodes, stixChildren);
        stixBundle.objects.splice(2, 0, flowObject);

        return JSON.stringify(stixBundle, null, 2);
    }

    /**
     * Process a node in the Attack Flow and exportable STIX objects.
     *
     * @remarks
     * While processing each node, we also process the in edges and out edges of that
     * node. Some edges may be represented as embedded refs in the node's SDO, and
     * others may be represented as separate relationship objects (i.e. SROs), therefore
     * this method can return multiple objects.
     *
     * @parm node - The node to be published
     * @returns - an array of objects containing 1 SDO or SCO and 0 or more SROs
     */
    protected exportNodeObject(id: string, node: GraphObjectExport): any {
        // Produce an SDO or SCO for this node.
        const type = node.template.id;
        const obj = this.createStixObj(type, id);
        if (node.template.id === "or") {
            obj.operator = "OR";
        } else if (node.template.id === "and") {
            obj.operator = "AND";
        }
        // Merge properties into stix obj
        this.mergeDictionaryProperty(obj, node.props);
        return obj;
    }


    protected mergeDictionaryProperty(obj: any, property: DictionaryProperty) {
        for(let [key, value] of property.value) {
            switch(value.type) {
                case PropertyType.Dictionary:
                    if(value instanceof DictionaryProperty) {
                        obj[key] = {};
                        this.mergeDictionaryProperty(obj[key], value);
                    }
                    break;
                case PropertyType.List:
                    if(value instanceof ListProperty && value.isDefined()) {
                        obj[key] = [];
                        this.mergeListProperty(obj[key], value)
                    }
                    break;
                default:
                    if(value.isDefined()) {
                        obj[key] = value.toRawValue();
                    }
                    break;
            }
        }
    }

    protected mergeListProperty(obj: any, property: ListProperty) {
        for(let value of property.value.values()) {
            switch(value.type) {
                case PropertyType.Dictionary:
                    if(value instanceof DictionaryProperty) {
                        obj.push({});
                        this.mergeDictionaryProperty(obj.at(-1), value);
                    }
                    break;
                case PropertyType.List:
                    if(value instanceof ListProperty && value.isDefined()) {
                        obj.push([]);
                        this.mergeListProperty(obj.at(-1), value);
                    }
                    break;
                default:
                    if(value.isDefined()) {
                        obj.push(value.toRawValue())
                    }
            }
        }
    }

    /**
     * Process a node in the Attack Flow and exportable STIX objects.
     *
     * @remarks
     * While processing each node, we also process the in edges and out edges of that
     * node. Some edges may be represented as embedded refs in the node's SDO, and
     * others may be represented as separate relationship objects (i.e. SROs), therefore
     * this method can return multiple objects.
     *
     * @param node - A STIX node (SDO or SCO)
     * @param children - An array of child nodes (SDOs and SCOs)
     * @returns - an array of objects 0 or more SROs
     */
    protected handleChildren(node: any, children: Array<any>): Array<any> {
        const newSros: Array<any> = [];

        // Examine edges and either set embedded refs or create SROs.
        for (const child of children) {
            let newSro: any = null;
            switch (node.type) {
                case "attack-action":
                    newSro = this.handleActionChild(node, child);
                    break;
                case "attack-asset":
                    newSro = this.handleAssetChild(node, child);
                    break;
                case "attack-condition":
                    newSro = this.handleConditionChild(node, child);
                    break;
                case "attack-operator":
                    newSro = this.handleOperatorChild(node, child);
                    break;
                default:
                    newSro = this.handleDefaultChild(node, child);
            }
            if (newSro) {
                newSros.push(newSro);
            }
        }

        return newSros;
    }

    /**
     * Handle a child node of an Action node by creating either embedded ref in the
     * current node and/or returning an array of SROs.
     *
     * @param node - a STIX parent node
     * @param child - a STIX childe node
     * @returns zero or more SRO nodes
     */
    protected handleActionChild(node: any, child: any): any {
        let sro: any = null;
        switch (child.type) {
            case "process":
                // Note that if there are multiple children with type "process", only
                // the first one will be set as the command ref. The others will be
                // set as SROs.
                if (node.command_ref) {
                    sro = this.createSro(node, child);
                } else {
                    node.command_ref = child.id;
                }
                break;
            case "attack-asset":
                if (!node.asset_refs) {
                    node.asset_refs = [];
                }
                node.asset_refs.push(child.id);
                break;
            case "attack-action": // falls through
            case "attack-operator": // falls through
            case "attack-condition":
                if (!node.effect_refs) {
                    node.effect_refs = [];
                }
                node.effect_refs.push(child.id);
                break;
            default:
                sro = this.createSro(node, child);
        }
        return sro;
    }

    /**
     * Handle a child node of an Asset node by creating either embedded ref in the
     * current node and/or returning an array of SROs.
     *
     * @param node - a STIX parent node
     * @param child - a STIX childe node
     * @returns zero or more SRO nodes
     */
    protected handleAssetChild(node: any, child: any): any {
        let sro: any = null;
        // Note that if there are multiple children, only the first one will be set as
        // the object_ref. The others will be set as SROs.
        if (node.object_ref) {
            sro = this.createSro(node, child);
        } else {
            node.object_ref = child.id;
        }
        return sro;
    }

    /**
     * Handle a child node of an Condition node by creating either embedded ref in the
     * current node and/or returning an array of SROs.
     *
     * @param node - a STIX parent node
     * @param child - a STIX childe node
     * @returns zero or more SRO nodes
     */
    protected handleConditionChild(node: any, child: any): any {
        let sro: any = null;
        switch (child.type) {
            case "attack-action": // falls through
            case "attack-operator": // falls through
            case "attack-condition":
                // TODO add support for on_false_refs once implemented in the editor
                if (!node.on_true_refs) {
                    node.on_true_refs = [];
                }
                node.on_true_refs.push(child.id);
                break;
            default:
                sro = this.createSro(node, child);
        }
        return sro;
    }

    /**
     * Handle a child node of an Operator node by creating either embedded ref in the
     * current node and/or returning an array of SROs.
     *
     * @param node - a STIX parent node
     * @param child - a STIX childe node
     * @returns zero or more SRO nodes
     */
    protected handleOperatorChild(node: any, child: any): any {
        let sro: any = null;
        switch (child.type) {
            case "attack-action": // falls through
            case "attack-operator": // falls through
            case "attack-condition":
                if (!node.effect_refs) {
                    node.effect_refs = [];
                }
                node.effect_refs.push(child.id);
                break;
            default:
                sro = this.createSro(node, child);
        }
        return sro;
    }

    /**
     * Handle a child node of any arbitrary node by returning an SRO.
     *
     * @param node - a STIX parent node
     * @param child - a STIX childe node
     * @returns zero or more SRO nodes
     */
    protected handleDefaultChild(node: any, child: any): any {
        let sro = this.createSro(node, child);
        return sro;
    }

    /**
     * Create the initial STIX bundle with required extension/creator SDOs.
     */
    protected createStixBundle(): any {
        const bundle: any = this.createStixObj("bundle");
        const extensionAuthor = this.createExtensionAuthorSdo();
        const extension = this.createExtensionSdo(extensionAuthor.id);
        bundle.objects = [extension, extensionAuthor];
        return bundle;
    }

    /**
     * Create the extension-definition SDO.
     */
    protected createExtensionSdo(creator_id: string): any {
        const extension = this.createStixObj("extension-definition", AttackFlowExtensionId);
        extension.name = "Attack Flow";
        extension.description = "Extends STIX 2.1 with features to create Attack Flows.";
        extension.created = AttackFlowExtensionCreatedDate;
        extension.modified = AttackFlowExtensionModifiedDate;
        extension.created_by_ref = creator_id;
        extension.schema = AttackFlowSchemaUrl;
        extension.version = AttackFlowSchemaVersion;
        extension.extension_types = ["new-sdo"];
        extension.external_references = [
            AttackFlowDocsExternalReference,
            AttackFlowGitHubExternalReference,
        ]
        return extension;
    }

    /**
     * Create the identity that is the creator of the extension-definition.
     */
    protected createExtensionAuthorSdo(): any {
        const identity = this.createStixObj("identity", AttackFlowExtensionId);
        identity.create_by_ref = identity.id;
        identity.name = AttackFlowExtensionCreatorName;
        identity.identity_class = "organization";
        identity.created = AttackFlowExtensionCreatedDate;
        identity.modified = AttackFlowExtensionModifiedDate;
        return identity;
    }

    /**
     * A generic helper for creating a SDO initialized with a few required fields.
     */
    protected createStixObj(template: string, id: string | null = null): any {
        let type = AttackFlowTemplates.get(template) ?? template;
        let stixId = id ?? crypto.randomUUID();
        let now = (new Date()).toISOString();
        let sdo: any = {
            type: type,
            id: `${type}--${stixId}`,
            spec_version: "2.1",
            created: now,
            modified: now,
        }

        // Declare extension on Attack Flow SDOs.
        if (AttackFlowSdos.has(type)) {
            let extDef: any = {};
            extDef[`extension-definition--${AttackFlowExtensionId}`] = {
                extension_type: "new-sdo",
            };
            sdo.extensions = extDef;
        }

        return sdo;
    }

    /**
     * Create a STIX relationship object (SRO).
     *
     * @param parent - The parent STIX node
     * @param child - The child STIX node
     * @param relationshipType - The relationship type
     */
    protected createSro(parent: any, child: any, relationshipType: string = "related-to"): any {
        const stixId = crypto.randomUUID();
        const now = (new Date()).toISOString();
        return {
            type: "relationship",
            id: `relationship--${stixId}`,
            spec_version: "2.1",
            created: now,
            modified: now,
            relationship_type: relationshipType,
            source_ref: parent.id,
            target_ref: child.id,
        };
    }

    /**
     * Find the root nodes of the action graph.
     *
     * @param nodes - A map of node ID -> STIX Node
     * @param adjacency - A map of parent ID -> children IDs
     * @returns a list of IDs of the root action/condition nodes.
     */
    protected findFlowRoots(nodes: Map<string, any>,
            adjacency: Map<string, Array<string>>): Array<string> {
        // Add all actions and conditions to the set of possible roots.
        const roots = new Set<string>();
        for (const node of nodes.values()) {
            if (node.type == "attack-action" || node.type == "attack-condition") {
                roots.add(node.id);
            }
        }
        //
        for (const children of adjacency.values()) {
            for (const child of children) {
                roots.delete(child);
            }
        }
        return new Array<string>(...roots);
    }
    
}

export default AttackFlowPublisher;

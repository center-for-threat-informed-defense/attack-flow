import { StixToTemplate } from "./StixToTemplate";
import { populateProperties } from "./PopulateBlockProperties";
import { resolveEmbeddedRelationships } from "./ResolveEmbeddedRelationships";
import { 
    LayoutEdge, LayoutNode, 
    BlockView, CanvasView, LineView,
    ManualLayoutEngine, AutomaticLayoutEngine,
    SourceSide
} from "@OpenChart/DiagramView";
import { 
    DiagramObject, DiagramObjectSerializer, 
    DictionaryProperty, StringProperty, EnumProperty
} from "@OpenChart/DiagramModel";
import type { Flow } from "./StixTypes/StixDomainObject/AttackFlow";
import type { Constructor } from "@OpenChart/Utilities";
import type { StixBundle, StixObject } from "./StixTypes";
import type { 
    DiagramObjectView, 
    DiagramObjectViewFactory, DiagramViewExport
} from "@OpenChart/DiagramView";

export class StixToAttackFlowConverter {

    /**
     * The diagram factory to use.
     */
    private factory: DiagramObjectViewFactory;


    /**
     * Creates a new {@link StixToAttackFlowConverter}.
     * @remarks
     *  `factory` MUST be configured with the Attack Flow schema.
     * @param factory
     *  The diagram factory to use.
     */
    constructor(factory: DiagramObjectViewFactory) {
        this.factory = factory;
    }


    /**
     * Converts a STIX bundle to a {@link DiagramViewExport}.
     * @param bundle
     *  The STIX bundle to convert.
     * @returns
     *  The converted Attack Flow diagram.
     */
    public convert(stix: StixBundle): DiagramViewExport {
        // Remove extension definitions from STIX
        this.removeExtensionDefinitions(stix);
        // Extract canvas from STIX
        const canvas = this.tryExtractCanvas(stix);
        // Create graph of diagram objects from STIX
        const [nodes, edges] = this.parseStixGraph(stix);
        // Add objects to canvas
        for(const o of [...nodes, ...edges]) {
            canvas.addObject(o.object);
        }
        // Calculate initial layout
        canvas.calculateLayout();
        // Connect lines and calculate layout
        new AutomaticLayoutEngine({
            optimizeOrder : true,
            optimizeLines  : true,
            clustering     : "structural",
            spacing        : 4,
        }).runOnGraph(canvas, nodes);
        // Prepare export
        return {
            schema  : this.factory.id,
            theme   : this.factory.theme.id,
            objects : DiagramObjectSerializer.exportObjects([canvas]),
            layout  : ManualLayoutEngine.generatePositionMap([canvas])
        };
    }

    ////////////////////////////////////////////////////////////////////////////
    //  1. Object Extraction  //////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////


    /**
     * Attempts to extract a canvas from the bundle.
     * @param bundle
     *  The STIX bundle.
     * @returns
     *  The parsed canvas.
     */
    private tryExtractCanvas(bundle: StixBundle): CanvasView {
        
        // Attempt to extract flow
        let flows: Flow[] = [];
        this.removeObjects(bundle, o => {
            if(o.type === "attack-flow") {
                flows.push(o);
                return true;
            }
            return false;
        });
        
        // If no canvas, return a blank one
        if(flows.length === 0) {
            const fac = this.factory;
            const can = this.factory.canvas;
            return fac.createNewDiagramObject(can, CanvasView);
        } else if(1 < flows.length) {
            throw new Error("Bundle must only contain one flow object.");
        }
        
        // Otherwise, create canvas from flow
        const flow = flows[0];
        const canvas = this.translateStix(flow, CanvasView)!;
        
        // Attempt to extract identity
        let identity: StixObject | undefined;
        this.removeObjects(bundle, o => {
            if(flow.created_by_ref === o.id) {
                identity = o;
                return true;
            }
            return false;
        });
        if(identity?.type !== "identity") {
            return canvas;
        }
        
        // Assign identity information to canvas
        const props = canvas.properties;
        const author = props.get("author", DictionaryProperty);
        
        // Gather fields
        const name = author?.get("name", StringProperty);
        const type = author?.get("identity_class", EnumProperty);
        const cont = author?.get("contact_information", StringProperty);
        
        // Assign fields
        name?.setValue(identity.name);
        if(identity.identity_class) {
            type?.setValue(identity.identity_class);
        }
        if(identity.contact_information) {
            cont?.setValue(identity.contact_information);
        }
        
        return canvas;
    
    }

    /**
     * Removes extension definitions from the bundle.
     * @param bundle
     *  The STIX bundle.
     */
    private removeExtensionDefinitions(bundle: StixBundle) {
        const refs = new Set<string>();
        // Remove extension definitions
        this.removeObjects(bundle, o => {
            if(o.type === "extension-definition") {
                refs.add(o.created_by_ref);
                return true;
            }
            return false;
        })
        // Remove created_by_refs
        this.removeObjects(bundle, o => refs.has(o.id));
    }

    /**
     * Removes all objects from a {@link StixBundle} that match a specified
     * predicate.
     * @param bundle
     *  The STIX Bundle.
     * @param match
     *  A predicate which is applied to each object of the bundle. If the 
     *  predicate returns true, the object is removed from the bundle.
     */
    private removeObjects(bundle: StixBundle, match: (o: StixObject) => boolean) {
        let index = 0;
        for(const object of bundle.objects) {
            if(match(object)) {
                bundle.objects.splice(index, 1);
            } else {
                index++;
            }
        }
    }
    

    ////////////////////////////////////////////////////////////////////////////
    //  2. Graph Construction  /////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////


    /**
     * Converts a STIX bundle to an abstract graph of diagram {@link BlockView}s
     * and {@link LineView}s.
     * @param bundle
     *  The STIX bundle. 
     * @returns
     *  The graph's canvas, nodes, and edges.
     */
    private parseStixGraph(bundle: StixBundle): [LayoutNode[], LayoutEdge[]] {
        // Generate node map
        const nodes = new Map<string, LayoutNode>();
        const edges = [];
        for(const obj of bundle.objects) {
            switch(obj.type) {
                case "relationship":
                case "sighting":
                case "attack-flow":
                    continue;
                default:
                    const object = this.translateStix(obj, BlockView);
                    if(object) {
                        nodes.set(obj.id, new LayoutNode(object));
                    }
            }
        }
        // Generate relationship edges
        for(const rel of bundle.objects) {
            switch(rel.type) {
                case "relationship":
                    const object = this.translateStix(rel, LineView);
                    if(object) {
                        const edge = new LayoutEdge(object);
                        nodes.get(rel.source_ref)?.addOutEdge(edge);
                        nodes.get(rel.target_ref)?.addInEdge(edge);
                        edges.push(edge);
                    }
                case "sighting":
                default:
                    continue;
            }
        }
        // Generate embedded relationship edges
        for(const srcObj of bundle.objects) {
            // Skip relationships
            switch(srcObj.type) {
                case "relationship":
                case "sighting":
                case "attack-flow":
                    continue;
            }
            // Process objects
            const objectIds = resolveEmbeddedRelationships(srcObj);
            for(const dstObj of objectIds) {
                const line = this.factory.createNewDiagramObject("dynamic_line", LineView);
                const edge = new LayoutEdge(line);
                nodes.get(srcObj.id)?.addOutEdge(edge);
                nodes.get(dstObj)?.addInEdge(edge);
                edges.push(edge);
            }
        }
        // Orient lines
        for(const edge of edges) {
            // Identify relationship
            const src = edge.source?.object.id ?? '';
            const trg = edge.target?.object.id ?? '';
            const rel = `${ src }.${ trg }`;
            // Set orientation
            switch(rel) {
                case "action.action":
                    edge.orientation = SourceSide.East | SourceSide.West;
                    break;
                default:
                    edge.orientation = SourceSide.South | SourceSide.North;
            }
        }
        // Return components
        return [[...nodes.values()], edges];
    }

    /**
     * Translates a {@link StixObject} to a {@link DiagramObject}. 
     * @param stix
     *  The {@link StixObject}.
     * @param type
     *  The expected {@link DiagramObject} sub-type.
     *  (Default: `DiagramObject`)
     * @returns
     *  The translate {@link DiagramObject}.
     */
    private translateStix<T extends DiagramObjectView>(
        stix: StixObject, type?: Constructor<T>
    ): T | null {
        // Resolve template
        const template = StixToTemplate[stix.type];
        if(template === null) {
            return null;
        }
        // Create object
        const object = this.factory.createNewDiagramObject(template, type);
        // Set properties
        populateProperties(stix, object.properties)
        // Return
        return object;
    }

}

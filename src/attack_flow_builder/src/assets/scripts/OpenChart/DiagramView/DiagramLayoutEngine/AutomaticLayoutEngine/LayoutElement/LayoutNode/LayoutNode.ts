import { Crypto } from "@OpenChart/Utilities";
import { LayoutElement } from "../LayoutElement";
import { BoundingBox, DiagramFace } from "../../../../DiagramObjectView";
import type { BlockView } from "../../../../DiagramObjectView";
import type { LayoutBox } from "../LayoutBox";
import type { LayoutEdge } from "./LayoutEdge";

export class LayoutNode extends LayoutElement {

    /**
     * TODO: FOR DEBUGGING ONLY, REMOVE
     */
    public DEBUG_name: string;

    /**
     * The node's diagram object.
     */
    public readonly object: BlockView;

    /**
     * Whether the node is a phantom of another node.
     */
    public readonly isPhantom: boolean;

    /**
     * The node's incoming edges.
     */
    private _prev: Map<string, LayoutEdge>;

    /**
     * The node's outgoing edges.
     */
    private _next: Map<string, LayoutEdge>;

    
    /**
     * The box's root.
     */
    public get root(): LayoutBox | null{
        return this.parent?.root ?? null;
    }

    /**
     * The node's incoming edges.
     */
    public get prev(): ArrayIterator<LayoutEdge> {
        return this._prev.values();
    }

    /**
     * The node's outgoing edges.
     */
    public get next(): ArrayIterator<LayoutEdge> {
        return this._next.values();
    }

    /**
     * The node's in degree.
     */
    public get inDegree(): number {
        return this._prev.size;
    }

    /**
     * The node's out degree.
     */
    public get outDegree(): number {
        return this._next.size;
    }


    /**
     * Creates a new {@link LayoutNode}.
     * @param object
     *  The node's diagram object.
     * @param isPhantom
     *  Whether the node is a phantom of another node.
     *  (Default: `false`)
     */
    constructor(object: BlockView, isPhantom: boolean = false) {
        super(isPhantom ? Crypto.randomUUID() : object.instance);
        this.object = object;
        this.isPhantom = isPhantom;
        this._prev = new Map();
        this._next = new Map();
        this.boundingBox = this.calculateBoundingRegion(object);
        this.DEBUG_name = object.properties.toString();
    }
    

    /**
     * Create phantom of layout node.
     * @returns
     *  The node's phantom.
     */
    public createPhantom(): LayoutNode {
        return new LayoutNode(this.object, true);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Relationships  /////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Adds a new in edge.
     * @param data
     *  The edge.
     */
    public addInEdge(edge: LayoutEdge) {
        this._prev.set(edge.id, edge);
        edge.target = this;
    }

    /**
     * Adds a new out edge.
     * @param data
     *  The edge.
     */
    public addOutEdge(edge: LayoutEdge) {
        this._next.set(edge.id, edge);
        edge.source = this;
    }

    /**
     * Returns the node's incoming nodes in the specified orientation.
     * @param orientationMask
     *  The orientation mask.
     * @param visited
     *  If specified, the incoming nodes to ignore.
     * @returns
     *  The incoming nodes at the specified orientation.
     */
    public prevNodes(orientationMask: number, visited?: Set<string>): LayoutNode[] {
        const nodes: LayoutNode[] = [];
        const v = visited;
        for(const edge of this.prev) {
            let skip = false;
            // Has no target
            skip ||= edge.source === null;
            // Has different orientation 
            skip ||= (edge.orientation & orientationMask) === 0;
            // Is ignored
            skip ||= edge.source !== null && v !== undefined && v.has(edge.source.id);
            // Add
            if(!skip) {
                nodes.push(edge.source!);
            }
        }
        return nodes; 
    }

    /**
     * Returns the node's outgoing nodes in the specified orientation.
     * @param orientationMask
     *  The orientation mask.
     * @param visited
     *  If specified, the outgoing nodes to ignore.
     * @returns
     *  The outgoing nodes at the specified orientation.
     */
    public nextNodes(orientationMask: number, visited?: Set<string>): LayoutNode[] {
        const nodes: LayoutNode[] = [];
        const v = visited;
        for(const edge of this.next) {
            let skip = false;
            // Has no target
            skip ||= edge.target === null;
            // Has different orientation 
            skip ||= (edge.orientation & orientationMask) === orientationMask;
            // Is ignored
            skip ||= edge.target !== null && v !== undefined && v.has(edge.target.id);
            // Add
            if(!skip) {
                nodes.push(edge.target!);
            }
        }
        return nodes;
    }

    /**
     * Returns the node's in degree in the specified orientation.
     * @param orientationMask
     *  The orientation mask.
     * @param visited
     *  If specified, the incoming nodes to ignore.
     * @returns
     *  The node's in degree.
     */
    public nodesInDegree(orientationMask: number, visited?: Set<string>): number {
        return this.prevNodes(orientationMask, visited).length;
    }

    /**
     * Returns the node's out degree in the specified orientation.
     * @param orientationMask
     *  The orientation mask.
     * @param visited
     *  If specified, the outgoing nodes to ignore.
     * @returns
     *  The node's out degree.
     */
    public nodesOutDegree(orientationMask: number, visited?: Set<string>): number {
        return this.nextNodes(orientationMask, visited).length;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Bounding Box  //////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Calculates a block's bounding region.
     * @param block
     *  The block.
     * @returns
     *  The block's bounding region.
     */
    public calculateBoundingRegion(block: BlockView): BoundingBox {
        // Calculate offsets
        const offset = DiagramFace.markerOffset * 2;
        const face = block.face;
        const wo = (face.width - offset) / 2;
        const ho = (face.height - offset) / 2;
        // Calculate bounding box of face
        const bb = new BoundingBox();
        bb.xMin = block.x - wo;
        bb.yMin = block.y - ho;
        bb.xMax = block.x + wo;
        bb.yMax = block.y + ho;
        bb.x = bb.xMid;
        bb.y = bb.yMid;
        return bb;
    }

}

import type { SemanticGraphNode } from "./SemanticGraphNode";
import type { DiagramObject, RootProperty } from "../DiagramObject";

export class SemanticGraphEdge {

    /**
     * The object's id.
     */
    public id: string;

    /**
     * The object's properties.
     */
    public props: RootProperty;

    /**
     * The edge's source node.
     */
    private _source: SemanticGraphNode | null;

    /**
     * The source anchor's position.
     */
    private _sourceVia: string | null;

    /**
     * The edge's target node.
     */
    private _target: SemanticGraphNode | null;

    /**
     * The target anchor's position.
     */
    private _targetVia: string | null;


    /**
     * The edge's source node.
     */
    public get source(): SemanticGraphNode | null {
        return this._source;
    }

    /**
     * The source anchor's position.
     */
    public get sourceVia(): string | null {
        return this._sourceVia;
    }

    /**
     * The edge's target node.
     */
    public get target(): SemanticGraphNode | null {
        return this._target;
    }

    /**
     * The target anchor's position.
     */
    public get targetVia(): string | null {
        return this._targetVia;
    }


    /**
     * Creates a new {@link SemanticGraphNode}.
     * @param object
     *  The node object.
     */
    constructor(object: DiagramObject) {
        this.id = object.id;
        this.props = object.properties;
        this._source = null;
        this._target = null;
        this._sourceVia = null;
        this._targetVia = null;
    }

}

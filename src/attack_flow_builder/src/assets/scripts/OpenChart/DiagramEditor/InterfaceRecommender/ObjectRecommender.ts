import type { DiagramObjectView } from "@OpenChart/DiagramView";
import type { DiagramViewEditor } from "../DiagramViewEditor";
import type { ObjectRecommendations } from "./ObjectRecommendations";

export abstract class ObjectRecommender {

    /**
     * The recommender's editor.
     */
    private editor: DiagramViewEditor | null;

    /**
     * The recommender's active target.
     */
    private object: DiagramObjectView | null;


    /**
     * The recommender's x-coordinate.
     */
    public get x(): number {
        if(this.active) {
            const { x, k } = this.editor!.file.camera;
            return Math.round((this.object!.x * k) + x);
        } else {
            return 0;
        }
    }

    /**
     * The recommender's y-coordinate.
     */
    public get y(): number {
        if(this.active) {
            const { y, k } = this.editor!.file.camera;
            return Math.round((this.object!.y * k) + y);
        } else {
            return 0;
        }
    }

    /**
     * Whether the recommender is active or not.
     */
    public get active(): boolean {
        return this.object !== null;
    }


    /**
     * Creates a new {@link ObjectRecommender}.
     */
    constructor() {
        this.editor = null;
        this.object = null;
    }


    /**
     * Starts the recommender.
     * @param editor
     *  The recommender's editor.
     * @param object
     *  The recommender's active target.
     */
    public start(editor: DiagramViewEditor, object: DiagramObjectView) {
        // Configure editor and object
        this.editor = editor;
        this.object = object;
    }

    /**
     * Stops the recommender.
     */
    public shutdown() {
        this.editor = null;
        this.object = null;
    }

    /**
     * Returns the set of recommendations.
     * @param search
     *  The search term.
     * @returns
     *  A Promise that resolves with the recommendations.
     */
    public abstract getRecommendations(search: string): Promise<ObjectRecommendations>;

}

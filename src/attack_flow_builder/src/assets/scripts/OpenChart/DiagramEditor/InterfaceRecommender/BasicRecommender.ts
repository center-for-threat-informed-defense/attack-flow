import { ObjectRecommender } from "./ObjectRecommender";
import { DiagramObjectType } from "@OpenChart/DiagramModel";
import { FaceType, type DiagramObjectView, type DiagramObjectViewFactory } from "@OpenChart/DiagramView";
import type { DiagramViewEditor } from "../DiagramViewEditor";
import type { ObjectRecommendation } from "./ObjectRecommendation";
import type { ObjectRecommendations } from "./ObjectRecommendations";

export class BasicRecommender extends ObjectRecommender {

    /**
     * The full list of recommendations.
     */
    private recommendations: ObjectRecommendation[];


    /**
     * Creates a new {@link BasicRecommender}.
     */
    constructor() {
        super();
        this.recommendations = [];
    }


    /**
     * Starts the recommender.
     * @param editor
     *  The recommender's editor.
     * @param object
     *  The recommender's active target.
     */
    public start(editor: DiagramViewEditor, object: DiagramObjectView) {
        super.start(editor, object);
        // Configure basic recommendations
        const factory = editor.file.factory;
        const templates = factory.templates;
        for (const template of templates.values()) {
            // Include block types
            if (template.type !== DiagramObjectType.Block) {
                continue;
            }
            // Add recommendation
            this.recommendations.push({
                id: template.name,
                color: this.getColor(factory, template.name),
                name: template.name,
                subtitle: "An object for representing urls."
            });
        }
    }

    /**
     * Returns the set of recommendations.
     * @param search
     *  The search term.
     * @returns
     *  A Promise that resolves with the recommendations.
     */
    public async getRecommendations(_search: string): Promise<ObjectRecommendations> {
        return {
            items: this.recommendations
        };
    }

    /**
     * Returns a template's color.
     * @param factory
     *  The template's object factory.
     * @param template
     *  the template's identifier.
     * @returns
     *  The template's color.
     */
    private getColor(factory: DiagramObjectViewFactory, template: string): string {
        const design = factory.resolveDesign(template);
        switch (design.type) {
            case FaceType.BranchBlock:
            case FaceType.DictionaryBlock:
                return design.style.head.fillColor;
            case FaceType.TextBlock:
                return design.style.fillColor;
            default:
                return "#000000";
        }
    }

}

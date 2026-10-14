import { BasicRecommender } from "@OpenChart/DiagramEditor";
import { CanvasView, LatchView, LineView } from "@OpenChart/DiagramView";
import { MultiSelectProperty, StringProperty, TTPTupleProperty } from "@OpenChart/DiagramModel";
import { getDomainCodeFromLabel, getTechniqueNameFromLabel } from "../AttackFlowTemplates";
import { getAtomicRedTeamTests } from "../AttackFlowTemplates/AtomicRedTeamTests";
import { sourceData, type SourceObject } from "../AttackFlowTemplates/SourceEnumeration";
import type { DiagramViewEditor, ObjectRecommendation, ObjectRecommendations } from "@OpenChart/DiagramEditor";
import type { DiagramObjectView } from "@OpenChart/DiagramView";
import type { TieEngine, TiePrediction } from "tie-inference-web";
import type { DefensiveObjectType, DefensiveSourceObject } from "@/assets/scripts/OpenChart/DiagramEditor/Commands/index.commands";
import { enums as DefendEnums } from "../AttackFlowTemplates/MitreDefend.ts";

type TechniqueInfo = {
    techniqueId: string;
    technique: StringProperty;
    framework: string;
};

const ENTERPRISE_FRAMEWORK = "ENT";
const ENTERPRISE_LABEL_PREFIX = "[ENT]";
const TIE_RECOMMENDATION_LIMIT = 5;

export class AttackFlowRecommender extends BasicRecommender {

    /**
     * The recommender's active target.
     */
    private target: DiagramObjectView | null;

    /**
     * The TIE engine.
     */
    private engine: Promise<TieEngine> | null;

    /**
     * Cached predictions by technique id.
     */
    private predictions: Map<string, Promise<TiePrediction[]>>;


    /**
     * Creates a new {@link AttackFlowRecommender}.
     */
    constructor() {
        super();
        this.target = null;
        this.engine = null;
        this.predictions = new Map();
    }

    /**
     * Starts the recommender.
     * @param editor
     *  The recommender's editor.
     * @param object
     *  The recommender's active target.
     */
    public override start(editor: DiagramViewEditor, object: DiagramObjectView) {
        super.start(editor, object);
        this.target = object;
    }

    /**
     * Stops the recommender.
     */
    public override shutdown() {
        super.shutdown();
        this.target = null;
    }

    /**
     * Returns the set of recommendations.
     * @returns
     *  A Promise that resolves with the recommendations.
     */
    public override async getRecommendations(): Promise<ObjectRecommendations> {
        const recommendations = await super.getRecommendations();
        const techniqueInfo = this.getTechniqueInfo();
        if (!techniqueInfo) {
            return recommendations;
        }

        const items = [...recommendations.items];
        const actionRecommendation = items.find(item => item.id === "action");
        const redTeamTestRecommendation = items.find(item => item.id === "red-team-test");
        const [tieRows, atomicTestRows] = await Promise.all([
            actionRecommendation
                ? this.getTieRecommendationRows(techniqueInfo, actionRecommendation)
                : [],
            redTeamTestRecommendation
                ? this.getAtomicTestRecommendationRows(techniqueInfo, redTeamTestRecommendation)
                : []
        ]);
        this.insertRecommendationRows(items, "action", tieRows);
        this.insertRecommendationRows(items, "red-team-test", atomicTestRows);
        this.insertDefensiveObjectRecommendationRows(items, techniqueInfo, "mitigation");
        this.insertDefensiveObjectRecommendationRows(items, techniqueInfo, "detection");
        this.insertDefensiveObjectRecommendationRows(items, techniqueInfo, "countermeasure");
        return { items };
    }

    /**
     * Gets the technique that should drive contextual recommendations.
     * @returns
     *  The technique information, or null if generic recommendations should be used.
     */
    private getTechniqueInfo(): TechniqueInfo | null {
        if (!(this.target instanceof LatchView) || !this.target.isTarget()) {
            return null;
        }
        if (!(this.target.parent instanceof LineView)) {
            return null;
        }

        const actionObject = this.target.parent.sourceObject;
        if (actionObject?.id !== "action") {
            return null;
        }

        const ttp = actionObject.properties.get("ttp", TTPTupleProperty);
        const technique = ttp?.get("technique", StringProperty);
        if (!technique?.value) {
            return null;
        }

        const label = technique.options?.value.get(technique.value)?.toString();
        if (!label) {
            return null;
        }

        const framework = getDomainCodeFromLabel(label);
        if (!framework || !this.isFrameworkEnabled(framework)) {
            return null;
        }

        return {
            techniqueId: technique.value,
            framework,
            technique
        };
    }

    /**
     * Tests if the flow currently has a framework enabled.
     * @param framework
     *  The framework code.
     * @returns
     *  True if the framework is enabled, false otherwise.
     */
    private isFrameworkEnabled(framework: string): boolean {
        const canvas = this.getCanvas();
        const frameworks = canvas?.properties.get("ttp_frameworks", MultiSelectProperty);
        return frameworks?.values.has(framework) ?? false;
    }

    /**
     * Gets the active target's canvas.
     * @returns
     *  The target's canvas, or null if it cannot be resolved.
     */
    private getCanvas(): CanvasView | null {
        let object = this.target;
        while (object?.parent) {
            object = object.parent as DiagramObjectView;
        }
        return object instanceof CanvasView ? object : null;
    }

    /**
     * Inserts TIE prediction rows under the action recommendation.
     * @param items
     *  The recommendation items to update.
     * @param techniqueInfo
     *  The technique information.
     */
    private async getTieRecommendationRows(
        techniqueInfo: TechniqueInfo,
        actionRecommendation: ObjectRecommendation
    ): Promise<ObjectRecommendation[]> {
        if (techniqueInfo.framework !== ENTERPRISE_FRAMEWORK) {
            return [];
        }

        return this.getPredictionRows(techniqueInfo, actionRecommendation);
    }

    /** Gets Atomic Red Team test rows for an Enterprise ATT&CK technique. */
    private async getAtomicTestRecommendationRows(
        techniqueInfo: TechniqueInfo,
        redTeamTestRecommendation: ObjectRecommendation
    ): Promise<ObjectRecommendation[]> {
        if (techniqueInfo.framework !== ENTERPRISE_FRAMEWORK) {
            return [];
        }

        try {
            const tests = await getAtomicRedTeamTests(techniqueInfo.techniqueId);
            return tests.map((test, index) => ({
                id: `atomic:${techniqueInfo.techniqueId}:${index}`,
                color: redTeamTestRecommendation.color,
                name: test.name,
                subtitle: "Atomic Red Team test",
                parentId: redTeamTestRecommendation.id,
                atomicRedTeamTest: test
            }));
        } catch (error) {
            console.warn("Unable to load Atomic Red Team recommendations.", error);
            return [];
        }
    }

    /** Inserts child recommendations directly after their parent recommendation. */
    private insertRecommendationRows(
        items: ObjectRecommendation[],
        parentId: string,
        rows: ObjectRecommendation[]
    ): void {
        const parentIndex = items.findIndex(item => item.id === parentId);
        if (parentIndex !== -1 && rows.length) {
            items.splice(parentIndex + 1, 0, ...rows);
        }
    }

    /**
     * Inserts mapped defensive object rows under their blank object recommendation.
     * @param items
     *  The recommendation items to update.
     * @param techniqueInfo
     *  The technique information.
     * @param type
     *  The defensive object type.
     */
    private insertDefensiveObjectRecommendationRows(
        items: ObjectRecommendation[],
        techniqueInfo: TechniqueInfo,
        defensiveObjectType: DefensiveObjectType
    ) {
        const parentIndex = items.findIndex(item => item.id === defensiveObjectType);
        if (parentIndex === -1) {
            return;
        }

        const defensiveObjectRows = this.getDefensiveObjectRecommendationRows(
            techniqueInfo,
            items[parentIndex],
            defensiveObjectType
        );
        if (defensiveObjectRows.length) {
            items.splice(parentIndex + 1, 0, ...defensiveObjectRows);
        }
    }

    /**
     * Gets mapped defensive object recommendations for a technique.
     * @param techniqueInfo
     *  The technique information.
     * @param parentRecommendation
     *  The blank object recommendation.
     * @param defensiveObjectType
     *  The defensive object type.
     * @returns
     *  The mapped defensive object recommendations.
     */
    private getDefensiveObjectRecommendationRows(
        techniqueInfo: TechniqueInfo,
        parentRecommendation: ObjectRecommendation,
        defensiveObjectType: DefensiveObjectType
    ): ObjectRecommendation[] {
        const rows: ObjectRecommendation[] = [];
        for (const defensiveObject of this.getMappedDefensiveObjects(techniqueInfo, defensiveObjectType)) {
            rows.push({
                id: defensiveObject.id,
                color: parentRecommendation.color,
                name: `${defensiveObject.id} ${defensiveObject.name}`,
                subtitle: `Mapped ${defensiveObjectType}`,
                parentId: parentRecommendation.id,
                defensiveObjectType
            });
        }
        return rows;
    }

    /**
     * Gets defensive objects directly mapped to a technique.
     * @param techniqueInfo
     *  The technique information.
     * @param defensiveObjectType
     *  The defensive object type.
     * @returns
     *  The mapped defensive objects.
     */
    private getMappedDefensiveObjects(
        techniqueInfo: TechniqueInfo,
        defensiveObjectType: DefensiveObjectType
    ): DefensiveSourceObject[] {

        /** The set of defensive object IDs related to the given technique. */
        let defensiveObjectIds : string[] | null = null;
        /** Defensive objects keyed by their ids. */
        let defensiveObjectsById : Record<string, SourceObject> | null = null;

        switch (defensiveObjectType) {
            case "detection":
                defensiveObjectIds = sourceData.relationships.techniqueDetections
                    .filter(rel => rel.techniqueId === techniqueInfo.techniqueId)
                    .map(rel => rel.detectionId);
                defensiveObjectsById = sourceData.detections;
                break;
            case "mitigation":
                defensiveObjectIds = sourceData.relationships.techniqueMitigations
                    .filter(rel => rel.techniqueId === techniqueInfo.techniqueId)
                    .map(rel => rel.mitigationId);
                defensiveObjectsById = sourceData.mitigations;
                break;
            case "countermeasure": {
                const defendTechniques = DefendEnums.techniques as Record<string, SourceObject>;
                const countermeasuresByTechnique = DefendEnums.relationships.offensiveTechniquesToCountermeasures as Record<string, string[]>;
                const countermeasureIds = countermeasuresByTechnique[techniqueInfo.techniqueId];
                defensiveObjectIds = countermeasureIds ?? [];
                defensiveObjectsById = {};
                for (const c of defensiveObjectIds) {
                    const countermeasure = defendTechniques[c];
                    if (!countermeasure) { continue; }
                    defensiveObjectsById[c] = countermeasure;
                }

                break;
            }
        }

        if (!defensiveObjectIds || !defensiveObjectsById) {
            throw new Error("defensiveObjectIds and defensiveObejctsById should not be null.");
        }

        const defensiveObjects: DefensiveSourceObject[] = [];
        const seen = new Set<string>();

        for (const defensiveObjectId of defensiveObjectIds) {
            const defensiveObject = defensiveObjectsById[defensiveObjectId] as DefensiveSourceObject | undefined;
            if (!defensiveObject || seen.has(defensiveObject.id)) {
                continue;
            }
            const framework = getDomainCodeFromLabel(defensiveObject.label);
            if (framework && framework !== techniqueInfo.framework) {
                continue;
            }
            seen.add(defensiveObject.id);
            defensiveObjects.push(defensiveObject);
        }
        return defensiveObjects;
    }

    /**
     * Gets prediction rows for a technique.
     * @param techniqueInfo
     *  The technique information.
     * @param actionRecommendation
     *  The generic action recommendation.
     * @returns
     *  The prediction rows.
     */
    private async getPredictionRows(
        techniqueInfo: TechniqueInfo,
        actionRecommendation: ObjectRecommendation
    ): Promise<ObjectRecommendation[]> {
        const predictions = await this.getPredictions(techniqueInfo.techniqueId);
        return this.formatPredictionRows(predictions, techniqueInfo, actionRecommendation);
    }

    /**
     * Gets TIE predictions for a technique.
     * @param techniqueId
     *  The technique id.
     * @returns
     *  The TIE predictions.
     */
    private async getPredictions(techniqueId: string): Promise<TiePrediction[]> {
        if (!this.predictions.has(techniqueId)) {
            this.predictions.set(techniqueId, this.predictTechniques(techniqueId));
        }
        return this.predictions.get(techniqueId)!;
    }

    /**
     * Predicts techniques for a technique.
     * @param techniqueId
     *  The technique id.
     * @returns
     *  The TIE predictions.
     */
    private async predictTechniques(techniqueId: string): Promise<TiePrediction[]> {
        try {
            const engine = await this.getEngine();
            return await engine.predict([techniqueId]);
        } catch (error) {
            console.warn("Unable to load TIE recommendations.", error);
            return [];
        }
    }

    /**
     * Formats TIE predictions as object recommender rows.
     * @param predictions
     *  The TIE predictions.
     * @param techniqueInfo
     *  The technique information.
     * @param actionRecommendation
     *  The generic action recommendation.
     * @returns
     *  The formatted rows.
     */
    private formatPredictionRows(
        predictions: TiePrediction[],
        techniqueInfo: TechniqueInfo,
        actionRecommendation: ObjectRecommendation
    ): ObjectRecommendation[] {
        const rows: ObjectRecommendation[] = [];
        for (const prediction of predictions) {
            const label = techniqueInfo.technique.options?.value.get(prediction.id)?.toString();
            if (!label?.startsWith(ENTERPRISE_LABEL_PREFIX)) {
                continue;
            }
            const name = getTechniqueNameFromLabel(label);
            rows.push({
                id: prediction.id,
                color: actionRecommendation.color,
                name: `${prediction.id} ${name}`,
                subtitle: "Predicted action",
                isTieRecommendation: true,
                parentId: actionRecommendation.id
            });
            if (rows.length === TIE_RECOMMENDATION_LIMIT) {
                break;
            }
        }
        return rows;
    }

    /**
     * Gets the TIE engine.
     * @returns
     *  The TIE engine.
     */
    private getEngine(): Promise<TieEngine> {
        if (!this.engine) {
            this.engine = import("tie-inference-web").then(
                ({ createEngine }) => createEngine(
                    "app.trained.model.zip",
                    "app.enrichment.json",
                    false
                )
            );
        }
        return this.engine;
    }

}

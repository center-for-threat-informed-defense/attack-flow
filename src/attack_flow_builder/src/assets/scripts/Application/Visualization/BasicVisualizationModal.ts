import type {
    VisualizationModalController,
    VisualizationRegistration
} from "./Visualization";

export class BasicVisualizationModal implements VisualizationModalController {

    /**
     * Whether the modal is active.
     */
    public active = false;

    /**
     * The active visualization's identifier.
     */
    private _activeVisualizationId?: string;

    /**
     * The visualization registry.
     */
    public readonly visualizations: readonly VisualizationRegistration[];


    /**
     * Creates a new visualization modal controller.
     * @param visualizations
     *  The visualization registry.
     */
    constructor(visualizations: readonly VisualizationRegistration[] = []) {
        this.visualizations = visualizations;
    }


    /**
     * Returns the active visualization.
     * @returns
     *  The active visualization, if one is open.
     */
    public get activeVisualization(): VisualizationRegistration | undefined {
        return this.visualizations.find(
            vis => vis.id === this._activeVisualizationId
        );
    }


    /**
     * Opens a visualization in the modal.
     * @param id
     *  The visualization's identifier.
     */
    public open(id: string): void {
        const visualization = this.visualizations.find(vis => vis.id === id);
        if (!visualization) {
            return;
        }
        this._activeVisualizationId = visualization.id;
        this.active = true;
    }

    /**
     * Closes the modal.
     */
    public close(): void {
        this.active = false;
        this._activeVisualizationId = undefined;
    }

}

export interface DiagramAction {

    /**
     * Applies the action.
     */
    redo(): void;

    /**
     * Reverts the action.
     */
    undo(): void;

}

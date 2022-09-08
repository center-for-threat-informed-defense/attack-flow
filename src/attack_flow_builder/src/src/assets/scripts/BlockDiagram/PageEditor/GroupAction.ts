import { DiagramAction } from "./DiagramAction";

export class GroupAction implements DiagramAction {

    /**
     * The list of actions in order of application.
     */
    private _actions: DiagramAction[];
    

    /**
     * Creates a new {@link GroupAction}.
     */
    constructor();

    /**
     * Creates a new {@link GroupAction}.
     * @param actions
     *  The group of actions.
     */
    constructor(actions: DiagramAction[]);
    constructor(actions?: DiagramAction[]) {
        this._actions = actions ?? [];
    }
    

    /**
     * Adds an action to the group.
     * @param action
     *  The action.
     */
    public add(action: DiagramAction) {
        this._actions.push(action);
    }

    /**
     * Applies the set of actions.
     */
    public redo() {
        let i = 0;
        let l = this._actions.length;
        try {
            for(; i < l; i++) {
                this._actions[i].redo();
            }
        } catch (ex) {
            // Rollback on failure
            for(i--; 0 <= i; i--) {
                this._actions[i].undo();
            }
            throw ex;
        }
    }

    /**
     * Reverts the set of actions.
     */
    public undo() {
        let l = this._actions.length - 1;
        for(let i = l; 0 <= i; i--) {
            this._actions[i].undo();
        }
    }

}

import { DiagramAction } from "./DiagramAction";
import { GroupAction } from "./GroupAction";

export class DiagramController {

    /**
     * The controller's undo stack.
     */
    private _undoStack: DiagramAction[];

    /**
     * The controller's redo stack.
     */
    private _redoStack: DiagramAction[];

    /**
     * The controller's list of open transactions.
     */
    private _transactions: GroupAction[];


    /**
     * Creates a new {@link DiagramController}.
     */
    constructor() {
        this._undoStack = [];
        this._redoStack = [];
        this._transactions = [];
    }

    
    /**
     * Executes a single action.
     * @param action
     *  The action.
     */
    public execute(action: DiagramAction): void;
    
    /**
     * Executes a set of actions in a single transaction.
     * @param actions
     *  The set of actions.
     */
    public execute(actions: DiagramAction[]): void;
    public execute(action: DiagramAction[] | DiagramAction) {
        if(Array.isArray(action)) {
            action = new GroupAction(action);    
        }
        if(this._transactions.length) {
            this._transactions.at(-1)!.add(action);
        } else {
            action.redo();
            this._redoStack = [];
            this._undoStack.push(action);
        }
    }

    /**
     * Undoes the last action.
     */
    public undo() {
        this._transactions = [];
        if(this._undoStack.length) {
            this._undoStack.at(-1)!.undo();
            this._redoStack.push(this._undoStack.pop()!);
        }
    }

    /**
     * Tests if the last action can be undone.
     * @returns
     *  True if the last action can be undone, false otherwise.
     */
    public canUndo(): boolean {
        return 0 < this._undoStack.length;
    }

    /**
     * Undoes the last undo action.
     */
    public redo() {
        this._transactions = [];
        if(this._redoStack.length) {
            this._redoStack.at(-1)!.redo();
            this._undoStack.push(this._redoStack.pop()!);
        }
    }

    /**
     * Tests if the last undo action can be redone.
     * @returns
     *  True if the last undo action can be redone, false otherwise.
     */
    public canRedo(): boolean {
        return 0 < this._redoStack.length;
    }

    /**
     * Begins a new transaction. All following calls to `execute()` will be
     * queued and run when `endTransaction()` is called. Calls to `undo()` or 
     * `redo()` will destroy all currently open transactions. Transactions nest
     * inside each other and will only execute once the outermost transaction
     * has ended.
     */
    public beginTransaction() {
        this._transactions.push(new GroupAction());
    }

    /**
     * Ends the current transaction.
     */
    public endTransaction() {
        if(this._transactions.length) {
            this.execute(this._transactions.pop()!);
        } else {
            throw new Error("There are no open transactions.")
        }   
    }

    /**
     * Clears the controller's undo / redo history.
     */
    public clearHistory() {
        this._undoStack = [];
        this._redoStack = [];
    }

}

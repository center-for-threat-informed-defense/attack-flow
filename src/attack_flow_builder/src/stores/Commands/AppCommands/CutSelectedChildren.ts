import { DiagramObjectModel } from "@/assets/scripts/BlockDiagram";
import { RemoveSelectedChildren } from "../PageCommands/RemoveSelectedChildren";
import type { ApplicationStore } from "@/stores/Stores/ApplicationStore";
import { CopySelectedChildren } from ".";

export class CutSelectedChildren extends CopySelectedChildren {

    /**
     * The application context.
     */
    public readonly context: ApplicationStore;

    /**
     * The objects to add to the clipboard.
     */
    public readonly objects: DiagramObjectModel[];

    /**
     * The command to perform removal upon cut.
     */
    public readonly removeCommand: RemoveSelectedChildren;


    /**
     * Cuts an object's selected children to the application's clipboard.
     * @param context
     *  The application context.
     * @param object
     *  The object.
     */
    constructor(context: ApplicationStore, object: DiagramObjectModel) {
        super(context, object);
        this.context = context;
        // Get selected children
        const objects = object.children.filter(c => c.isSelected());
        // Clone selection
        this.objects = object.factory.cloneObjects(...objects);
        // Build remove command for when cut is executed
        this.removeCommand = new RemoveSelectedChildren(object);
    }


    /**
     * Executes the command.
     * @returns
     *  True if the command should be recorded, false otherwise.
     */
    public override async execute(): Promise<void> {
        // Set the clipboard
        this.context.clipboard = this.objects;

        // Perform copy command from supertype
        const copyCommandResult = super.execute();

        // Remove the selected children
        this.context.activePage.execute(this.removeCommand);

        return copyCommandResult;
    }

}

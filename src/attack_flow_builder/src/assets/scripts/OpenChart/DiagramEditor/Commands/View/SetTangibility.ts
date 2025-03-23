import { EditorCommand } from "../EditorCommand";
import type { DiagramObjectView } from "@OpenChart/DiagramView";

export class SetTangibility extends EditorCommand { 

    /**
     *  The object to configure.
     */
    public readonly object: DiagramObjectView;
   
    /**
     * The object's tangibility.
     */
    public readonly tangibility: number;


    /**
     * Sets a object's tangibility.
     * @param object
     *  The object to configure.
     * @param tangibility
     *  The object's tangibility.
     */
    constructor(object: DiagramObjectView, tangibility: number) {
        super();
        this.object = object;
        this.tangibility = tangibility;
    }
    

    /**
     * Executes the editor command.
     */
    public execute(): void {
        this.object.tangibility = this.tangibility;
    }

    /**
     * Undoes the editor command.
     */
    public undo(): void {}

}

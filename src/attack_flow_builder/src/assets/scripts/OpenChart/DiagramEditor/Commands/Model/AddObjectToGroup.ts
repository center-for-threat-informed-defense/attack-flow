import { EditorDirective } from "../../EditorDirectives";
import { SynchronousEditorCommand } from "../SynchronousEditorCommand";
import type { DiagramObject, Group } from "@OpenChart/DiagramModel";
import type { DirectiveIssuer } from "../../EditorDirectives";

export class AddObjectToGroup extends SynchronousEditorCommand {

    /**
     * The diagram object.
     */
    public readonly object: DiagramObject;

    /**
     * The group.
     */
    public readonly group: Group;


    /**
     * Adds an diagram object to a group.
     * @param object
     *  The diagram object.
     * @param group
     *  The group.
     */
    constructor(object: DiagramObject, group: Group) {
        super();
        this.object = object;
        this.group = group;
    }


    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public execute(issueDirective: DirectiveIssuer = () => {}): void {
        this.group.addObject(this.object, undefined, true);
        // Issue directives
        const directives
            = EditorDirective.Autosave
            | EditorDirective.Record
            | EditorDirective.ReindexContent
            | EditorDirective.ReindexSelection;
        issueDirective(directives, this.object.instance);
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public undo(issueDirective: DirectiveIssuer = () => {}): void {
        this.group.removeObject(this.object, true);
        // Issue directives
        const directives
            = EditorDirective.Autosave
            | EditorDirective.Record
            | EditorDirective.ReindexContent
            | EditorDirective.ReindexSelection;
        issueDirective(directives, this.object.instance);
    }

}

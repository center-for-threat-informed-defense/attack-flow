import { EditorDirective } from "../../EditorDirectives";
import { SynchronousEditorCommand } from "../SynchronousEditorCommand";
import type { DirectiveIssuer } from "../../EditorDirectives";
import type { DiagramObject, Group } from "@OpenChart/DiagramModel";

export class AddGroupToGroup extends SynchronousEditorCommand {

    /**
     * The source group being added.
     */
    public readonly sourceGroup: Group;

    /**
     * The target group being added to.
     */
    public readonly targetGroup: Group;

    /**
     * The set of objects in source group.
     */
    public readonly sourceObjects: Set<DiagramObject>;


    /**
     * Adds a diagram group to a group.
     * @param sourceGroup
     *  The source group.
     * @param targetGroup
     *  The target group.
     */
    constructor(sourceGroup: Group, targetGroup: Group) {
        super();
        this.sourceGroup = sourceGroup;
        this.targetGroup = targetGroup;
        this.sourceObjects = new Set(this.sourceGroup.objects);
    }


    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public execute(issueDirective: DirectiveIssuer = () => { }): void {
        const directives
            = EditorDirective.Autosave
            | EditorDirective.Record
            | EditorDirective.ReindexContent
            | EditorDirective.ReindexSelection;
        for (const object of [...this.sourceGroup.objects]) {
            this.sourceGroup.removeObject(object, true);
            this.targetGroup.addObject(object, undefined, true);
            issueDirective(directives, object.instance);
        }
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public undo(issueDirective: DirectiveIssuer = () => { }): void {
        const directives
            = EditorDirective.Autosave
            | EditorDirective.Record
            | EditorDirective.ReindexContent
            | EditorDirective.ReindexSelection;
        for (const object of this.sourceObjects) {
            this.targetGroup.removeObject(object, true);
            this.sourceGroup.addObject(object, undefined, true);
            issueDirective(directives, object.instance);
        }

    }

}

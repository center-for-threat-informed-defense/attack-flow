import { EditorCommand } from "../EditorCommand";
import { EditorDirective } from "../EditorDirective";
import { Anchor, findExternalLinks, Group, Latch } from "@OpenChart/DiagramModel";
import type { DiagramObject } from "@OpenChart/DiagramModel";
import type { DirectiveIssuer } from "../DirectiveIssuer";

export class RemoveObjectFromGroup extends EditorCommand {

    /**
     * The diagram objects to remove.
     */
    public readonly objects: [number, DiagramObject][];

    /**
     * The diagram objects' group.
     */
    public readonly group: Group;

    /**
     * The diagram objects' external links.
     */
    public readonly links: [Anchor, Latch][];


    /**
     * Removes one or more objects from their parent object.
     * @remarks
     *  Do NOT perform more than one `RemoveObjectFromGroup` in a single
     *  transaction. If removals are broken into separate requests, their
     *  mutual dependencies can't be determined. This may cause `undo()` and 
     *  `redo()` to break as they can no longer reconstruct the objects and
     *  dependencies correctly.
     * @param objects
     *  The objects to remove from their parents.
     */
    constructor(objects: DiagramObject[]) {
        super();
        if(objects.length === 0) {
            throw new Error("No objects to remove.");
        }
        if(!(objects[0].parent instanceof Group)) {
            throw new Error("Objects must belong to a group.");
        }
        this.group = objects[0].parent;
        this.objects = objects.map(o => [this.group.getObjectIndex(o), o]);
        this.links = findExternalLinks(objects);
    }
    
    
    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public execute(issueDirective: DirectiveIssuer = () => {}): void {
        // Detach links
        for(const [_, link] of this.links) {
            link.unlink(true);
        }
        // Remove objects
        for(const [_, object] of this.objects) {
            this.group.removeObject(object, true);   
            // Issue directives
            const directives 
                = EditorDirective.Autosave
                | EditorDirective.Record
                | EditorDirective.ReindexContent
                | EditorDirective.ReindexSelection;
            issueDirective(directives, object.instance);
        }   
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public undo(issueDirective: DirectiveIssuer = () => {}): void {
        // Add objects
        for(const [idx, object] of this.objects) {
            this.group.addObject(object, idx, true);
            // Issue directives
            const directives 
                = EditorDirective.Autosave
                | EditorDirective.Record
                | EditorDirective.ReindexContent
                | EditorDirective.ReindexSelection;
            issueDirective(directives, object.instance);
        }
        // Attach links
        for(const [anchor, link] of this.links) {
            anchor.link(link, true);
        }
    }

}

import { EditorDirective } from "../../EditorDirectives";
import { SynchronousEditorCommand } from "../SynchronousEditorCommand";
import type { DirectiveIssuer } from "../../EditorDirectives";
import type { DiagramModelFile } from "@OpenChart/DiagramModel";

export class SetDefaultTimezone extends SynchronousEditorCommand {

    /**
     * The diagram file.
     */
    public readonly file: DiagramModelFile;

    /**
     * The diagram's last timezone.
     */
    public readonly prevTimezone: string;

    /**
     * The diagram's next timezone.
     */
    public readonly nextTimezone: string;


    /**
     * Sets the diagram file's default timezone.
     * @param file
     *  The diagram file.
     * @param zone
     *  The diagram's default timezone.
     */
    constructor(file: DiagramModelFile, zone: string) {
        super();
        this.file = file;
        this.prevTimezone = file.factory.defaultTimezone;
        this.nextTimezone = zone;
    }


    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public execute(issueDirective: DirectiveIssuer = () => {}): void {
        this.file.factory.defaultTimezone = this.nextTimezone;
        // Issue directives
        issueDirective(EditorDirective.Record);
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public undo(issueDirective: DirectiveIssuer = () => {}): void {
        this.file.factory.defaultTimezone = this.prevTimezone;
        // Issue directives
        issueDirective(EditorDirective.Record);
    }

}

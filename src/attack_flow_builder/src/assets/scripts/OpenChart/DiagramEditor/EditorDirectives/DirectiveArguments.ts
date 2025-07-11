import type { EditorDirective } from "./EditorDirective";

export type DirectiveArguments = {

    /**
    * The editor directives.
    */
    directives: EditorDirective;

    /**
    * The objects to index.
    */
    index: Set<string>;

};

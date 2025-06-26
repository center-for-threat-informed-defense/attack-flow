import type { EditorDirective } from "./EditorDirective";

export type DirectiveIssuer = (directives: EditorDirective, obj?: string) => void;

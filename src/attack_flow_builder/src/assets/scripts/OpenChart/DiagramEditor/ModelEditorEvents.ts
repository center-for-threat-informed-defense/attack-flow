import type { EditorCommand } from "./Commands";
import type { DiagramModelEditor } from "./DiagramModelEditor";
import type { DirectiveArguments } from "./EditorDirectives";

export type ModelEditorEvents = {
    autosave: (editor: DiagramModelEditor) => void;
    beforeEdit: (editor: DiagramModelEditor, cmd: EditorCommand) => void;
    edit: (editor: DiagramModelEditor, cmd: EditorCommand, args: DirectiveArguments) => void;
};

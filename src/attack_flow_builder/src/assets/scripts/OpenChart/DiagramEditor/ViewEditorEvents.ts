import type { ModelEditorEvents } from "./ModelEditorEvents";
import type { DiagramViewEditor } from "./DiagramViewEditor";

export type ViewEditorEvents = ModelEditorEvents & {
    autosave: (editor: DiagramViewEditor) => void;
};

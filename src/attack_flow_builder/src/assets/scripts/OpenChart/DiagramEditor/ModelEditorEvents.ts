import type { DiagramModelEditor } from "./DiagramModelEditor";

export type ModelEditorEvents = {
    autosave: (editor: DiagramModelEditor) => void;
};

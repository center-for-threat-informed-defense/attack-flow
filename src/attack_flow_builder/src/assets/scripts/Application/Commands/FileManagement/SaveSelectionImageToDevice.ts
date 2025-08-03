import { Device } from "@/assets/scripts/Browser";
import { traverse } from "@OpenChart/DiagramModel";
import { AppCommand } from "../AppCommand";
import { DiagramImage } from "@OpenChart/DiagramView";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { DiagramObjectView } from "@OpenChart/DiagramView";
import type { DiagramViewEditor } from "@OpenChart/DiagramEditor";

export class SaveSelectionImageToDevice extends AppCommand {

    /**
     * The application context.
     */
    public readonly context: ApplicationStore;

    /**
     * The file's editor.
     */
    public readonly editor: DiagramViewEditor;

    /**
     * The object's to capture.
     */
    public readonly objects: DiagramObjectView[];


    /**
     * Saves a diagram's selection as an image to the user's file system.
     * @param context
     *  The application context.
     * @param editor
     *  The file's editor.
     */
    constructor(context: ApplicationStore, editor: DiagramViewEditor) {
        super();
        this.context = context;
        this.editor = editor;
        this.objects = [
            ...traverse<DiagramObjectView>(
                editor.file.canvas, o => o.focused
            )
        ];
    }


    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        const d = this.context.settings.view.diagram;
        const e = this.context.settings.file.image_export;
        const image = new DiagramImage(
            this.editor.file.canvas,
            e.padding,
            d.display_shadows,
            d.display_debug_info,
            e.include_background
        );
        const filename = this.editor.file.canvas.properties.toString();
        Device.downloadImageFile(filename, image.capture(this.objects));
    }

}

import { ref } from "vue";
import { AppCommand } from "../AppCommand";
import { DiagramViewEditor, PowerEditPlugin } from "@OpenChart/DiagramEditor";
import { SaveDiagramFileToRecoveryBank } from "./SaveDiagramFileToRecoveryBank";
import type { DiagramViewFile } from "@OpenChart/DiagramView";
import type { ApplicationStore } from "@/stores/ApplicationStore";

export class LoadFile extends AppCommand {

    /**
     * The editor to load.
     */
    public readonly editor: DiagramViewEditor;

    /**
     * The application context.
     */
    public readonly context: ApplicationStore;


    /**
     * Loads a {@link DiagramViewFile} into the application.
     * @param context
     *  The application context.
     * @param file
     *  The file to load.
     */
    constructor(context: ApplicationStore, file: DiagramViewFile);

    /**
     * Loads a {@link DiagramViewFile} into the application.
     * @param context
     *  The application context.
     * @param file
     *  The file to load.
     * @param name
     *  The file's name.
     */
    constructor(context: ApplicationStore, file: DiagramViewFile, name?: string);
    constructor(context: ApplicationStore, file: DiagramViewFile, name?: string) {
        super();
        this.context = context;
        const settings = context.settings;
        // Configure editor
        this.editor = ref(new DiagramViewEditor(file, name)).value;
        this.editor.on("autosave", editor => {
            context.execute(new SaveDiagramFileToRecoveryBank(context, editor));
        });
        // Configure interface plugins
        const factory = this.editor.file.factory;
        const lineTemplate = settings.edit.anchor_line_template;
        this.editor.interface.installPlugin(
            new PowerEditPlugin(this.editor, { factory, lineTemplate })
        );
        // Apply view settings
        const view = settings.view.diagram;
        this.editor.interface.enableShadows(view.display_shadows);
        this.editor.interface.enableDebugInfo(view.display_debug_info);
        this.editor.interface.enableAnimations(view.display_animations);
    }


    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        this.context.activeEditor = this.editor;
    }

}

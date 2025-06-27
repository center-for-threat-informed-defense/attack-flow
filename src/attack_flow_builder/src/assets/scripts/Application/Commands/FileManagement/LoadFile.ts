import { ref } from "vue";
import { AppCommand } from "../AppCommand";
import { EditorDirective } from "@OpenChart/DiagramEditor/EditorDirectives";
import { SaveDiagramFileToRecoveryBank } from "./SaveDiagramFileToRecoveryBank";
import { 
    DarkThemeMarquee, DiagramViewEditor, LightThemeMarquee,
    PowerEditPlugin, RectangleSelectPlugin
} from "@OpenChart/DiagramEditor";
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
        this.editor.on("edit", (editor, _, args) => {
            // If command will result in an auto-save...
            if(args.directives & EditorDirective.Autosave) {
                // ...run the validator.
                context.activeValidator?.run(editor.file);
            }
        })
        // TODO: Move into application configuration
        const marqueeThemes = {
            "dark_theme"  : DarkThemeMarquee,
            "blog_theme"  : LightThemeMarquee,
            "light_theme" : LightThemeMarquee,
        }
        // Configure interface plugins
        const hotkeys = context.settings.hotkeys.edit;
        const factory = this.editor.file.factory;
        const lineTemplate = settings.edit.anchor_line_template;
        this.editor.interface.installPlugin(
            new RectangleSelectPlugin(this.editor, marqueeThemes, hotkeys.select_marquee),
            new PowerEditPlugin(this.editor, { factory, lineTemplate })
        );
        // Apply view settings
        const view = settings.view.diagram;
        this.editor.interface.enableShadows(view.display_shadows);
        this.editor.interface.enableDebugInfo(view.display_debug_info);
        this.editor.interface.enableAnimations(view.display_animations);
        // Run validator
        context.activeValidator?.run(this.editor.file);
    }


    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        this.context.activeEditor = this.editor;
    }

}

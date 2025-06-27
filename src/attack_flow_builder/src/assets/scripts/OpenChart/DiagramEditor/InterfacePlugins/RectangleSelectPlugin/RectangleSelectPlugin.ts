import * as EditorCommands from "../../Commands";
import { DarkThemeMarquee, RectangleMarquee } from "./RectangleMarquee";
import { Cursor, DiagramInterfacePlugin, SubjectTrack } from "@OpenChart/DiagramInterface";
import type { MarqueeThemeMap } from "./MarqueeThemeMap";
import type { DiagramViewEditor } from "../../DiagramViewEditor";

export class RectangleSelectPlugin extends DiagramInterfacePlugin {
    
    /**
     * The rectangle marquee's markup identifier.
     */
    private static MarkupId = "rectangle_select_plugin_markup";

    /**
     * The plugin's editor.
     */
    private readonly editor: DiagramViewEditor;

    /**
     * The plugin's theme map.
     */
    private readonly themes: MarqueeThemeMap;

    /**
     * The plugin's hotkey.
     */
    private readonly hotkey: string;

    /**
     * The plugin's marquee markup object.
     */
    private readonly marquee: RectangleMarquee;


    /**
     * Creates a new {@link RectangleSelectPlugin}.
     * @param editor
     *  The plugin's editor.
     * @param themes
     *  The plugin's theme map.
     * @param hotkey
     *  The plugin's hotkey.
     */
    constructor(editor: DiagramViewEditor, themes: MarqueeThemeMap, hotkey: string) {
        super();
        this.editor = editor;
        this.themes = themes;
        this.hotkey = hotkey;
        this.marquee = new RectangleMarquee(DarkThemeMarquee);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Hover Interactions  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Tests if the plugin can handle a hover event.
     * @remarks
     *  This plugin doesn't handle hover events, so it always returns false.
     */
    public canHandleHover(): boolean {
        return false;
    }

    /**
     * Hover start logic.
     * @remarks
     *  This plugins doesn't handle hover events, so this is a no-op.
     */
    protected handleHoverStart(): void {}


    ///////////////////////////////////////////////////////////////////////////
    //  2. Selection Interactions  ////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Tests if the plugin can handle a selection.
     * @remarks
     *  Determine if the selection modifier key is being pressed.
     * @param _x
     *  The cursor's current x-coordinate. (Unused)
     * @param _y
     *  The cursor's current y-coordinate. (Unused)
     * @param event
     *  The mouse event.
     * @returns
     *  True if the plugin can handle the event, false otherwise.
     */
    public canHandleSelection(_x: number, _y: number, event: MouseEvent): boolean {
        switch(this.hotkey.toLocaleLowerCase()) {
            case "alt":
                return event.altKey;
            case "control":
                return event.ctrlKey;
            case "shift":
                return event.shiftKey;
            case "meta":
                return event.metaKey;
            default:
                return false;
        }
    }

    /**
     * Selection start logic.
     * @remarks
     *  Initialize a new rectangular selection.
     * @returns
     *  Always return false to avoid transferring control back to the interface.
    */
    protected handleSelectStart(): boolean {
        // Reset marquee style
        const theme = this.editor.file.factory.theme.id;
        this.marquee.style = this.themes[theme] ?? DarkThemeMarquee;
        // Reset marquee position
        this.marquee.reset(this.track.xCursor, this.track.yCursor);
        // Register markup
        this.editor.interface.addMarkup(RectangleSelectPlugin.MarkupId, this.marquee);
        // Update cursor
        this.editor.interface.emit("cursor-change", Cursor.Crosshair);
        // Return
        return false;
    }

    /**
     * Selection drag logic.
     * @remarks
     *  Select all objects that intersect the marquee.
     * @param track
     *  The subject track.
     */
    protected handleSelectDrag(track: SubjectTrack): void {
        const { newGroupCommand, selectObject, unselectAllObjects } = EditorCommands;
        // Get delta
        const delta = track.getDistance();
        // Update the marquee's position
        this.marquee.moveEndPoint(delta);
        // Update the marquee's selection
        const cmd = newGroupCommand();
        cmd.do(unselectAllObjects(this.editor));
        for (const obj of this.editor.file.canvas.objects) {
            if (obj.overlaps(this.marquee.boundingBox)) {
                cmd.do(selectObject(this.editor, obj));
            }
        }
        this.editor.execute(cmd);
        // Apply delta
        this.track.applyDelta(delta);
        // Render marquee
        this.editor.interface.render();
    }

    /**
     * Selection end logic.
     * @remarks
     *  Hide the markup.
     */
    protected handleSelectEnd(): void {
        // Remove marquee markup
        this.editor.interface.clearMarkup(RectangleSelectPlugin.MarkupId);
        // Reset cursor
        this.editor.interface.emit("cursor-change", Cursor.Default);
        // Re-render interface
        this.editor.interface.render();
    }

}

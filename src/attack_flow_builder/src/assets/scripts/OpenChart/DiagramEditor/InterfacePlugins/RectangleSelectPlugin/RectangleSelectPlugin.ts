import { Cursor, DiagramInterfacePlugin, SubjectTrack } from "../../../DiagramInterface";
import type { MarqueeDesign } from "../../../DiagramView";
import { selectObject, unselectAllObjects } from "../../Commands";
import type { DiagramViewEditor } from "../../DiagramViewEditor";
import { RectangleMarquee } from "./RectangleMarquee";

const MARKUP_ID = "rectangle_select_plugin_markup";

export class RectangleSelectPlugin extends DiagramInterfacePlugin {
    private editor: DiagramViewEditor;
    private marquee: RectangleMarquee | null;

    /**
     * Creates a new {@link RectangleSelectPlugin}.
     * @param editor
     */
    constructor(editor: DiagramViewEditor) {
        super();
        this.editor = editor;
        this.marquee = null;
    }

    /**
     * This plugin does not support hover, so this method always returns false.
     * @param _x
     * @param _y
     * @param _event
     * @returns
     */
    public canHandleHover(_x: number, _y: number, _event: MouseEvent): boolean {
        return false;
    }

    /**
     * This plugin does not support hover, so this method is a no-op.
     * @param _x
     * @param _y
     * @param _event
     */
    protected handleHoverStart(_x: number, _y: number, _event: MouseEvent): void {
    }

    /**
     * Determine if the selection modifier key is being pressed.
     * @param _x
     * @param _y
     * @param event
     */
    public canHandleSelection(_x: number, _y: number, event: MouseEvent): boolean {
        return event.altKey;
    }

    /**
     * Initialize a new rectangular selection.
     * @param _event
     * @returns
     *  Always return false to avoid transferring control back to the interface.
    */
    protected handleSelectStart(_event: MouseEvent): boolean {
        this.marquee = this.createMarquee();
        this.editor.interface.addMarkup(MARKUP_ID, this.marquee);
        this.editor.interface.emit("cursor-change", Cursor.Crosshair);
        return false;
    }

    /**
     * Select all the objects that intersect the marquee.
     * @param track
     * @param _event
     */
    protected handleSelectDrag(track: SubjectTrack, _event: MouseEvent): void {
        const delta = track.getDistance();
        this.marquee!.moveEnd(delta);

        this.editor.execute(unselectAllObjects(this.editor));
        const rect = this.marquee!.boundingBox;
        for (const obj of this.editor.file.canvas.objects) {
            if (obj.overlaps(rect)) {
                this.editor.execute(selectObject(this.editor, obj));
            }
        }

        this.track.applyDelta(delta);
        this.editor.interface.render();
    }

    /**
     * Hide the markup.
     * @param _event
     */
    protected handleSelectEnd(_event: MouseEvent): void {
        this.marquee = null;
        this.track.reset(0, 0);
        this.editor.interface.clearMarkup(MARKUP_ID);
        this.editor.interface.emit("cursor-change", Cursor.Default);
        this.editor.interface.render();
    }

    /**
     * Create a marquee based on the current theme.
     * @returns
     */
    protected createMarquee(): RectangleMarquee {
        const theme = this.editor.file.factory.theme;
        const design = theme.designs["marquee"] as MarqueeDesign;
        return new RectangleMarquee(design.style, this.track.xCursor, this.track.yCursor);
    }
}

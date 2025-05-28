import * as EditorCommands from "../../Commands";
import { findImplicitSelection, traverse } from "@OpenChart/DiagramModel";
import { BlockMover, GenericMover, LatchMover } from "./ObjectMovers";
import { Cursor, DiagramInterfacePlugin, SubjectTrack } from "@OpenChart/DiagramInterface";
import { AnchorView, BlockView, HandleView, LatchView, LineView, Orientation } from "@OpenChart/DiagramView";
import type { CursorMap } from "./CursorMap";
import type { ObjectMover } from "./ObjectMovers";
import type { DiagramViewEditor } from "../../DiagramViewEditor";
import type { DiagramObjectView } from "@OpenChart/DiagramView";
import type { PowerEditPluginSettings } from "./PowerEditPluginSettings";

export class PowerEditPlugin extends DiagramInterfacePlugin {

    /**
     * The plugin's cursor map.
     */
    private static CursorMap: CursorMap = {
        [LineView.name]   : () => Cursor.Move,
        [BlockView.name]  : () => Cursor.Move,
        [LatchView.name]  : () => Cursor.Pointer,
        [AnchorView.name] : () => Cursor.Default,
        [HandleView.name] : (o) => {
            switch (o.orientation) {
                case Orientation.D0:
                    return Cursor.EW_Resize;
                case Orientation.D90:
                    return Cursor.NS_Resize;
                default:
                    return Cursor.Move;
            }
        }
    };

    /**
     * The plugin's editor.
     */
    public readonly editor: DiagramViewEditor;

    /**
     * The plugin's settings.
     */
    private readonly settings: PowerEditPluginSettings;

    /**
     * The plugin's selection.
     */
    private selection: DiagramObjectView | undefined;

    /**
     * The plugin's active mover.
     */
    private mover: ObjectMover | null;


    /**
     * Creates a new {@link PowerEditPlugin}.
     * @param editor
     *  The plugin's editor.
     * @param settings
     *  The plugin's settings.
     */
    constructor(editor: DiagramViewEditor, settings: PowerEditPluginSettings) {
        super();
        this.mover = null;
        this.editor = editor;
        this.settings = settings;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Hover Interactions  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Tests if the plugin can handle a hover event.
     * @returns
     *  True if the plugin can handle the event, false otherwise.
     */
    public canHandleHover(): boolean {
        return true;
    }

    /**
     * Hover start logic.
     * @param x
     *  The cursor's current x-coordinate.
     * @param y
     *  The cursor's current y-coordinate.
     * @param event
     *  The mouse event.
     */
    public handleHoverStart(x: number, y: number, event: MouseEvent): void {
        const s = this.smartHover(x, y, event);
        if (this.selection === s) {
            return undefined;
        }
        let hoverTarget = s;
        if (s instanceof AnchorView) {
            hoverTarget = s.latches.find(o => o.parent?.focused) ?? s;
        }
        this.hover(hoverTarget);
        this.selection = s;
    }

    /**
     * Returns the topmost object at the specified coordinate.
     * @param x
     *  The x coordinate.
     * @param y
     *  The y coordinate.
     * @param event
     *  The mouse event.
     * @returns
     *  The topmost object.
     */
    protected smartHover(x: number, y: number, event: MouseEvent): DiagramObjectView | undefined {
        let selection: DiagramObjectView | undefined;
        const lines = this.editor.file.canvas.lines;
        const blocks = this.editor.file.canvas.blocks;
        let object: DiagramObjectView | undefined;
        // Evaluate blocks first
        for (let i = blocks.length - 1; 0 <= i; i--) {
            if (object = blocks[i].getObjectAt(x, y)) {
                return object;
            }
        }
        // Evaluate lines second
        for (let i = lines.length - 1; 0 <= i; i--) {
            if (object = lines[i].getObjectAt(x, y)) {
                return object;
            }
        }
        // TODO: Delete
        // for(let i = objects.length - 1; 0 <= i; i--) {
        //     let object = objects[i].getObjectAt(x, y);
        //     if(!object) {
        //         continue;
        //     }
        //     // If line...
        //     if(object instanceof LineView) {
        //         // ...hold selection and skip to next object
        //         selection = object.getObjectAt(x, y);
        //         continue;
        //     }
        //     // If anchor...
        //     if(object instanceof AnchorView) {
        //         // ...return anchor immediately
        //         return object;
        //     }
        //     // Otherwise, return the held selection or the object
        //     return selection ?? object;
        // }
        // return selection;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Selection Interactions  ////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Tests if the plugin can handle a selection.
     * @returns
     *  True if the plugin can handle the event, false otherwise.
     */
    public canHandleSelection(): boolean {
        return true;
    }

    /**
     * Selection start logic.
     * @returns
     *  True if control should be transferred back to the interface, false
     *  otherwise. If true, subsequent drag events will directly manipulate the
     *  view instead of the plugin's selection (`handleSelectDrag()` and
     *  `handleSelectEnd()` will not be invoked).
     */
    protected handleSelectStart(event: MouseEvent): boolean {
        if (this.selection instanceof AnchorView) {
            this.mover = this.handleAnchor(this.selection, event);
        } else if (this.selection instanceof BlockView) {
            this.mover = this.handleBlock(this.selection, event);
        } else if (this.selection instanceof HandleView) {
            this.mover = this.handleHandle(this.selection, event);
        } else if (this.selection instanceof LatchView) {
            this.mover = this.handleLatch(this.selection, event);
        } else if (this.selection instanceof LineView) {
            this.mover = this.handleLine(this.selection, event);
        } else {
            this.select(undefined, event);
            return true;
        }
        this.mover.captureSubject();
        // TODO: Start stream command
        return false;
    }

    /**
     * Handles an anchor selection.
     * @param anchor
     *  The selected anchor.
     * @param event
     *  The select event.
     * @returns
     *  The anchor's mover.
     */
    private handleAnchor(anchor: AnchorView, event: MouseEvent): ObjectMover {
        const editor = this.editor;
        const { factory, lineTemplate } = this.settings;
        // Select all latches
        if (event.ctrlKey) {
            const latches = [...anchor.latches];
            const { unselectAllObjects, selectObject } = EditorCommands;
            editor.execute(unselectAllObjects(this.editor));
            for (const latch of latches) {
                editor.execute(selectObject(this.editor, latch.parent!));
            }
        }
        // Move selected latches
        const latches = anchor.latches.filter(o => o.parent?.focused);
        if (latches.length) {
            // Hover top latch
            this.hover(latches[latches.length - 1]);
            // Return mover
            return new LatchMover(this, latches);
        }
        // Create line
        else {
            const canvas = this.editor.file.canvas;
            const line = factory.createNewDiagramObject(lineTemplate, LineView);
            // Configure line
            const { addObjectToGroup, attachLatchToAnchor, moveObjectsTo } = EditorCommands;
            editor.execute(addObjectToGroup(line, canvas));
            editor.execute(moveObjectsTo([line.source, line.target], anchor.x, anchor.y));
            editor.execute(attachLatchToAnchor(line.source, anchor));
            // Return mover
            return this.handleLatch(line.target, event);
        }
    }

    /**
     * Handles a block selection.
     * @param block
     *  The selected block.
     * @param event
     *  The select event.
     * @returns
     *  The block's mover.
     */
    private handleBlock(block: BlockView, event: MouseEvent): ObjectMover {
        let o: DiagramObjectView[];
        // Select line
        this.select(block, event);
        // Get all selected objects
        o = [...traverse(this.editor.file.canvas, o => o.focused)];
        // Get implicit selection
        o = findImplicitSelection(o) as DiagramObjectView[];
        // Return mover
        if (o[0] instanceof BlockView && o.length === 1) {
            return new BlockMover(this, o[0]);
        } else {
            return new GenericMover(this, o);
        }
    }

    /**
     * Handles a handle selection.
     * @param handle
     *  The selected handle.
     * @param event
     *  The select event.
     * @returns
     *  The handle's mover.
     */
    private handleHandle(handle: HandleView, event: MouseEvent): ObjectMover {
        // Select parent
        if (handle.parent && !handle.parent.focused) {
            this.select(handle.parent, event);
        }
        // Return mover
        return new GenericMover(this, [handle]);
    }

    /**
     * Handles a latch selection.
     * @param latch
     *  The selected latch.
     * @param event
     *  The select event.
     * @returns
     *  The latch's mover.
     */
    private handleLatch(latch: LatchView, event: MouseEvent): ObjectMover {
        // Select parent
        this.hover(latch);
        if (latch.parent && !latch.parent.focused) {
            this.select(latch.parent, event);
        }
        // Return mover
        return new LatchMover(this, [latch]);
    }

    /**
     * Handles a line selection.
     * @param line
     *  The selected line.
     * @param event
     *  The select event.
     * @returns
     *  The line's mover.
     */
    private handleLine(line: LineView, event: MouseEvent): ObjectMover {
        let o: DiagramObjectView[];
        // Select line
        this.select(line, event);
        // Get all selected objects
        o = [...traverse(this.editor.file.canvas, o => o.focused)];
        // Get implicit selection
        o = findImplicitSelection(o) as DiagramObjectView[];
        // Return mover
        return new GenericMover(this, o);
    }

    /**
     * Selection drag logic.
     * @param track
     *  The subject track.
     * @param event
     *  The mouse event.
     */
    protected handleSelectDrag(track: SubjectTrack, event: MouseEvent): void {
        this.mover!.moveSubject(track);
    }

    /**
     * Selection end logic.
     * @param event
     *  The mouse event.
     */
    protected handleSelectEnd(event: MouseEvent): void {
        this.mover!.releaseSubject();
        this.mover = null;
        // TODO: End stream command
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Selection Interactions  ////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Sets the current select.
     * @param obj
     *  The object being selected.
     * @param event
     *  The mouse event.
     */
    protected select(obj: DiagramObjectView | undefined, event: MouseEvent) {
        // Update selection
        if (!obj?.focused && !event.ctrlKey) {
            this.editor.execute(EditorCommands.unselectAllObjects(this.editor));
        }
        if (obj) {
            this.editor.execute(EditorCommands.selectObject(this.editor, obj));
        }
    }

    /**
     * Sets the current hover.
     * @param obj
     *  The object being hovered.
     */
    protected hover(obj: DiagramObjectView | undefined) {
        this.editor.execute(EditorCommands.clearHover(this.editor.file.canvas));
        if (obj) {
            // Hover object
            this.editor.execute(EditorCommands.hoverObject(obj, true));
            // Set cursor
            const cursor = PowerEditPlugin.CursorMap[obj.constructor.name];
            this.setCursor(cursor ? cursor(obj) : Cursor.NotAllowed);
        } else {
            // Set cursor
            this.setCursor(Cursor.Default);
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  3. Interface Controls  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Sets the interface's cursor.
     * @param cursor
     *  The cursor
     */
    public setCursor(cursor: Cursor) {
        this.editor.interface.emit("cursor-change", cursor);
    }

    /**
     * Requests suggestions.
     * @param object
     *  The active target.
     */
    public requestSuggestions(object: DiagramObjectView) {
        this.editor.interface.emit("suggestion-request", object);
    }

}

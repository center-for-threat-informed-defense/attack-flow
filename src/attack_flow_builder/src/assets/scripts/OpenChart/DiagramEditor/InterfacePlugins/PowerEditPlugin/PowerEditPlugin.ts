import * as EditorCommands from "../../Commands";
import { Crypto, wasHotkeyActive } from "@OpenChart/Utilities";
import { findImplicitSelection, traverse } from "@OpenChart/DiagramModel";
import { BlockMover, GenericMover, LatchMover } from "./ObjectMovers";
import { Cursor, DiagramInterfacePlugin, SubjectTrack } from "@OpenChart/DiagramInterface";
import { AnchorView, BlockView, HandleView, LatchView, LineView, Orientation } from "@OpenChart/DiagramView";
import type { CursorMap } from "./CursorMap";
import type { ObjectMover } from "./ObjectMovers";
import type { CommandExecutor } from "./CommandExecutor";
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
     * The plugin's active command stream identifier.
     */
    private stream: string | null;


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
        this.stream = null;
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
        this.hover(c => this.editor.execute(c), hoverTarget);
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
        const stream = Crypto.randomUUID();
        // Configure executor
        const execute = (cmd: EditorCommands.SynchronousEditorCommand) => {
            this.editor.execute(cmd, stream);
        };
        // Initiate command stream
        this.editor.beginCommandStream(stream);
        // Handle selection
        if (this.selection instanceof AnchorView) {
            this.mover = this.handleAnchor(execute, this.selection, event);
        } else if (this.selection instanceof BlockView) {
            this.mover = this.handleBlock(execute, this.selection, event);
        } else if (this.selection instanceof HandleView) {
            this.mover = this.handleHandle(execute, this.selection, event);
        } else if (this.selection instanceof LatchView) {
            this.mover = this.handleLatch(execute, this.selection, event);
        } else if (this.selection instanceof LineView) {
            this.mover = this.handleLine(execute, this.selection, event);
        } else {
            this.select(execute, undefined, event);
            this.editor.endCommandStream(stream);
            return true;
        }
        this.mover.captureSubject();
        this.stream = stream;
        return false;
    }

    /**
     * Handles an anchor selection.
     * @param execute
     *  The current command executor.
     * @param anchor
     *  The selected anchor.
     * @param event
     *  The select event.
     * @returns
     *  The anchor's mover.
     */
    private handleAnchor(
        execute: CommandExecutor, anchor: AnchorView, event: MouseEvent
    ): ObjectMover {
        const { factory, lineTemplate } = this.settings;
        // Select all latches
        if (event.ctrlKey) {
            const latches = [...anchor.latches];
            const { unselectAllObjects, selectObject } = EditorCommands;
            execute(unselectAllObjects(this.editor));
            for (const latch of latches) {
                execute(selectObject(this.editor, latch.parent!));
            }
        }
        // Move selected latches
        const latches = anchor.latches.filter(o => o.parent?.focused);
        if (latches.length) {
            // Hover top latch
            this.hover(execute, latches[latches.length - 1]);
            // Return mover
            return new LatchMover(this, execute, latches);
        }
        // Otherwise, create line
        else {
            const canvas = this.editor.file.canvas;
            const line = factory.createNewDiagramObject(lineTemplate, LineView);
            // Configure line
            const { addObjectToGroup, attachLatchToAnchor, moveObjectsTo } = EditorCommands;
            execute(addObjectToGroup(line, canvas));
            execute(moveObjectsTo([line.source, line.target], anchor.x, anchor.y));
            execute(attachLatchToAnchor(line.source, anchor));
            // Return mover
            return this.handleLatch(execute, line.target, event);
        }
    }

    /**
     * Handles a block selection.
     * @param execute
     *  The current command executor.
     * @param block
     *  The selected block.
     * @param event
     *  The select event.
     * @returns
     *  The block's mover.
     */
    private handleBlock(
        execute: CommandExecutor, block: BlockView, event: MouseEvent
    ): ObjectMover {
        let o: DiagramObjectView[];
        // Select line
        this.select(execute, block, event);
        // Get all selected objects
        o = [...traverse(this.editor.file.canvas, o => o.focused)];
        // Get implicit selection
        o = findImplicitSelection(o) as DiagramObjectView[];
        // Return mover
        if (o[0] instanceof BlockView && o.length === 1) {
            return new BlockMover(this, execute, o[0]);
        } else {
            return new GenericMover(this, execute, o);
        }
    }

    /**
     * Handles a handle selection.
     * @param execute
     *  The current command executor.
     * @param handle
     *  The selected handle.
     * @param event
     *  The select event.
     * @returns
     *  The handle's mover.
     */
    private handleHandle(
        execute: CommandExecutor, handle: HandleView, event: MouseEvent
    ): ObjectMover {
        // Select parent
        if (handle.parent && !handle.parent.focused) {
            this.select(execute, handle.parent, event);
        }
        // Return mover
        return new GenericMover(this, execute, [handle]);
    }

    /**
     * Handles a latch selection.
     * @param execute
     *  The current command executor.
     * @param latch
     *  The selected latch.
     * @param event
     *  The select event.
     * @returns
     *  The latch's mover.
     */
    private handleLatch(
        execute: CommandExecutor, latch: LatchView, event: MouseEvent
    ): ObjectMover {
        // Select parent
        this.hover(execute, latch);
        if (latch.parent && !latch.parent.focused) {
            this.select(execute, latch.parent, event);
        }
        // Return mover
        return new LatchMover(this, execute, [latch]);
    }

    /**
     * Handles a line selection.
     * @param execute
     *  The current command executor.
     * @param line
     *  The selected line.
     * @param event
     *  The select event.
     * @returns
     *  The line's mover.
     */
    private handleLine(
        execute: CommandExecutor, line: LineView, event: MouseEvent
    ): ObjectMover {
        let o: DiagramObjectView[];
        // Select line
        this.select(execute, line, event);
        // Get all selected objects
        o = [...traverse(this.editor.file.canvas, o => o.focused)];
        // Get implicit selection
        o = findImplicitSelection(o) as DiagramObjectView[];
        // Return mover
        return new GenericMover(this, execute, o);
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
        this.editor.endCommandStream(this.stream!);
        this.stream = null;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Selection Interactions  ////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Sets the current select.
     * @param execute
     *  The current command executor.
     * @param obj
     *  The object being selected.
     * @param event
     *  The mouse event.
     */
    protected select(
        execute: CommandExecutor, obj: DiagramObjectView | undefined, event: MouseEvent
    ) {
        // Update selection
        const multiSelect = wasHotkeyActive(event, this.settings.multiselectHotkey);
        if (!obj?.focused && !multiSelect) {
            execute(EditorCommands.unselectAllObjects(this.editor));
        }
        if (obj) {
            execute(EditorCommands.selectObject(this.editor, obj));
        }
    }

    /**
     * Sets the current hover.
     * @param execute
     *  The current command executor.
     * @param obj
     *  The object being hovered.
     */
    protected hover(
        execute: CommandExecutor, obj: DiagramObjectView | undefined
    ) {
        execute(EditorCommands.clearHover(this.editor.file.canvas));
        if (obj) {
            // Hover object
            execute(EditorCommands.hoverObject(obj, true));
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

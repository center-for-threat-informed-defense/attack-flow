import * as EditorCommands from "../../../Commands";
import { LineView } from "@OpenChart/DiagramView";
import { ObjectMover } from "./ObjectMover";
import { Alignment, BoundingBox, CanvasView, GroupView } from "@OpenChart/DiagramView";
import type { BlockView } from "@OpenChart/DiagramView";
import type { SubjectTrack } from "@OpenChart/DiagramInterface";
import type { PowerEditPlugin } from "../PowerEditPlugin";
import type { CommandExecutor } from "../CommandExecutor";

export class BlockMover extends ObjectMover {

    /**
     * The mover's block.
     */
    private block: BlockView;

    /**
     * The mover's alignment.
     */
    private alignment: number;

    /**
     * The mover's lines.
     */
    private lines: Map<string, LineView>;


    /**
     * Creates a new {@link ObjectMover}.
     * @param plugin
     *  The mover's plugin.
     * @param execute
     *  The mover's command executor.
     * @param block
     *  The mover's block.
     */
    constructor(
        plugin: PowerEditPlugin,
        execute: CommandExecutor,
        block: BlockView
    ) {
        super(plugin, execute);
        this.lines = new Map();
        this.block = block;
        this.alignment = block.alignment;
    }


    /**
     * Captures the subject.
     */
    public captureSubject(): void {}

    /**
     * Moves the subject.
     * @param track
     *  The subject's track.
     */
    public moveSubject(track: SubjectTrack): void {
        const editor = this.plugin.editor;
        const canvas = editor.file.canvas;
        const { moveObjectsBy, userSetObjectPosition } = EditorCommands;
        // Get distance
        let delta;
        if (this.alignment === Alignment.Grid) {
            delta = track.getDistanceOnGrid(canvas.grid);
        } else {
            delta = track.getDistance();
        }
        // Move
        if(delta[0] + delta[1]) {
            if(!this.block.userSetPosition) {
                this.execute(userSetObjectPosition(this.block))
            }
            this.execute(moveObjectsBy(this.block, ...delta));
        }
        // Update overlap
        this.updateOverlap(canvas);
        // Apply delta
        track.applyDelta(delta);
    }

    /**
     * Updates the line overlap.
     * @param group
     *  The group to evaluate.
     */
    protected updateOverlap(group: CanvasView | GroupView) {
        const objects = group.objects;
        const bb: BoundingBox = this.block.face.boundingBox;
        for (const object of objects) {
            if (
                object instanceof LineView &&
                object.sourceObject !== this.block &&
                object.targetObject !== this.block &&
                (object.sourceObject || object.targetObject)
            ) {
                this.selectLine(object, object.overlaps(bb));
            }
            if (object instanceof GroupView) {
                this.updateOverlap(object);
            }
        }
    }

    /**
     * Selects a line.
     * @param line
     *  The line to select.
     * @param value
     *  The line's select state.
     */
    public selectLine(line: LineView, value: boolean) {
        const editor = this.plugin.editor;
        if (line.focused === value) {
            return;
        }
        const { selectObject, unselectObject } = EditorCommands;
        if (value) {
            this.lines.set(line.instance, line);
            this.execute(selectObject(editor, line));
        } else {
            this.lines.delete(line.instance);
            this.execute(unselectObject(editor, line));
        }
    }

    /**
     * Releases the subject from movement.
     */
    public releaseSubject(): void {
        const { routeLinesThroughBlock, selectObject, unselectAllObjects } = EditorCommands;
        const editor = this.plugin.editor;
        const canvas = editor.file.canvas;
        const block = this.block;
        const lines = [...this.lines.values()];
        if(lines.length) {
            this.execute(routeLinesThroughBlock(canvas, block, lines));
            this.execute(unselectAllObjects(editor));
            this.execute(selectObject(editor, this.block));
        }
    }

}

import * as EditorCommands from "../../../Commands";
import { ObjectMover } from "./ObjectMover";
import { Alignment, AnchorView, GroupView } from "@OpenChart/DiagramView";
import type { SubjectTrack } from "@OpenChart/DiagramInterface";
import type { PowerEditPlugin } from "../PowerEditPlugin";
import type { CanvasView, DiagramObjectView, LatchView } from "@OpenChart/DiagramView";

export class LatchMover extends ObjectMover {

    /**
     * The mover's leader latch.
     */
    private leader: LatchView;

    /**
     * The mover's latches.
     */
    private latches: LatchView[];

    /**
     * The mover's alignment.
     */
    private alignment: number;


    /**
     * Creates a new {@link LatchMover}.
     * @param plugin
     *  The mover's plugin.
     * @param latches
     *  The latches to move.
     * @param newLine
     *  Whether the latch is 
     */
    constructor(plugin: PowerEditPlugin, latches: LatchView[]) {
        super(plugin);
        this.leader = latches[0];
        this.latches = latches;
        this.alignment = this.latches.some(
            o => o.alignment === Alignment.Grid
        ) ? Alignment.Grid : Alignment.Free;
    }
    
    
    /**
     * Captures the subject.
     */
    public captureSubject(): void {};

    /**
     * Moves the subject.
     * @param track
     *  The subject's track.
     */
    public moveSubject(track: SubjectTrack): void {
        const editor = this.plugin.editor;
        const canvas = editor.file.canvas;
        // Get target
        let delta = track.getDistance();
        const target = this.getBlocksAndAnchorsAt(
            this.leader.x + delta[0],
            this.leader.y + delta[1],
            canvas
        );
        // Update hover
        editor.execute(EditorCommands.clearHover(canvas));
        if(target) {
            editor.execute(EditorCommands.hoverObject(target, true));
        }
        // Update distance, if necessary 
        if(this.alignment === Alignment.Grid) {
            delta = track.getDistanceOnGrid(canvas.grid);
        }
        // Attach latch
        if(target instanceof AnchorView) {
            delta = track.getDistanceOntoObject(target, this.leader);
            this.linkLatches(target);
        } else {
            this.unlinkLatches();
        }
        // Move object
        const { moveObjectsBy } = EditorCommands;
        editor.execute(moveObjectsBy(this.latches, delta[0], delta[1]));
        // Apply delta
        track.applyDelta(delta);
    }

    /**
     * Releases the subject from movement.
     */
    public releaseSubject(): void {
        const l = this.latches;
        if(l.length === 1 && !l[0].isLinked()) {
            // this.plugin.requestSuggestions(l[0]);
        }
    }

    /**
     * Links the mover's latches.
     * @param anchor
     *  The anchor to link the latches to.
     */
    private linkLatches(anchor: AnchorView) {
        const editor = this.plugin.editor;
        const { attachLatchToAnchor } = EditorCommands;
        for(const latch of this.latches) {
            if(!latch.isLinked(anchor)) {
                editor.execute(attachLatchToAnchor(latch, anchor));
            }
        }
    }

    /**
     * Unlinks the mover's latches.
     */
    private unlinkLatches() {
        const editor = this.plugin.editor;
        const { detachLatchFromAnchor } = EditorCommands;
        for(const latch of this.latches) {
            if(latch.isLinked()) {
                editor.execute(detachLatchFromAnchor(latch));
            }
        }
    }

    /**
     * Returns the topmost block or anchor at the specified coordinate.
     * @param x
     *  The x coordinate.
     * @param y
     *  The y coordinate.
     * @param group
     *  The group to evaluate.
     *  (Default: The interface's canvas.)
     * @returns
     *  The topmost block or anchor, undefined if there isn't one.
     */
    private getBlocksAndAnchorsAt(
        x: number, y: number,
        group: CanvasView | GroupView
    ): DiagramObjectView | undefined {
        const objects = group.blocks;
        for(let i = objects.length - 1; 0 <= i; i--) {
            let object: DiagramObjectView | undefined = objects[i];
            if(object instanceof GroupView) {
                object = this.getBlocksAndAnchorsAt(x, y, object);
            } else {
                object = object.getObjectAt(x, y);
            }
            if(object) {
                return object;
            }
        }
        return undefined;
    }
    
}

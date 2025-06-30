import * as EditorCommands from "../../../Commands";
import { Alignment } from "@OpenChart/DiagramView";
import { ObjectMover } from "./ObjectMover";
import type { SubjectTrack } from "@OpenChart/DiagramInterface";
import type { PowerEditPlugin } from "../PowerEditPlugin";
import type { DiagramObjectView } from "@OpenChart/DiagramView";
import type { CommandExecutor } from "../CommandExecutor";

export class GenericMover extends ObjectMover {

    /**
     * The mover's objects.
     */
    private objects: DiagramObjectView[];

    /**
     * The mover's alignment.
     */
    private alignment: number;


    /**
     * Creates a new {@link ObjectMover}.
     * @param plugin
     *  The mover's plugin.
     * @param execute
     *  The mover's command executor.
     * @param objects
     *  The mover's objects.
     */
    constructor(
        plugin: PowerEditPlugin,
        executor: CommandExecutor,
        objects: DiagramObjectView[]
    ) {
        super(plugin, executor);
        this.objects = objects;
        this.alignment = this.objects.some(
            o => o.alignment === Alignment.Grid
        ) ? Alignment.Grid : Alignment.Free;
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
        if(delta[0] | delta[1]) {
            for(const object of this.objects) {
                if(!object.userSetPosition) {
                    this.execute(userSetObjectPosition(object));
                }
            }
            this.execute(moveObjectsBy(this.objects, ...delta));
        }
        // Apply delta
        track.applyDelta(delta);
    }

    /**
     * Releases the subject from movement.
     */
    public releaseSubject(): void {}

}

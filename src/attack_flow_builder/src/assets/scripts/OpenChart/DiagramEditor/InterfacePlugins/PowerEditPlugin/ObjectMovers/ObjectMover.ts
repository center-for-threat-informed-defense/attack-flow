import type { SubjectTrack } from "@OpenChart/DiagramInterface";
import type { PowerEditPlugin } from "../PowerEditPlugin";

export abstract class ObjectMover {

    /**
     * The mover's plugin.
     */
    protected plugin: PowerEditPlugin;


    /**
     * Creates a new {@link ObjectMover}.
     * @param plugin
     *  The mover's plugin.
     * @param execute
     *  The mover's command executor.
     */
    constructor(plugin: PowerEditPlugin) {
        this.plugin = plugin;
    }

    
    /**
     * Captures the subject.
     */
    public abstract captureSubject(): void;

    /**
     * Moves the subject.
     * @param track
     *  The subject's track.
     */
    public abstract moveSubject(track: SubjectTrack): void;

    /**
     * Releases the subjects.
     */
    public abstract releaseSubject(): void;

}

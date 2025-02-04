import { GroupCommand } from "./GroupCommand";
import { AddObject } from "./AddObject";
import {
    Alignment,
    DiagramObjectModel,
    round
} from "@/assets/scripts/BlockDiagram";
import type { ApplicationStore } from "@/stores/Stores/ApplicationStore";

export class SpawnObject extends GroupCommand {

    /**
     * Spawns a new object.
     * @param context
     *  The application context.
     * @param parent
     *  The parent object.
     * @param template
     *  The object's template.
     */
    constructor(
        context: ApplicationStore,
        parent: DiagramObjectModel,
        template: string
    );

    /**
     * Spawns a new object.
     * @param context
     *  The application context.
     * @param parent
     *  The parent object.
     * @param template
     *  The object's template.
     * @param x
     *  The object's x-coordinate relative to the viewport.
     * @param y
     *  The object's y-coordinate relative to the viewport.
     */
    constructor(
        context: ApplicationStore,
        parent: DiagramObjectModel,
        template: string,
        x: number,
        y: number
    );
    constructor(
        context: ApplicationStore,
        parent: DiagramObjectModel,
        template: string,
        x?: number,
        y?: number
    ) {
        super();
        const editor = context.activePage;
        // Create object
        const object = parent.factory.createObject(template);
        // Move object
        const view = editor.view;
        if (x === undefined) {
            // Position in center of screen
            x = Math.round(((view.w / 2) - view.x) / view.k);
        } else {
            // Position left-side of object at x
            const { xMid, xMin } = object.boundingBox;
            x = ((x - view.x) / view.k) + xMid - xMin;
        }
        if (y === undefined) {
            // Position in middle of screen
            y = Math.round(((view.h / 2) - view.y) / view.k);
        } else {
            // Position top-side of object at y
            const { yMid, yMin } = object.boundingBox;
            y = ((y - view.y) / view.k) + yMid - yMin;
        }
        if (object.getAlignment() === Alignment.Grid) {
            // If aligned to grid, snap x and y
            x = round(x, editor.page.grid[0]);
            y = round(y, editor.page.grid[1]);
        }
        object.moveTo(x, y);
        // Add object
        this.add(new AddObject(object, parent));
    }

}

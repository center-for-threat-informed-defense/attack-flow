import type { DiagramObjectExport } from "./DiagramObjectExport";

export type DiagramExport = {

    /**
     * The schema's identifier.
     */
    schema: string;

    /**
     * The diagram's objects.
     */
    objects: DiagramObjectExport[];

};

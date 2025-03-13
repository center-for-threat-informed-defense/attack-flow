import type { DiagramObjectExport } from "./DiagramObjectSerializer";

export type DiagramModelExport = {

    /**
     * The diagram's schema.
     */
    schema: string;

    /**
     * The diagram's objects.
     */
    objects: DiagramObjectExport[];

};

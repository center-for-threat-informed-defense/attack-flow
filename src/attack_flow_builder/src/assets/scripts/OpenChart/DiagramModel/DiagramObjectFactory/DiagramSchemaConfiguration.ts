import type { CanvasTemplate, DiagramObjectTemplate } from "./DiagramObjectTemplate";

export type DiagramSchemaConfiguration = {

    /**
     * The schema's identifier.
     */
    id: string;

    /**
     * The schema's canvas template.
     */
    canvas: CanvasTemplate;

    /**
     * The schema's object templates.
     */
    templates: DiagramObjectTemplate[];

};

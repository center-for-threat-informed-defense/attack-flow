import type { DiagramObjectTemplate } from "./DiagramObjectTemplate";

export type DiagramSchemaConfiguration = {

    /**
     * The schema's identifier.
     */
    id: string;

    /**
     * The page template's identifier.
     */
    page_template: string;

    /**
     * The schema's object templates.
     */
    templates: DiagramObjectTemplate[];

};

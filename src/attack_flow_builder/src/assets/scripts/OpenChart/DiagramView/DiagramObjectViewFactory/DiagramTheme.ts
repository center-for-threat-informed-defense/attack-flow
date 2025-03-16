import type { FaceDesign } from "./FaceDesign";

export type DiagramTheme = {

    /**
     * The theme's identifier.
     */
    id: string;

    /**
     * The theme's name.
     */
    name: string;

    /**
     * The theme's grid.
     */
    grid: [number, number];

    /**
     * The theme's subgrid scale.
     */
    subgrid: number;

    /**
     * The theme's designs.
     */
    designs: {

        [key: string]: FaceDesign;

    };

};

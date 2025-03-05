import type { FaceDesign } from "./FaceDesign";
import type { CanvasStyle } from "./CanvasStyle";

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
     * The theme's canvas style.
     */
    canvas: CanvasStyle;

    /**
     * The theme's face designs.
     */
    faces: {

        [key: string]: FaceDesign;

    };

};

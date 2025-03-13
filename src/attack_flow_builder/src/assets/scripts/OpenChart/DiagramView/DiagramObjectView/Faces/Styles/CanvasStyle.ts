export type CanvasStyle = {

    /**
     * The canvas's background color.
     */
    backgroundColor: string;

    /**
     * The canvas's grid color.
     */
    gridColor: string;

    /**
     * The canvas's drop shadow.
     */
    dropShadow: {

        /**
         * The shadow's color.
         */
        color: string;

        /**
         * The shadow's offset.
         */
        offset: [number, number];

    };

};

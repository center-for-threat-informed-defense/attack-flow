export type AutomaticLayoutOptions = {

    /**
     * Whether to optimize the branch element ordering.
     */
    optimizeOrder: boolean;

    /**
     * Whether to optimize the placement of line latches.
     */
    optimizeLines: boolean;

    /**
     * The layout algorithm to use.
     */
    layoutAlgorithm: "simple" | "advanced",

    /**
     * The number of units to space elements apart.
     */
    spacing: number;

}

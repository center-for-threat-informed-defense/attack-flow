import { DiagramObject } from "../OpenChart/DiagramModel"

export type SearchResult<T extends DiagramObject = DiagramObject> = {

    /**
     * The search result's index.
     */
    index: number;

    /**
     * The total number of results.
     */
    length: number;

    /**
     * The search result.
     */
    object: T;

};
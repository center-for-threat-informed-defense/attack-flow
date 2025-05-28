import { unsignedMod } from "@OpenChart/Utilities";
import {
    Block, DateProperty, DiagramObject, DictionaryProperty,
    EnumProperty, FloatProperty, IntProperty, ListProperty,
    Property, RootProperty, StringProperty, traverse
} from "@OpenChart/DiagramModel";
import type { SearchResult } from "./SearchResult";
import type { DiagramModelEditor } from "@OpenChart/DiagramEditor/index.model";

export class OpenChartFinder<
    E extends DiagramModelEditor = DiagramModelEditor,
    T extends DiagramObject = DiagramObject
> {

    /**
     * The finder's active editor.
     */
    private _editor: E | null;

    /**
     * The finder's search results.
     */
    private results: Array<T>;

    /**
     * The finder's current index.
     */
    private index: number;


    /**
     * The finder's active editor.
     */
    public get editor(): E | null {
        return this._editor;
    }

    /**
     * The current search result.
     */
    public get result(): SearchResult<T> | null {
        if (this.results.length === 0) {
            return null;
        } else {
            return {
                index: this.index,
                length: this.results.length,
                object: this.results[this.index]
            };
        }
    }

    /**
     * Whether the finder has search results.
     */
    public get hasResults(): boolean {
        return 0 < this.results.length;
    }


    /**
     * Creates a {@link Finder}.
     */
    constructor() {
        this._editor = null;
        this.results = [];
        this.index = 0;
    }


    /**
     * Execute a search to find matching blocks in the diagram.
     * @param editor
     *  The diagram's editor.
     * @param query
     *  The string to search for.
     */
    public search(editor: E, query: string) {
        this._editor = editor;
        const searchFilter = (o: DiagramObject) => o instanceof Block;
        // Resolve active result
        const activeResult = this.result?.object ?? null;
        // Clear search
        this.index = 0;
        this.results = [];
        // Don't run empty queries.
        if (query.trim() === "") {
            return null;
        }
        // Cast query to lowercase
        query = query.toLowerCase();
        // Update results
        const canvas = editor.file.canvas as unknown as T;
        for (const block of traverse<T>(canvas, searchFilter)) {
            if (this.objectMatchesQuery(block, query)) {
                this.results.push(block);
                // If the active result (from the previous query) exists in the
                // new results set, keep it active.
                if (activeResult !== null && block.id === activeResult.id) {
                    this.index = this.results.length - 1;
                }
            }
        }
    }

    /**
     * Advance to the next result.
     *
     * After the last result, this loops back to the first result. If there are no results, does nothing.
     */
    public moveToNextResult() {
        if (this.hasResults) {
            this.index = unsignedMod(this.index + 1, this.results.length);
        }
    }

    /**
     * Move to the previous result.
     *
     * If currently on the first result, then loops around to the last result. If there are no results, does
     * nothing.
     */
    public movetoPreviousResult() {
        if (this.hasResults) {
            this.index = unsignedMod(this.index - 1, this.results.length);
        }
    }

    /**
     * Checks if a diagram object should be included in the result set.
     * @param object
     *  The object.
     * @param query
     *  The query string.
     * @returns
     *  True if the node satisfies the query, false otherwise.
     */
    private objectMatchesQuery(node: T, query: string): boolean {
        return this.propMatchesQuery(node.properties, query);
    }

    /**
     * Recursively checks if a property matches a query.
     * @param property
     *  The property.
     * @param query
     *  The query string.
     * @returns
     *  True if the property satisfies the query, false otherwise.
     */
    private propMatchesQuery(property: Property, query: string): boolean {
        const type = property.constructor.name;
        switch (type) {
            case IntProperty.name:
                // Falls through
            case FloatProperty.name:
                // Falls through
            case StringProperty.name:
                // Falls through
            case DateProperty.name:
                // Falls through
            case EnumProperty.name:
                return property.toString().toLowerCase().includes(query);
            case ListProperty.name:
                // Falls through
            case RootProperty.name:
                // Falls through
            case DictionaryProperty.name:
                for (const p of (property as DictionaryProperty).value.values()) {
                    if (this.propMatchesQuery(p, query)) {
                        return true;
                    }
                }
                return false;
            default:
                throw new Error(`Unexpected property type: '${type}'`);
        }
    }

}

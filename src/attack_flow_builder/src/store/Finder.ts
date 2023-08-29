import { DiagramObjectModel, DictionaryBlockModel, Property } from "@/assets/scripts/BlockDiagram";
import * as Prop from "@/assets/scripts/BlockDiagram/Property";
import { PropertyType } from "@/assets/scripts/BlockDiagram/Property/PropertyDescriptorTypes";
import { PageEditor } from "./PageEditor";

export interface FindResult {
    totalResults: number;
    index: number;
    diagramObject: DiagramObjectModel;
}

export class Finder {

    /**
     * True if the find dialog is currently displayed.
     */
    public dialogIsVisible: boolean;

    private currentIndex: number;
    private results: Array<DiagramObjectModel>;

    /**
     * Creates a {@link Finder}.
     */
    constructor() {
        this.dialogIsVisible = false;
        this.currentIndex = 0;
        this.results = [];
    }

    /**
     * Execute a query to find matching blocks in the diagram.
     * @param editor
     *  The page editor.
     * @param query
     *  The string to search for.
     */
    public runQuery(editor: PageEditor, query: string) {
        const currentDiagramObject = this.results.length > 0 ? this.results[this.currentIndex] : null;
        this.currentIndex = 0;
        this.results = [];
        const nodeFilter = (o: DiagramObjectModel) => o instanceof DictionaryBlockModel;
        query = query.toLowerCase();

        // Don't run empty queries.
        if (query.trim() === "") {
            return null;
        }

        for (const node of editor.page.getSubtree(nodeFilter)) {
            if (this.nodeMatchesQuery(node, query)) {
                this.results.push(node);

                // If the selected object from the previous query exists in the new result set, then make sure
                // it is still the selected object in the new result set, even if its index changed.
                if (currentDiagramObject !== null && node.id === currentDiagramObject.id) {
                    this.currentIndex = this.results.length - 1;
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
        if (this.results.length > 0) {
            this.currentIndex = (this.currentIndex + 1) % this.results.length;
        }
    }

    /**
     * Move to the previous result. 
     *
     * If currently on the first result, then loops around to the last result. If there are no results, does
     * nothing.
     */
    public movetoPreviousResult() {
        if (this.results.length > 0) {
            this.currentIndex = (this.currentIndex + this.results.length - 1) % this.results.length;
        }
    }

    /**
     * Get the current result.
     * @returns
     *  A result.
     */
    public getCurrentResult(): FindResult | null {
        if (this.results.length === 0) {
            return null;
        } else {
            return {
                totalResults: this.results.length,
                index: this.currentIndex,
                diagramObject: this.results[this.currentIndex],
            };
        }
    }

    /**
     * Check if a node should be included in the result set.
     * @param node
     *  A candidate node
     * @param query
     *  A query string
     * @returns
     *  True if the node satisfies the query
     */
    private nodeMatchesQuery(node: DiagramObjectModel, query: string): boolean {
        return this.propMatchesQuery(node.props, query);
    }
       
    /**
     * Recursively heck if a property matches a query.
     * @param prop
     *  A property of a candidate node
     * @param query
     *  A query string
     * @returns
     *  True if the property satisfies the query
     */
    private propMatchesQuery(prop: Property, query: string): boolean {
        switch (prop.type) {
            case PropertyType.Int: // falls through
            case PropertyType.Float: // falls through
            case PropertyType.String: // falls through
            case PropertyType.Date: // falls through
            case PropertyType.Enum: // falls through
                // These types match if the string representation includes the query string (case
                // insensitive).
                return prop.toString().toLowerCase().includes(query);
            case PropertyType.List: // falls through
            case PropertyType.Dictionary:
                // A list or dictionary match if any of its values match.
                for (const innerProp of (prop as Prop.DictionaryProperty).value.values()) {
                    if (this.propMatchesQuery(innerProp, query)) {
                        return true;
                    }
                }
                return false;
            default:
                throw new Error(`Unexpected property type: ${prop.type}`)
        }
    }
}

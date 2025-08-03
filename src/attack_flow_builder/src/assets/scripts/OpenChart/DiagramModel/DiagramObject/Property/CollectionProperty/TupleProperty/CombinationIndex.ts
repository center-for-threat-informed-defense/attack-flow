import type { ValueCombinations } from "./ValueCombinations";

export class CombinationIndex {

    /**
     * The properties and values registered with the index.
     */
    private props: Map<string, Set<string>>;

    /**
     * The value / index map.
     */
    private values: Map<string, number>;

    /**
     * The relationship lookup table.
     */
    private lookup: number[][];


    /**
     * Creates a new {@link CombinationIndex}.
     * @param combos
     *  The index's set of value combinations.
     */
    constructor(combos: ValueCombinations) {
        this.props = new Map();
        this.values = new Map<string, number>();
        this.lookup = [];
        for (const [prop1, value1, prop2, value2] of combos) {
            const valueId1 = `${prop1}.${value1}`;
            const valueId2 = `${prop2}.${value2}`;
            // Register properties and values
            if (!this.props.has(prop1)) {
                this.props.set(prop1, new Set());
            }
            if (!this.props.has(prop2)) {
                this.props.set(prop2, new Set());
            }
            this.props.get(prop1)!.add(value1);
            this.props.get(prop2)!.add(value2);
            // Map values to index
            if (!this.values.has(valueId1)) {
                this.values.set(valueId1, this.values.size);
                this.lookup.push([]);
            }
            if (!this.values.has(valueId2)) {
                this.values.set(valueId2, this.values.size);
                this.lookup.push([]);
            }
            // Map relationships
            const idx1 = this.values.get(valueId1)!;
            const idx2 = this.values.get(valueId2)!;
            this.lookup[idx1].push(idx2);
            this.lookup[idx2].push(idx1);
        }
    }


    /**
     * Gets the valid set of options for each registered file.
     * @param values
     *  The currently set property values in the form [property, value].
     * @returns
     *  The valid set of options for each registered property.
     */
    public getValidOptions(values?: Map<string, string>): ReadonlyMap<string, ReadonlySet<string>> {
        // If no values...
        if (!values || values.size === 0) {
            // ...return all registered values
            return this.props;
        }
        // Otherwise...
        const idxToId = [...this.values.keys()];
        // Construct results matrix
        const matrix = new Map<string, Set<string>[]>(
            [...this.props.keys()].map(
                f => [f, new Array(values.size).fill(new Set())]
            )
        );
        let i = 0;
        for (const [prop, value] of new Map(values)) {
            // Add complete set of values to results matrix
            matrix.get(prop)![i] = this.props.get(prop) ?? new Set();
            // Look up its relationships
            const valueId = `${prop}.${value}`;
            if (!this.values.has(valueId)) {
                continue;
            }
            // Add relationships to results matrix
            const valueIdx = this.values.get(valueId)!;
            for (const rel of this.lookup[valueIdx]) {
                const [prop, value] = idxToId[rel].split(/\./g);
                matrix.get(prop)![i].add(value);
            }
            i++;
        }
        // Intersect results
        const results = new Map([...matrix].map(
            ([prop, sets]) => [prop, this.intersection(sets)]
        ));
        // Return results
        return results;
    }

    /**
     * Performs intersection on an array of sets.
     * @param sets
     *  The sets.
     * @returns
     *  The sets intersection.
     */
    private intersection<T>(sets: Set<T>[]): Set<T> {
        let result = sets[0] ?? new Set();
        for (let i = 1; i < sets.length; i++) {
            result = new Set([...result].filter(e => sets[i].has(e)));
        }
        return result;
    }

}

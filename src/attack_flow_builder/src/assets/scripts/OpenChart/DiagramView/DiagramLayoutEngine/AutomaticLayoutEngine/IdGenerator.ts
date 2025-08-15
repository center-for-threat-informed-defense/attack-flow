export class IdGenerator {

    /**
     * The generator's id counter.
     */
    private _id: number;


    /**
     * Creates a new {@link IdGenerator}.
     */
    constructor() {
        this._id = 0;
    }


    /**
     * Returns a unique identifier.
     */
    public next(): string {
        return `${ this._id++ }`;
    }

}

export type Enumeration = {

    /**
     * The items to include.
     */
    include: Set<string>;

    /**
     * The items to exclude.
     */
    exclude?: Set<string>;

} & {

    /**
     * The items to include.
     */
    include?: Set<string>;

    /**
     * The items to exclude.
     */
    exclude: Set<string>;

}

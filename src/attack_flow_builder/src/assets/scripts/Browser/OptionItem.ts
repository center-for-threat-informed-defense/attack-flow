export type OptionItem<T> = {

    /**
     * The option's value.
     */
    value: T;

    /**
     * The option's text.
     */
    text: string;

    /**
     * Whether the options is highlighted or not.
     */
    feature?: boolean;

}

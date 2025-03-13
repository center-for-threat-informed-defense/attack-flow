import type { DiagramTheme } from "../DiagramViewSchema";

export abstract class ThemeSource {

    /**
     * The theme's id.
     */
    public readonly id: string;

    /**
     * The theme's name.
     */
    public name: string;


    /**
     * Creates a new {@link ThemeSource}.
     * @param id
     *  The theme's id.
     * @param name
     *  The theme's name.
     */
    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }


    /**
     * Returns the theme.
     * @returns
     *  A Promise that resolves with the theme.
     */
    abstract getTheme(): Promise<DiagramTheme>;

}

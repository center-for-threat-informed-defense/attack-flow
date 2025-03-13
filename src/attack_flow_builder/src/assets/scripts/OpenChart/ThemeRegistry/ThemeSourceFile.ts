import { ThemeSource } from "./ThemeSource";
import { ThemeLoader } from "../ThemeLoader";
import type { DiagramTheme } from "../DiagramViewSchema";
import type { DiagramThemeConfiguration } from "../ThemeLoader";

export class ThemeSourceFile extends ThemeSource {

    /**
     * The theme's configuration file.
     */
    private readonly file: DiagramThemeConfiguration;


    /**
     * Creates a {@link ThemeSourceFile}.
     * @param file
     *  The theme's configuration file.
     */
    constructor(file: DiagramThemeConfiguration) {
        super(file.id, file.name);
        this.file = file;
    }


    /**
     * Returns the theme.
     * @returns
     *  A Promise that resolves with the theme.
     */
    override async getTheme(): Promise<DiagramTheme> {
        return await ThemeLoader.load(this.file);
    }

}

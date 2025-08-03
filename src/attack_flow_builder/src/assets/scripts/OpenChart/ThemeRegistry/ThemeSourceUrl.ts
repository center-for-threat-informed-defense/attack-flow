import { ThemeSource } from "./ThemeSource";
import { ThemeLoader } from "../ThemeLoader";
import type { DiagramTheme } from "../DiagramView";
import type { DiagramThemeConfiguration } from "../ThemeLoader";

export class ThemeSourceUrl extends ThemeSource {

    /**
     * The theme's url.
     */
    private readonly url: string;

    /**
     * The theme's file.
     */
    private file: DiagramThemeConfiguration | undefined;


    /**
     * Creates a {@link ThemeSourceUrl}.
     * @param id
     *  The theme's id.
     * @param name
     *  The theme's name.
     * @param url
     *  The theme's url.
     */
    constructor(id: string, name: string, url: string) {
        super(id, name);
        this.url = `${import.meta.env.BASE_URL}${url}`;
    }


    /**
     * Returns the theme.
     * @returns
     *  A Promise that resolves with the theme.
     */
    async getTheme(): Promise<DiagramTheme> {
        if (this.file === undefined) {
            try {
                this.file = await (await fetch(this.url)).json() as DiagramThemeConfiguration;
                this.name = this.file.name;
            } catch (_err) {
                throw new Error(`Failed to download theme '${this.url}'.`);
            }
            if (this.id !== this.file.id) {
                const dl = this.file.id;
                const ex = this.id;
                throw new Error(`Downloaded theme '${dl}', expected '${ex}'.`);
            }
        }
        return await ThemeLoader.load(this.file);
    }

}

import type { ThemeSource } from "./ThemeSource";
import type { DiagramTheme } from "../DiagramView";

export class ThemeRegistry {

    /**
     * The theme registry.
     */
    private registry: Map<string, ThemeSource>;


    /**
     * Creates a new {@link ThemeRegistry}.
     */
    constructor(themes?: ThemeSource[]);

    /**
     * Creates a new {@link ThemeRegistry}.
     * @param themes
     *  The registry's themes.
     */
    constructor(themes?: ThemeSource[]);
    constructor(themes?: ThemeSource[]) {
        this.registry = new Map();
        for (const theme of themes ?? []) {
            this.registerTheme(theme);
        }
    }


    /**
     * Registers a theme.
     * @param source
     *  The theme's source.
     */
    public registerTheme(source: ThemeSource) {
        this.registry.set(source.id, source);
    }

    /**
     * Deregisters a theme, if it exists.
     * @param id
     *  The theme's id.
     * @returns
     *  True if the theme was removed, false otherwise.
     */
    public deregisterTheme(id: string): boolean {
        return this.registry.delete(id);
    }

    /**
     * Lists the registered themes.
     * @returns
     *  The registered themes.
     */
    public listThemes(): { id: string, name: string }[] {
        return [...this.registry.values()]
            .map(t => ({ id: t.id, name: t.name }));
    }

    /**
     * Returns a registered {@link DiagramTheme}.
     * @param id
     *  The theme's id.
     */
    public async getTheme(id: string): Promise<DiagramTheme> {
        const source = this.registry.get(id);
        if (!source) {
            throw new Error(`Registry has no theme '${id}'.`);
        }
        return await source.getTheme();
    }

}

import { GlobalFontStore } from "../Utilities";
import type { FontDescriptor } from "../Utilities";
import type { DiagramThemeConfiguration } from "./ThemeConfigurations";
import type { CanvasStyle, DiagramTheme, FaceDesign } from "../DiagramViewAuthority";

export class ThemeLoader {

    /**
     * Instantiates a {@link DiagramTheme}.
     * @param theme
     *  The theme's configuration.
     * @returns
     *  A Promise that resolves with a {@link DiagramTheme}.
     */
    public static async load(theme: DiagramThemeConfiguration): Promise<DiagramTheme> {
        // Compile canvas
        const canvas = await this.processConfiguration(theme.canvas);
        // Compile faces
        const faces = new Map<string, FaceDesign>();
        for (const template in theme.faces) {
            const design = theme.faces[template];
            const convert = await this.processConfiguration(design);
            faces.set(template, convert as unknown as FaceDesign);
        }
        // Return theme
        return {
            id: theme.id,
            name: theme.name,
            canvas: canvas as unknown as CanvasStyle,
            faces: Object.fromEntries([...faces.entries()])
        };
    }

    /**
     * Processes a configuration object.
     * @remarks
     *  This method:
     *   - Recursively switches all object keys from snake_case to camelCase.
     *   - Replaces all {@link FontDescriptor}s with font constructs.
     * @param obj
     *  The configuration object.
     * @returns
     *  The processed object.
     */
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    private static async processConfiguration(obj: Record<string, any>): Promise<Record<string, any>> {
        // If font descriptor...
        if (this.isFontDescriptor(obj)) {
            await GlobalFontStore.loadFont(obj);
            return GlobalFontStore.getFont(obj);
        }
        // If ordinary object...
        const cast = new Map();
        for (const key in obj) {
            let value = obj[key];
            if (typeof value === "object" && !Array.isArray(value)) {
                value = await this.processConfiguration(value);
            }
            cast.set(this.toCamelCase(key), value);
        }
        return Object.fromEntries([...cast.entries()]);
    }

    /**
     * Tests if an object can be cast to a {@link FontDescriptor}.
     * @param obj
     *  The object.
     * @returns
     *  True if the object can be cast, false otherwise.
     */
    private static isFontDescriptor(obj: object): obj is FontDescriptor {
        if ("size" in obj && "family" in obj) {
            const s1 = typeof obj.size === "string";
            const s2 = typeof obj.family === "string";
            return s1 && s2;
        } else {
            return false;
        }
    }

    /**
     * Converts a string from snake_case to camelCase.
     * @param str
     *  The string to convert.
     * @returns
     *  The converted string.
     */
    private static toCamelCase(str: string): string {
        const words = str.split(/_/g);
        let camel = words[0];
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            camel += `${word[0].toLocaleUpperCase()}${word.substring(1)}`;
        }
        return camel;
    }

}

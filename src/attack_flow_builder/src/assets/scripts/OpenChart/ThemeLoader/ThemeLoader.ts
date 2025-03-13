/* eslint-disable @typescript-eslint/no-explicit-any */
import { GlobalFontStore } from "@OpenChart/Utilities";
import type { FontDescriptor } from "@OpenChart/Utilities";
import type { DiagramTheme, FaceDesign } from "@OpenChart/DiagramView";
import type { DiagramThemeConfiguration } from "./ThemeConfigurations";

export class ThemeLoader {

    /**
     * Instantiates a {@link DiagramTheme}.
     * @param theme
     *  The theme's configuration.
     * @returns
     *  A Promise that resolves with a {@link DiagramTheme}.
     */
    public static async load(theme: DiagramThemeConfiguration): Promise<DiagramTheme> {
        // Compile designs
        const designs = new Map<string, FaceDesign>();
        for (const template in theme.designs) {
            const convert = this.keysToCamelCase(theme.designs[template]);
            await this.transformFontDescriptors(convert);
            designs.set(template, convert as unknown as FaceDesign);
        }
        // Return theme
        return {
            id: theme.id,
            name: theme.name,
            designs: Object.fromEntries([...designs.entries()])
        };
    }

    /**
     * Instantiates a {@link DiagramTheme}.
     * @remarks
     *  This function synchronously transforms `FontDescriptors` into `Fonts`
     *  using whichever `Fonts` are currently available from the global font
     *  store. Any encountered `FontDescriptor` not preloaded into the store
     *  will be replaced with the store's default `Font`.
     * @param theme
     *  The theme's configuration.
     * @returns
     *  The {@link DiagramTheme}.
     */
    public static unsafeLoad(theme: DiagramThemeConfiguration): DiagramTheme {
        // Compile designs
        const designs = new Map<string, FaceDesign>();
        for (const template in theme.designs) {
            const convert = this.keysToCamelCase(theme.designs[template]);
            this.transformFontDescriptorsDangerously(convert);
            designs.set(template, convert as unknown as FaceDesign);
        }
        // Return theme
        return {
            id: theme.id,
            name: theme.name,
            designs: Object.fromEntries([...designs.entries()])
        };
    }

    /**
     * Transforms an object's {@link FontDescriptor}s into {@link Font}s.
     * @param obj
     *  The object to convert.
     */
    private static async transformFontDescriptors(obj: Record<string, any>): Promise<void> {
        for(const key in obj) {
            let value = obj[key];
            // Ignore primitives and arrays
            if(typeof value !== "object" || Array.isArray(value)) {
                continue;
            }
            // Convert font descriptors
            if(this.isFontDescriptor(value)) {
                await GlobalFontStore.loadFont(value);
                obj[key] = GlobalFontStore.getFont(value);
                continue;
            }
            // Recursively convert sub-objects
            await this.transformFontDescriptors(value);
        }
    }

    /**
     * Transforms an object's {@link FontDescriptor}s into `Fonts`.
     * @remarks
     *  This function synchronously transforms `FontDescriptors` into `Fonts`
     *  using whichever `Fonts` are currently available from the global font
     *  store. Any encountered `FontDescriptor` not preloaded into the store
     *  will be replaced with the store's default `Font`.
     * @param obj
     *  The object to convert.
     */
    private static async transformFontDescriptorsDangerously(obj: Record<string, any>) {
        for(const key in obj) {
            let value = obj[key];
            // Ignore primitives and arrays
            if(typeof value !== "object" || Array.isArray(value)) {
                continue;
            }
            // Convert font descriptors
            if(this.isFontDescriptor(value)) {
                obj[key] = GlobalFontStore.getFont(value);
                continue;
            }
            // Recursively convert sub-objects
            this.transformFontDescriptorsDangerously(value);
        }
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
     * Transforms the keys of `object` from snake_case to camelCase.
     * @param object
     *  The object to transform.
     * @returns
     *  The transformed object.
     */
    private static keysToCamelCase(object: Record<string, any>): Record<string, any> {
        const cast = new Map();
        for (const key in object) {
            // Resolve value
            let value = object[key];
            if (typeof value === "object" && !Array.isArray(value)) {
                value = this.keysToCamelCase(value);
            }
            // Assign key / value
            cast.set(this.toCamelCase(key), value);
        }
        // Return object
        return Object.fromEntries([...cast.entries()]);
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

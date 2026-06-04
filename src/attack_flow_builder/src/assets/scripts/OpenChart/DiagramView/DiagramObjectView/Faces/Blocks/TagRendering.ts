import { DictionaryProperty, ListProperty, MultiSelectProperty, type Property } from "@OpenChart/DiagramModel";
import type { DiagramObjectView } from "../../Views";

const DEFAULT_TAG_COLOR = "#cccccc";

export type ResolvedTag = {
    id: string;
    name: string;
    color: string;
};

/**
 * Resolves the selected tag ids on a view into renderable tag objects.
 * @param view
 *  The view whose selected tags should be resolved.
 * @returns
 *  The selected tags with normalized id, name, and color values.
 */
export function resolveSelectedTags(view: DiagramObjectView): ResolvedTag[] {
    const property = view.properties.value.get("tags");
    if (!(property instanceof MultiSelectProperty) || !property.isDefined()) {
        return [];
    }

    const canvasTags = getCanvasTags(view);
    const tags: ResolvedTag[] = [];

    for (const tagId of property.values) {
        const tag = canvasTags.get(tagId);
        if (tag) {
            tags.push(tag);
        }
    }

    return tags;
}

/**
 * Computes a stable hash for the rendered tag content.
 * @param tags
 *  The resolved tags to hash.
 * @returns
 *  A hash derived from each tag's id, name, and color.
 */
export function getResolvedTagsHash(tags: ResolvedTag[]): number {
    return computeHash(tags.map(tag => `${tag.id}:${tag.name}:${tag.color}`).join("."));
}

/**
 * Retrieves the canvas-level tag definitions available to descendant views.
 * @param view
 *  The view from which to walk to the root canvas.
 * @returns
 *  A map of tag identifiers to resolved tag data.
 */
function getCanvasTags(view: DiagramObjectView): Map<string, ResolvedTag> {
    let root = view;
    while (root.parent) {
        root = root.parent;
    }

    const tagsProperty = root.properties.value.get("tags");
    if (!(tagsProperty instanceof ListProperty)) {
        return new Map();
    }

    const tags = new Map<string, ResolvedTag>();
    for (const [id, tagProperty] of tagsProperty.value) {
        const tag = resolveTagProperty(id, tagProperty);
        if (tag) {
            tags.set(id, tag);
            tags.set(tag.id, tag);
        }
    }
    return tags;
}

/**
 * Resolves a single tag property from either a diagram-model property or a
 * plain object shape.
 * @param fallbackId
 *  The id to use if the tag does not define one explicitly.
 * @param property
 *  The candidate tag property.
 * @returns
 *  The normalized tag, or undefined if it cannot be resolved.
 */
function resolveTagProperty(fallbackId: string, property: Property | unknown): ResolvedTag | undefined {
    if (property instanceof DictionaryProperty) {
        return buildTag(
            fallbackId,
            property.value.get("id")?.toJson(),
            property.value.get("name")?.toString() ?? property.value.get("text")?.toString(),
            property.value.get("color")?.toString()
        );
    }

    if (property && typeof property === "object") {
        const record = property as Record<string, unknown>;
        return buildTag(fallbackId, record.id, record.name ?? record.text, record.color);
    }

    return undefined;
}

/**
 * Builds a normalized renderable tag from raw field values.
 * @param fallbackId
 *  The id to use when no explicit tag id is available.
 * @param idValue
 *  The raw id value.
 * @param nameValue
 *  The raw display-name value.
 * @param colorValue
 *  The raw color value.
 * @returns
 *  The normalized tag, or undefined if no usable name is present.
 */
function buildTag(
    fallbackId: string,
    idValue: unknown,
    nameValue: unknown,
    colorValue: unknown
): ResolvedTag | undefined {
    const name = stringify(nameValue).trim();
    if (!name) {
        return undefined;
    }

    return {
        id: stringify(idValue).trim() || fallbackId,
        name,
        color: stringify(colorValue).trim() || DEFAULT_TAG_COLOR
    };
}

/**
 * Converts a primitive value into a displayable string.
 * @param value
 *  The value to convert.
 * @returns
 *  A string form for supported primitive values, or an empty string.
 */
function stringify(value: unknown): string {
    switch (typeof value) {
        case "string":
            return value;
        case "number":
        case "boolean":
            return `${value}`;
        default:
            return "";
    }
}

/**
 * Returns the most legible tag text color for a given tag background.
 * @param backgroundColor
 *  The tag pill's background color.
 * @returns
 *  Black or white, whichever has higher contrast.
 */
export function getTagTextColor(backgroundColor: string): "#000000" | "#ffffff" {
    const rgb = parseHexColor(backgroundColor);
    if (!rgb) {
        return "#ffffff";
    }

    const backgroundLuminance = getRelativeLuminance(...rgb);
    const blackContrast = getContrastRatio(backgroundLuminance, 0);
    const whiteContrast = getContrastRatio(backgroundLuminance, 1);

    return blackContrast >= whiteContrast ? "#000000" : "#ffffff";
}

function parseHexColor(color: string): [number, number, number] | undefined {
    const normalized = color.trim().replace(/^#/, "");
    if (normalized.length === 3 || normalized.length === 4) {
        const rgb: [number, number, number] = [
            Number.parseInt(`${normalized[0]}${normalized[0]}`, 16),
            Number.parseInt(`${normalized[1]}${normalized[1]}`, 16),
            Number.parseInt(`${normalized[2]}${normalized[2]}`, 16)
        ];
        return rgb.some(channel => Number.isNaN(channel)) ? undefined : rgb;
    }

    if (normalized.length === 6 || normalized.length === 8) {
        const rgb: [number, number, number] = [
            Number.parseInt(normalized.slice(0, 2), 16),
            Number.parseInt(normalized.slice(2, 4), 16),
            Number.parseInt(normalized.slice(4, 6), 16)
        ];
        return rgb.some(channel => Number.isNaN(channel)) ? undefined : rgb;
    }

    return undefined;
}

function getRelativeLuminance(red: number, green: number, blue: number): number {
    const channels = [red, green, blue].map(channel => {
        const normalized = channel / 255;
        if (normalized <= 0.03928) {
            return normalized / 12.92;
        }
        return ((normalized + 0.055) / 1.055) ** 2.4;
    });

    return (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
}

function getContrastRatio(first: number, second: number): number {
    const lighter = Math.max(first, second);
    const darker = Math.min(first, second);
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Computes a deterministic 32-bit hash for a string.
 * @param string
 *  The string to hash.
 * @returns
 *  The computed hash value.
 */
function computeHash(string: string): number {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        hash = ((hash << 5) - hash) + string.charCodeAt(i);
        hash |= 0;
    }
    return hash;
}

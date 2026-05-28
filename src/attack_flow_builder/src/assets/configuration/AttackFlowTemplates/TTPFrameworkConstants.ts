export type FrameworkEntry = [code: string, label: string];
export type TTPLabelKind = "tactic" | "technique";

export const TTP_FRAMEWORKS: FrameworkEntry[] = [
    ["ENT", "MITRE ATT&CK Enterprise (ENT)"],
    ["MOB", "MITRE ATT&CK Mobile (MOB)"],
    ["ICS", "MITRE ATT&CK ICS (ICS)"],
    ["ATL", "MITRE ATLAS (ATL)"],
    ["D3F", "MITRE D3FEND (D3F)"],
    ["F3", "MITRE F3 (F3)"]
];

export const FRAMEWORK_LABELS = new Map<string, string>(TTP_FRAMEWORKS);

export const frameworkFullName = (code?: string) => {
    if (!code) { return undefined; }
    const label = FRAMEWORK_LABELS.get(code);
    if (!label) { return code; }
    return label;
};

// For example: /^\[(ENT|MOB|ICS|ATL|D3F|F3)\]/
export const TTP_FRAMEWORK_REGEX: RegExp = new RegExp(
    `^\\[(${TTP_FRAMEWORKS.map(([code]) => code).join("|")})\\]`
);

const TTP_LABEL_PREFIX_REGEX = /^\[[^\]]+\]\s*/;

const TTP_NAME_REGEXES: Record<TTPLabelKind, RegExp[]> = {
    tactic: [
        /^(?:AML\.)?TA\d+\s+(.+)$/,
        /^F3\.[A-Z]{1,2}\d+(?:\.\d+)*\s+(.+)$/
    ],
    technique: [
        /^(?:AML\.)?T\d+(?:\.\d+)*\s+(.+)$/,
        /^D3F?-[A-Z0-9.-]+\s+(.+)$/,
        /^F3\.[A-Z]{1,2}\d+(?:\.\d+)*\s+(.+)$/
    ]
};

/**
 * Converts a TTP option label to its display name.
 * @param text
 *  The TTP option label.
 * @param kind
 *  The TTP label kind.
 * @returns
 *  The TTP display name.
 */
export function getTTPNameFromLabel(text: string, kind: TTPLabelKind): string {
    const strippedText = text.replace(TTP_LABEL_PREFIX_REGEX, "");
    for (const regex of TTP_NAME_REGEXES[kind]) {
        const match = strippedText.match(regex);
        if (match) {
            return match[1].trim();
        }
    }
    return strippedText.trim();
}

/**
 * Converts a tactic option label to its display name.
 * @param text
 *  The tactic option label.
 * @returns
 *  The tactic display name.
 */
export function getTacticNameFromLabel(text: string): string {
    return getTTPNameFromLabel(text, "tactic");
}

/**
 * Converts a technique option label to its display name.
 * @param text
 *  The technique option label.
 * @returns
 *  The technique display name.
 */
export function getTechniqueNameFromLabel(text: string): string {
    return getTTPNameFromLabel(text, "technique");
}

/**
 * Get the domain code from a tactic or technique option label.
 * @param text The option label.
 * @returns The domain code or an empty string.
 */
export function getDomainCodeFromLabel(text: string): string {
    if (!text) { return ""; }
    const m = text.match(TTP_FRAMEWORK_REGEX);
    return m?.[1] || "";
}

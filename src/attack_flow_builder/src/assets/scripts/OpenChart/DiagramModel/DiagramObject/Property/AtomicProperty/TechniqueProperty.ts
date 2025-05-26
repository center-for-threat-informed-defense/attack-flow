import { Property } from "..";
import { MD5 } from "@OpenChart/Utilities";
import type { JsonValue } from "..";
import { StringProperty } from "../AtomicProperty/StringProperty";
import { CollectionProperty } from "../CollectionProperty/CollectionProperty";

interface TacticDetail {
    id: string;
    name: string;
    matrix: string;
    stixId?: string;
    techniques?: string[];
}

interface TechniqueDetail {
    id: string;
    name: string;
    matrix: string;
    stixId?: string;
    tactics?: string[];
}

interface TechniqueValue {
    tacticId: string | null;
    techniqueId: string | null;
}

interface TechniquePropertyDescriptor {
    tacticDetails: TacticDetail[];
    techniqueDetails: TechniqueDetail[];
}

/**
 * The TechniqueProperty class represents a property whose value is of type TechniqueValue.
 * It extends the base Property class and is built using a TechniquePropertyDescriptor.
 */
export class TechniqueProperty extends Property {
    /**
     * The property's descriptor.
     */
    public readonly descriptor: TechniquePropertyDescriptor;

    public techniqueValue: StringProperty;
    public tacticValue: StringProperty;

    public tacticDetailsKeyed: Record<string, TacticDetail>;
    public techniqueDetailsKeyed: Record<string, TechniqueDetail>;

    private tacticName: string | null | undefined;
    private tacticStixId: string | null | undefined;
    private techniqueName: string | null | undefined;
    private techniqueStixId: string | null | undefined;

    /**
     * The property's value, stored as TechniqueValue.
     */
    private _value: TechniqueValue | null;

    /**
     * Creates a new {@link TechniqueProperty}.
     * @param id - The property's id.
     * @param editable - Whether the property is editable.
     * @param descriptor - The property's descriptor.
     * @param value - The property's value.
     */
    constructor(
        id: string,
        editable: boolean,
        descriptor: TechniquePropertyDescriptor,
        value?: any
    ) {
        super(id, editable);
        this.descriptor = descriptor;

        this.tacticDetailsKeyed = this.convertToKeyableObject(
            this.descriptor.tacticDetails,
            "id"
        );
        this.techniqueDetailsKeyed = this.convertToKeyableObject(
            this.descriptor.techniqueDetails,
            "id"
        );

        // Get sorted tactic and technique options
        const tacticOptions = this.getSortedTactics(value?.techniqueId);
        const techniqueOptions = this.getSortedTechniques(value?.tacticId);

        this.tacticValue = new StringProperty("tactic", true, tacticOptions);
        this.techniqueValue = new StringProperty("technique", true, techniqueOptions);
        this._value = null;

        if (!value) {
            this.setValue({
                tactic: null,
                technique: null
            });
        } else {
            this.setValue({
                tactic: this.tacticDetailsKeyed[value.tacticId]
                    ? this.formatDetails(value.tacticId, "tactic")
                    : value.tacticId,
                technique: this.techniqueDetailsKeyed[value.techniqueId]
                    ? this.formatDetails(value.techniqueId, "technique")
                    : value.techniqueId
            });
        }
    }

    private convertToKeyableObject<T extends TacticDetail | TechniqueDetail>(
        detailsArray: T[] | undefined,
        key: keyof T
    ): Record<string, T> {
        const keyableObject: Record<string, T> = {};

        if (detailsArray) {
            detailsArray.forEach((detail) => {
                if (detail[key] !== undefined && detail[key] !== null) {
                    keyableObject[detail[key] as string] = detail;
                }
            });
        }

        return keyableObject;
    }

    public getSortedTechniques(selectedTactic: string | null): string[] {
        if (!this.techniqueDetailsKeyed || !this.tacticDetailsKeyed) {
            return [];
        }

        const techniques = Object.values(this.techniqueDetailsKeyed).map(
            (technique) => {
                const lastHyphenIndex = technique.name.lastIndexOf(" - ");
                const formattedName =
                    lastHyphenIndex !== -1
                        ? technique.name.substring(lastHyphenIndex + 3)
                        : technique.name;
                return `${technique.id}: ${formattedName} - ${technique.matrix.replace(" ATT&CK", "")}`;
            }
        );

        const sortTechniques = (a: string, b: string) => {
            const idA = a.split(":")[0];
            const idB = b.split(":")[0];
            const isSubA = idA.includes(".");
            const isSubB = idB.includes(".");
            const parentA = isSubA ? idA.split(".")[0] : idA;
            const parentB = isSubB ? idB.split(".")[0] : idB;

            if (parentA !== parentB) {
                return parentA.localeCompare(parentB, undefined, { numeric: true });
            }
            return idA.localeCompare(idB, undefined, { numeric: true });
        };

        if (selectedTactic) {
            const parsed = this.parseInput(selectedTactic);
            if (!parsed) { return techniques.sort(sortTechniques); }

            const tacticObj = this.tacticDetailsKeyed[parsed.id];
            if (
                !tacticObj ||
                tacticObj.name !== parsed.name ||
                !tacticObj.techniques
            ) {
                return techniques.sort(sortTechniques);
            }

            const relatedTechniques = tacticObj.techniques
                .map((techniqueId) => this.techniqueDetailsKeyed[techniqueId])
                .filter((technique) => technique !== undefined)
                .map((technique) => {
                    const lastHyphenIndex = technique!.name.lastIndexOf(" - ");
                    const formattedName =
                        lastHyphenIndex !== -1
                            ? technique!.name.substring(lastHyphenIndex + 3)
                            : technique!.name;
                    return `${technique!.id}: ${formattedName} - ${technique!.matrix.replace(" ATT&CK", "")}`;
                })
                .sort(sortTechniques);

            const otherTechniques = techniques.filter((technique) => {
                const parsedTechnique = this.parseInput(technique);
                return (
                    !parsedTechnique ||
                    !tacticObj.techniques?.includes(parsedTechnique.id)
                );
            }).sort(sortTechniques);

            return [...relatedTechniques, ...otherTechniques];
        }

        return techniques.sort(sortTechniques);
    }

    public getSortedTactics(selectedTechnique: string | null): string[] {
        if (!this.techniqueDetailsKeyed || !this.tacticDetailsKeyed) {
            return [];
        }

        const tactics = Object.values(this.tacticDetailsKeyed).map((tactic) => {
            const lastHyphenIndex = tactic.name.lastIndexOf(" - ");
            const formattedName =
                lastHyphenIndex !== -1
                    ? tactic.name.substring(lastHyphenIndex + 3)
                    : tactic.name;
            return `${tactic.id}: ${formattedName} - ${tactic.matrix.replace(" ATT&CK", "")}`;
        });

        if (selectedTechnique) {
            const parsed = this.parseInput(selectedTechnique);
            if (!parsed) { return tactics.sort(); }

            const techniqueObj = this.techniqueDetailsKeyed[parsed.id];
            if (
                !techniqueObj ||
                techniqueObj.name !== parsed.name ||
                !techniqueObj.tactics
            ) {
                return tactics.sort();
            }

            const relatedTactics = techniqueObj.tactics
                .map((tacticId) => this.tacticDetailsKeyed[tacticId])
                .filter((tactic) => tactic !== undefined)
                .map((tactic) => {
                    const lastHyphenIndex = tactic!.name.lastIndexOf(" - ");
                    const formattedName =
                        lastHyphenIndex !== -1
                            ? tactic!.name.substring(lastHyphenIndex + 3)
                            : tactic!.name;
                    return `${tactic!.id}: ${formattedName} - ${tactic!.matrix.replace(" ATT&CK", "")}`;
                });

            const otherTactics = tactics.filter((tactic) => {
                const parsedTactic = this.parseInput(tactic);
                return (
                    !parsedTactic || !techniqueObj.tactics?.includes(parsedTactic.id)
                );
            });

            return [...relatedTactics.sort(), ...otherTactics.sort()];
        }

        return tactics.sort();
    }

    private formatDetails(id: string, type: "tactic" | "technique"): string {
        const details =
            type === "technique"
                ? this.techniqueDetailsKeyed[id]
                : this.tacticDetailsKeyed[id];

        if (details) {
            const lastHyphenIndex = details.name.lastIndexOf(" - ");
            const formattedName =
                lastHyphenIndex !== -1
                    ? details.name.substring(lastHyphenIndex + 3)
                    : details.name;
            return `${details.id}: ${formattedName} - ${details.matrix.replace(" ATT&CK", "")}`;
        }

        return "";
    }

    private parseInput(input: string): { id: string, name: string } | null {
        const match = input.match(/^([^:]+):\s*([^\-]+)(?:\s*-\s*.*)?$/);
        if (!match || !match[1] || !match[2]) { return null; }
        return { id: match[1].trim(), name: match[2].trim() };
    }

    public isDefined(): boolean {
        return this._value !== null;
    }

    /**
     * Sets the property's value.
     * @param value - The new value.
     */
    public setValue(value: Record<string, any>): void {
        this.setDataFromIds(value);
        const tacticOptions = this.getSortedTactics(value?.technique);
        const techniqueOptions = this.getSortedTechniques(value?.tactic);

        if (this.techniqueValue !== undefined) {
            this.techniqueValue.suggestions = techniqueOptions;
            this.techniqueValue.setValue(value?.technique);
        }

        if (this.tacticValue !== undefined) {
            this.tacticValue.suggestions = tacticOptions;
            this.tacticValue.setValue(value?.tactic);
        }

        this.updateParentProperty();
    }

    setBadgeTitle(value: string) {
        if (!value) { return null; }

        const suffixes = ["- Mobile", "- ICS", "- Enterprise"];
        const matchingSuffix = suffixes.find((suffix) => value.endsWith(suffix));

        if (matchingSuffix) {
            const fullWord = matchingSuffix.replace(/^-/, "").trim();
            return fullWord;
        }
        return null;
    }

    public setDataFromIds(value: Record<string, any> | null): void {
        const parsedTactic = this.parseInput(value?.tactic || "");
        const parsedTechnique = this.parseInput(value?.technique || "");

        const isValidTactic =
            parsedTactic && this.isValidTactic(parsedTactic.id, parsedTactic.name);
        const isValidTechnique =
            parsedTechnique &&
            this.isValidTechnique(parsedTechnique.id, parsedTechnique.name);

        this._value = {
            tacticId: isValidTactic ? parsedTactic.id : value?.tactic,
            techniqueId: isValidTechnique ? parsedTechnique.id : value?.technique
        };
        this.tacticName = isValidTactic ? parsedTactic.name : null;
        this.tacticStixId = isValidTactic
            ? this.tacticDetailsKeyed[parsedTactic.id]?.stixId ?? null
            : null;
        this.techniqueName = isValidTechnique ? parsedTechnique.name : null;
        this.techniqueStixId = isValidTechnique
            ? this.techniqueDetailsKeyed[parsedTechnique.id]?.stixId ?? null
            : null;
    }

    private isValidTactic(id: string, name: string): boolean {
        return this.tacticDetailsKeyed[id]?.name === name;
    }

    private isValidTechnique(id: string, name: string): boolean {
        return this.techniqueDetailsKeyed[id]?.name === name;
    }

    public toRawValue(): any | null {
        return this._value;
    }

    public toHashValue(): number {
        if (this._value === null) {
            return parseInt(MD5(""), 16);
        }
        const { tacticId, techniqueId } = this._value;
        return parseInt(MD5(`v:${tacticId}-${techniqueId}`), 16);
    }

    public toString(): string {
        if (this._value === null) {
            return "None";
        }
        return `Tactic: ${this.tacticName} (ID: ${this._value.tacticId}) / Technique: ${this.techniqueName} (ID: ${this._value.techniqueId})`;
    }

    /**
     * Updates the parent property with the current value.
     */
    protected updateParentProperty(): void {
        super.updateParentProperty();
    }

    /**
     * Returns the property's JSON value.
     * @returns The property's JSON value.
     */
    public toJson(): JsonValue {
        if (this._value === null) {
            return null;
        }
        return {
            tacticId: this._value.tacticId,
            techniqueId: this._value.techniqueId
        };
    }

    /**
     * Returns a clone of the property.
     * @param id The property's id.
     * @returns A clone of the property.
     */
    public clone(id: string = this.id): TechniqueProperty {
        const clone = new TechniqueProperty(id, this.isEditable, this.descriptor, this._value);
        return clone;
    }
}

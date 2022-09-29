/**
 * This script pre-computes a search index for ATT&CK data so that it
 * doesn't need to be recomputed on every run.
 */
import Fuse from 'fuse.js';
import fs from "fs";
import process from "process";
// import { fuseOptions } from "../src/search.js"; TODO
import { marked } from "marked";
import { convert } from 'html-to-text';

// TODO: move to another location
export const fuseOptions = {
    includeMatches: true,
    distance: 1000,
    threshold: 0.1,
    ignoreFieldNorm: true,
    minMatchCharLength: 3,
    keys: [
        {
            name: "id",
            weight: 3,
        },
        {
            name: "name",
            weight: 2,
        },
        {
            name: "description",
            weight: 1,
        },
    ],
}

interface StixDocument {
    objects: StixObject[];
}

interface StixObject {
    type: string;
    name: string;
    description?: string;
    external_references: any;
    x_mitre_domains: string[];
    x_mitre_is_subtechnique: boolean;
    x_mitre_deprecated: boolean;
    revoked: boolean;
    x_mitre_is_subattackObj: boolean;
}

enum AttackObjectType {
    Technique = "technique",
    Subtechnique = "subtechnique",
    Mitigation = "mitigation",
    Group = "group",
    Software = "software",
    DataSource = "data_source",
    Tactic = "tactic"
}

interface AttackObject {
    id: string;
    type: AttackObjectType;
    name: string;
    description: string;
    url: string;
    sourceName: string;
    isEnterprise: boolean;
    isIcs: boolean;
    isMobile: boolean;
    deprecated: boolean;
}


const inputFiles = [
    "data/enterprise-attack.json",
    "data/ics-attack.json",
    "data/mobile-attack.json",
];

// Note that attack-pattern is handled outside of this map, since it can
// be a technique or a subtechnique.
const stixTypeToAttackTypeMap: Record<string, AttackObjectType> = {
    "course-of-action": AttackObjectType.Mitigation,
    "intrusion-set": AttackObjectType.Group,
    "malware": AttackObjectType.Software,
    "tool": AttackObjectType.Software,
    "x-mitre-data-source": AttackObjectType.DataSource,
    "x-mitre-tactic": AttackObjectType.Tactic,
};

const mitreSources = {
    "mitre-attack": true,
    "mitre-ics-attack": true,
    "mitre-mobile-attack": true,
}

/**
 * Clean up the markup in ATT&CK text.
 *
 * @remarks
 * ATT&CK uses a combination of Markdown and HTML tags, so the easiest way to
 * clean it is to render the Markdown to HTML, then convert HTML back to plain
 * text. Older versions of ATT&CK may not be parsable as Markdown, so in that
 * case just return the original text.
 *
 * @param text - The text to clean up
 */
function cleanAttackText(text: string): string {
    const trimmed = text.trim();
    const html = marked.parse(text);
    return convert(html) ?? trimmed;
}

/**
 * Extract ATT&CK data needed for search index.
 *
 * @param stixObject - An object read from a STIX document
 * @returns An AttackObject parsed from the STIX object
 */
function extractAttackObject(stixObject: StixObject): AttackObject {
    // Name and description are taken from the top-level STIX object.
    const attackObj: Partial<AttackObject> = {
        name: stixObject.name,
        description: cleanAttackText(stixObject.description || ""),
    }

    // ID and URL are extracted from the first reference that is sourced to
    // MITRE.
    for (const reference of stixObject.external_references) {
        if (reference.sourceName in mitreSources) {
            attackObj.id = reference.external_id;
            attackObj.url = reference.url;
            break;
        }
    }

    // extract the ATT&CK matrix from the STIX object
    for (const mitreDomain of stixObject.x_mitre_domains) {
        switch (mitreDomain) {
            case "enterprise-attack":
                attackObj.isEnterprise = true;
                break;
            case "ics-attack":
                attackObj.isIcs = true;
                break;
            case "mobile-attack":
                attackObj.isMobile = true;
                break;
            default:
                process.stderr.write(`warning: could not determine the matrix for object:${attackObj.id}\n`);
                break;
        }
    }

    if (!("id" in attackObj)) {
        console.log(stixObject);
        throw new Error("Could not extract reference from STIX object.");
    }

    // Assign an object type.
    if (stixObject.type in stixTypeToAttackTypeMap) {
        attackObj.type = stixTypeToAttackTypeMap[stixObject.type];
    } else if (stixObject.type === "attack-pattern") {
        if (stixObject.x_mitre_is_subattackObj) {
            attackObj.type = AttackObjectType.Subtechnique;
        } else {
            attackObj.type = AttackObjectType.Technique;
        }
    } else {
        console.log(stixObject);
        throw new Error("Could not derive ATT&CK type from STIX object.");
    }

    // The "deprecated" field is based on logic described here:
    // https://github.com/mitre/cti/blob/master/USAGE.md#working-with-deprecated-and-revoked-objects
    attackObj.deprecated = stixObject.x_mitre_deprecated === true ||
        stixObject.revoked === true;

    return attackObj as AttackObject;
}

/**
 * A generator function that yields ATT&CK objects in a format suitable for
 * indexing.
 *
 * @param stixPath - Path to a STIX document
 */
function* parseAttackStix(stixPath: string): IterableIterator<AttackObject> {
    const attackStixText = fs.readFileSync(stixPath, "utf8");
    const attackStix: StixDocument = JSON.parse(attackStixText);
    for (const stixObject of attackStix.objects) {
        if (stixObject.type === "attack-pattern"
            || stixObject.type in stixTypeToAttackTypeMap) {
            yield extractAttackObject(stixObject);
        } else {
            continue;
        }
    }
}

/**
 * Main entry point.
 */
function main() {
    process.stderr.write("Building ATT&CK search index…\n");

    const attackObjects = [];
    const objectCounts: Record<string, number> = {
        tactic: 0, technique: 0, subtechnique: 0, software: 0,
        group: 0, mitigation: 0, data_source: 0,
    };
    const uniqueObjectIds = new Set();
    let deprecatedCount = 0;

    for (const inputFile of inputFiles) {
        process.stderr.write(`Reading ${inputFile}… `);
        for (const attackObject of parseAttackStix(inputFile)) {
            if (uniqueObjectIds.has(attackObject.id)) {
                continue;
            }
            uniqueObjectIds.add(attackObject.id);
            objectCounts[attackObject.type]++;
            if (attackObject.deprecated) {
                deprecatedCount++;
            }
            attackObjects.push(attackObject);
        }
        process.stderr.write("done\n");
    }

    process.stderr.write("Writing data/attack.json…\n");
    fs.writeFileSync("data/attack.json", JSON.stringify(attackObjects));

    process.stderr.write("Writing data/fuse-index.json…\n");
    const index = Fuse.createIndex(fuseOptions.keys, attackObjects);
    fs.writeFileSync("data/fuse-index.json", JSON.stringify(index.toJSON()));

    // Display summary of ingested data.
    process.stderr.write("Loaded object counts:\n");
    for (const [type, count] of Object.entries(objectCounts)) {
        process.stderr.write(` * ${type}: ${count}\n`)
    }
    process.stderr.write(`Deprecated object count: ${deprecatedCount}\n`);

    process.stderr.write("Done.\n");
}

main();

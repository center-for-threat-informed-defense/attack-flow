/**
 * This script pre-computes a search index for ATT&CK data so that it
 * doesn't need to be recomputed on every run.
 */
import Fuse from 'fuse.js';
import fs from "fs";
import process from "process";
import { AttackDomain, AttackSource, AttackObjectType, AttackObject, fuseOptions } from "../assets/scripts/Attack";
import { create } from 'domain';

interface StixDocument {
    objects: StixObject[];
}

interface StixObject {
    id: string;
    type: string;
    name: string;
    description?: string;
    external_references: any;
    x_mitre_domains: string[];
    x_mitre_is_subtechnique: boolean;
    x_mitre_deprecated: boolean;
    x_mitre_shortname: string;
    revoked: boolean;
    x_mitre_is_subattackObj: boolean;
    kill_chain_phases: StixObjectKillchainPhase[];
}

interface StixObjectKillchainPhase {
    kill_chain_name: AttackSource,
    phase_name: string,
}

const inputFiles = [
    "data/enterprise-attack.json",
    "data/ics-attack.json",
    "data/mobile-attack.json",
];

// Note that attack-pattern is handled outside of this map, since it can
// be a technique or a subtechnique.
const stixTypeToAttackTypeMap = new Map<string,AttackObjectType>([
    ["course-of-action", AttackObjectType.Mitigation],
    ["intrusion-set", AttackObjectType.Group],
    ["malware", AttackObjectType.Software],
    ["tool", AttackObjectType.Software],
    ["x-mitre-data-source", AttackObjectType.DataSource],
    ["x-mitre-tactic", AttackObjectType.Tactic],
]);

const mitreSources = new Set([
    AttackSource.Enterprise,
    AttackSource.ICS,
    AttackSource.Mobile,
]);

const mitreDomains = new Set([
    AttackDomain.Enterprise,
    AttackDomain.ICS,
    AttackDomain.Mobile,
]);

/**
 * Scan through STIX objects and build a map from tactic short name to tactic STIX ID.
 *
 * @param stixObjects - list of STIX objects
 * @returns a map of STIX tactics
 */
function createTacticLookup(stixObjects: StixObject[]): Map<string,string> {
    const lookup = new Map<string,string>();
    let mitreSource: AttackSource | null;

    for (let stixObject of stixObjects) {
        mitreSource = null;

        if (stixObject.type === "x-mitre-tactic") {
            // Find a MITRE source in the external references.
            for (const reference of stixObject.external_references) {
                const source = reference.source_name as AttackSource;
                if (mitreSources.has(source)) {
                    mitreSource = source;
                    break;
                }
            }

            if (!mitreSource) {
                console.log(stixObject);
                throw new Error("Could not extract reference from STIX object above ⬆︎");
            }

            lookup.set(stixObject.x_mitre_shortname, stixObject.id);
        }
    }

    console.log("tactic table", lookup);
    return lookup;
}

/**
 * Extract ATT&CK data needed for search index.
 *
 * @param tacticMap - A lookup table for tactic IDs
 * @param stixObject - An object read from a STIX document
 * @returns An AttackObject parsed from the STIX object
 */
function extractAttackObject(tacticMap: Map<string,string>, stixObject: StixObject): AttackObject {
    let tid: string | undefined;
    let isEnterprise: boolean = false;
    let isIcs = false;
    let isMobile = false;
    let mitreSource: AttackSource | undefined;
    let objType: AttackObjectType | undefined;
    let tacticRefs: string[] = [];
    let deprecated: boolean;

    // ID and URL are extracted from the first reference that is sourced to
    // MITRE.
    for (const reference of stixObject.external_references) {
        const source = reference.source_name as AttackSource;
        if (mitreSources.has(source)) {
            tid = reference.external_id;
            mitreSource = source;
            break;
        }
    }

    if ((tid === null) || (mitreSource === null)) {
        console.log(stixObject);
        throw new Error("Could not extract reference from STIX object above ⬆︎");
    }

    // Extract the ATT&CK dinaub from the STIX object.
    for (const mitreDomain of stixObject.x_mitre_domains) {
        switch (mitreDomain as AttackDomain) {
            case AttackDomain.Enterprise:
                isEnterprise = true;
                break;
            case AttackDomain.ICS:
                isIcs = true;
                break;
            case AttackDomain.Mobile:
                isMobile = true;
                break;
            default:
                process.stderr.write(`warning: could not determine the matrix for object: ${tid}\n`);
                break;
        }
    }

    // Assign an object type.
    objType = stixTypeToAttackTypeMap.get(stixObject.type);
    if (!objType && stixObject.type === "attack-pattern") {
        if (stixObject.x_mitre_is_subattackObj) {
            objType = AttackObjectType.Subtechnique;
        } else {
            objType = AttackObjectType.Technique;
        }
    }

    if (!objType) {
        console.log(stixObject);
        throw new Error("Could not derive ATT&CK type from STIX object above ⬆︎");
    }

    // Look up associated tactics.
    if (stixObject.kill_chain_phases) {
        for (const kcp of stixObject.kill_chain_phases) {
            if (mitreSources.has(kcp.kill_chain_name)) {
                const tacticId = tacticMap.get(kcp.phase_name);
                if (!tacticId) {
                    throw new Error(`Cannot find tactic shortName=${kcp.phase_name} in lookup table`);
                }
                tacticRefs.push(tacticId ?? "missing");
            }
        }
    }

    // The "deprecated" field is based on logic described here:
    // https://github.com/mitre/cti/blob/master/USAGE.md#working-with-deprecated-and-revoked-objects
    deprecated = stixObject.x_mitre_deprecated === true ||
        stixObject.revoked === true;

    return {
        ref: stixObject.id,
        tid: tid as string,
        type: objType,
        name: stixObject.name,
        source: mitreSource as AttackSource,
        isEnterprise: isEnterprise,
        isMobile: isMobile,
        isIcs: isIcs,
        deprecated: deprecated,
        tacticRefs: tacticRefs,
    };
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
    const tacticLookup = createTacticLookup(attackStix.objects);
    for (const stixObject of attackStix.objects) {
        if (stixObject.type === "attack-pattern"
            || stixTypeToAttackTypeMap.has(stixObject.type)) {
            yield extractAttackObject(tacticLookup, stixObject);
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
            if (uniqueObjectIds.has(attackObject.tid)) {
                continue;
            }
            uniqueObjectIds.add(attackObject.tid);
            objectCounts[attackObject.type]++;
            if (attackObject.deprecated) {
                deprecatedCount++;
            }
            attackObjects.push(attackObject);
        }
        process.stderr.write("done\n");
    }

    process.stderr.write("Writing public/attack.json…\n");
    fs.writeFileSync("public/attack.json", JSON.stringify(attackObjects));

    process.stderr.write("Writing public/fuse-index.json…\n");
    const index = Fuse.createIndex(fuseOptions.keys, attackObjects);
    fs.writeFileSync("public/fuse-index.json", JSON.stringify(index.toJSON()));

    // Display summary of ingested data.
    process.stderr.write("Loaded object counts:\n");
    for (const [type, count] of Object.entries(objectCounts)) {
        process.stderr.write(` * ${type}: ${count}\n`)
    }
    process.stderr.write(`Deprecated object count: ${deprecatedCount}\n`);

    process.stderr.write("Done.\n");
}

main();

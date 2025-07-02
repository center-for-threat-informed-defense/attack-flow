import { writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { STIX_SOURCES } from "./download_sources.mjs";
import { fileURLToPath } from 'url';
import { fetchAttackData } from "./download_attack.mjs"

/**
 * The intel file's export key.
 */
const EXPORT_KEY = "enums";

/**
 * The MITRE attack enumeration file.
 */
const ENUM_FILE = `MitreAttack.ts`;

/**
 * The MITRE attack enumeration file's directory.
 */
const ENUM_DIR  = `../src/assets/configuration/AttackFlowTemplates`;

/**
 * The MITRE attack enumeration file's path.
 */
const ENUM_PATH = `${ ENUM_DIR }/${ ENUM_FILE }`;

/**
 * JavaScript variable regex.
 */
const JS_VAR_REGEX = /^[a-z_$][a-z0-9_$]*$/i;

/**
 * Updates the specified enum file.
 * @param {string} path
 *  The enum file's path.
 * @param  {...string} urls
 *  A list of STIX manifests specified by url. 
 */
async function updateApplicationAttackEnums(path, ...urls) {
    path = resolve(dirname(fileURLToPath(import.meta.url)), path);
    
    // Validate export key
    if(!JS_VAR_REGEX.test(EXPORT_KEY)) {
        throw new Error(`Export key '${ EXPORT_KEY }' is not a valid variable name.`);
    }
    
    // Collect data
    const types = await fetchAttackData(...urls);

    console.log("→ Generating enumerations file...");

    // Organize tactics and relationships
    const tactics = [];
    const relationships = [];
    for(const tact of types.get("tactic")) {
        if(tact.deprecated) {
            continue;
        }
        // Format matrix
        const matrix = tact.domains.map(
            o => o.substring(0,3).toLocaleUpperCase()
        ).join(", ");
        // Format tactic
        tactics.push([
            tact.id, `[${matrix}] ${tact.id}: ${tact.name}`
        ]);
        for(const tech of tact.techniques) {
            relationships.push(["tactic", tact.id, "technique", tech.id]);
        }
    }
    tactics.sort(([a],[b]) => a.localeCompare(b));

    // Organize techniques
    const techniques = [];
    for(const tech of types.get("technique")) {
        if(tech.deprecated) {
            continue;
        }
        techniques.push([tech.id, `${tech.id}: ${tech.name}`]);
    }
    techniques.sort(([a],[b]) => a.localeCompare(b));

    // Generate enums file
    let file = "";
    file += `export const ${ EXPORT_KEY } = `;
    file += JSON.stringify({ tactics, techniques, relationships });
    file += `;\n\nexport default ${ EXPORT_KEY };\n`
    writeFileSync(path, file);

    // Done
    console.log("\nMITRE ATT&CK enumerations updated successfully.\n");

}

/**
 * Main
 */
updateApplicationAttackEnums(ENUM_PATH, ...STIX_SOURCES);

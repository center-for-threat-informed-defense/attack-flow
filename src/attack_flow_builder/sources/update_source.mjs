import { writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { STIX_SOURCES } from "./sources.mjs";
import { fileURLToPath } from 'url';
import { fetchSourceData } from "./download_source.mjs";

/**
 * The intel file's export key.
 */
const EXPORT_KEY = "enums";

/**
 * The enumeration file's directory.
 */
const ENUM_DIR  = `../src/assets/configuration/AttackFlowTemplates`;

/**
 * The matrix prefix for tactics and techniques from sources without this information.
 */
const DOMAINS = {
    MitreAtlas: "ATL"
}

/**
 * JavaScript variable regex.
 */
const JS_VAR_REGEX = /^[a-z_$][a-z0-9_$]*$/i;

/**
 * Updates the specified enum file.
 * @param {string} fileName
 *  The enum file's name.
 */
export default async function updateApplicationSourceEnums(fileName) {
    const path = resolve(dirname(fileURLToPath(import.meta.url)), `${ ENUM_DIR }/${ fileName }.ts`);

    // Validate export key
    if(!JS_VAR_REGEX.test(EXPORT_KEY)) {
        throw new Error(`Export key '${ EXPORT_KEY }' is not a valid variable name.`);
    }

    // Collect data
    const types = await fetchSourceData(...STIX_SOURCES[fileName]);

    console.log(`→ Generating enumerations file...`);

    // Organize tactics and relationships
    const tactics = [];
    const relationships = [];
    const stixIds = {};
    for(const tact of types.get("tactic")) {
        if(tact.deprecated) {
            continue;
        }

        // Format matrix
        const matrix = tact.domains ? tact.domains.map(
            o => o.substring(0,3).toLocaleUpperCase()
        ).join(", ") : DOMAINS[fileName];

        // Format tactic
        tactics.push([
            tact.id, `[${matrix}] ${tact.id} ${tact.name}`
        ]);
        for(const tech of tact.techniques) {
            relationships.push(["tactic", tact.id, "technique", tech.id]);
        }
        stixIds[tact.id] = tact.stixId;
    }
    tactics.sort(([a],[b]) => a.localeCompare(b));

    // Organize techniques
    const techniques = [];
    for(const tech of types.get("technique")) {
        if(tech.deprecated) {
            continue;
        }
        const matrix = tech.domains ? tech.domains.map(
            o => o.substring(0,3).toLocaleUpperCase()
        ).join(", ") : DOMAINS[fileName];
        techniques.push([tech.id, `[${matrix}] ${tech.id} ${tech.name}`]);
        stixIds[tech.id] = tech.stixId;
    }
    techniques.sort(([a],[b]) => a.localeCompare(b));

    // Generate enums file
    let file = "";
    file += `export const ${ EXPORT_KEY } = `;
    file += JSON.stringify({ tactics, techniques, relationships, stixIds });
    file += `;\n\nexport default ${ EXPORT_KEY };\n`
    writeFileSync(path, file);

    // Done
    console.log("\nSource enumerations updated successfully.\n");

}

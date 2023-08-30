const { resolve } = require("path");
const { writeFileSync } = require("fs");
const { fetchAttackData } = require("./download_attack");
const { STIX_SOURCES } = require("./download_sources");

/**
 * The intel file's export key.
 */
const EXPORT_KEY = "intel";

/**
 * The intel file's path.
 */
const INTEL_FILE_PATH = "../src/assets/configuration/builder.config.intel.ts";

/**
 * JavaScript variable regex.
 */
const JS_VAR_REGEX = /^[a-z_$][a-z0-9_$]*$/i;

/**
 * Updates the specified intel file.
 * @param {string} path
 *  The intel file's path.
 * @param  {...string} urls
 *  A list of STIX manifests specified by url. 
 */
async function updateApplicationAttackIntel(path, ...urls) {
    path = resolve(__dirname, path);
    
    // Validate export key
    if(!JS_VAR_REGEX.test(EXPORT_KEY)) {
        throw new Error(`Export key '${ EXPORT_KEY }' is not a valid variable name.`);
    }
    
    // Collect intel
    let types = await fetchAttackData(...urls);
    console.log("→ Generating Application Intel File...");
    let intel = {
        tactics        : types.get("tactic"),
        tactic_recs    : types.get("tactic").map(o => `${o.id} (${o.matrix.split(/\s+/)[0]} / ${o.name})`).sort(),
        technique      : types.get("technique"),
        technique_recs : types.get("technique").map(o => `${o.id} (${o.name})`).sort()
    };
    
    // Generate intel file
    let file = "";
    file += `export const ${ EXPORT_KEY } = `;
    file += JSON.stringify(intel, null, 4);
    file += `;\n\nexport default ${ EXPORT_KEY };\n`
    writeFileSync(path, file);

    // Done
    console.log("\nIntelligence updated successfully.\n");

}

/**
 * Main
 */
updateApplicationAttackIntel(INTEL_FILE_PATH, ...STIX_SOURCES);

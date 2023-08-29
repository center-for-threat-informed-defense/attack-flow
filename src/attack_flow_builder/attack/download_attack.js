const https = require("https");

/**
 * @typedef {Object} AttackObject
 *  An ATT&CK Object.
 * @property {string} id
 *  The object's ATT&CK id.
 * @property {string} name
 *  The object's ATT&CK name.
 * @property {string} type
 *  The object's type.
 * @property {string} url
 *  The object's ATT&CK url.
 * @property {string} stixId
 *  The object's STIX id.
 * @property {boolean} deprecated
 *  True if the ATT&CK object has been deprecated, false otherwise.
 * @property {string} matrix
 *  The ATT&CK object's matrix. 
 */

/**
 * A map that relates STIX types to ATT&CK types.
 */
const STIX_TO_ATTACK = {
    "campaign"            : "campaign",
    "course-of-action"    : "mitigation",
    "intrusion-set"       : "group",
    "malware"             : "software",
    "tool"                : "software",
    "x-mitre-data-source" : "data_source",
    "x-mitre-tactic"      : "tactic",
    "attack-pattern"      : "technique"
}

/**
 * MITRE's source identifiers.
 */
const MITRE_SOURCES = new Set([
    "mitre-attack",
    "mitre-ics-attack",
    "mitre-mobile-attack"
])

/**
 * Fetches JSON data from a url.
 * @param {string} url
 *  The url.
 * @param {Object} options
 *  The request's options.
 * @returns {Promise<Object>}
 *  A Promise that resolves with the JSON data.
 */
function fetchJson(url, options = {}) {
    return new Promise((resolve, reject) => {
        https.get(url, options, res => {
            let json = "";
            res.on("data", chunk => {
                json += chunk;
            });
            res.on("end", () => {
                try {
                    resolve(JSON.parse(json));
                } catch(err) {
                    reject(err)
                }
            })
        }).on("error", (err) => {
            reject(err);
        });
    })
}

/**
 * Parses an ATT&CK object from a STIX object.
 * @param {Object} obj
 *  The STIX object.
 * @param {string} matrix
 *  The STIX object's matrix.
 * @returns {AttackObject}
 *  The parsed ATT&CK object.
 */
function parseStixToAttackObject(obj, matrix) {

    // Parse STIX id, name, and type directly
    let parse = {
        stixId : obj.id,
        name   : obj.name,
        type   : STIX_TO_ATTACK[obj.type],
        matrix : matrix 
    }

    // Parse MITRE reference information
    let mitreRef = obj.external_references.find(
        o => MITRE_SOURCES.has(o.source_name)
    );
    if(!mitreRef) {
        throw new Error("Missing MITRE reference information.")
    }
    parse.id  = mitreRef.external_id;
    parse.url = mitreRef.url;

    // Parse deprecation status
    parse.deprecated = (obj.x_mitre_deprecated || obj.revoked) ?? false;
    
    // Return
    return parse;
}

/**
 * Parses a set of ATT&CK objects from a STIX manifest.
 * @param {Object} data
 *  The STIX manifest.
 * @returns {AttackObject[]}
 *  The parsed ATT&CK objects.
 */
function parseAttackObjectsFromManifest(data) {
    // Parse matrix
    let collection = data.objects.find(o => o.type === "x-mitre-collection");
    if(!collection) {
        throw new Error("STIX collection information missing.");
    }
    // Parse objects
    let objs = []
    for(let obj of data.objects) {
        if(!(obj.type in STIX_TO_ATTACK)) {
            continue;
        }
        objs.push(parseStixToAttackObject(obj, collection.name));
    }
    return objs;
}

/**
 * Fetches ATT&CK data from a set of STIX manifests.
 * @param  {...string} urls
 *  A list of STIX manifests specified by url.
 * @returns {Promise<Map<string, AttackObject>>}
 *  A Promise that resolves with the parsed ATT&CK data.
 */
async function fetchAttackData(...urls) {
    console.log("→ Downloading ATT&CK Data...");
    
    // Parse objects
    let catalog = new Map();
    for(let url of urls) {
        console.log(` → ${ url.length > 70 ? '...' : '' }${ url.substr(url.length - 70) }`);  
        let objs = parseAttackObjectsFromManifest(await fetchJson(url));
        for(let obj of objs) {
            catalog.set(obj.stixId, obj);
        }
    }
    
    // Categorize catalog
    let types = new Map(
        Object.values(STIX_TO_ATTACK).map(v => [v, []])
    );
    for(let obj of catalog.values()) {
        types.get(obj.type).push(obj);
    }

    // Return
    return types;

}

/**
 * Define exports.
 */
module.exports = { fetchAttackData }

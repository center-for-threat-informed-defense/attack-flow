import { writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { v5 as uuidv5 } from "uuid";
import { MITRE_DEFEND_ATTACK_EXTRACTOR_URL, MITRE_DEFEND_URL, STIX_SOURCES } from "./sources.mjs";
import { fetchSourceData } from "./download_stix_source.mjs";
import { EXPORT_KEY, fetchJson } from "./source_utils.mjs";

/**
 * The enumeration file's directory.
 */
const ENUM_DIR = `../src/assets/configuration/AttackFlowTemplates`;

/**
 * The source name for D3FEND objects.
 */
const SOURCE_NAME = "D3FEND";

/**
 * The source domain for D3FEND objects.
 */
const SOURCE_DOMAIN = "d3fend";

/**
 * The maximum number of ATT&CK technique lookups to make concurrently.
 */
const ATTACK_EXTRACTOR_BATCH_SIZE = 100;

/**
 * Stable UUID v5 namespace for Builder-generated D3FEND countermeasure IDs.
 * This value should not change after generated IDs are published.
 */
const D3FEND_COUNTERMEASURE_NAMESPACE = "e73d9ba3-57f1-4a63-a474-fd2e937853b8";

/**
 * Produces a stable STIX-compatible identifier for a D3FEND countermeasure.
 * The D3FEND technique ID is stable, while D3FEND does not publish native
 * STIX object identifiers for these techniques.
 * @param {string} techniqueId
 *  The D3FEND technique ID.
 * @returns {string}
 *  The custom STIX countermeasure object ID.
 */
function getCountermeasureStixId(techniqueId) {
  return `x-countermeasure--${uuidv5(techniqueId, D3FEND_COUNTERMEASURE_NAMESPACE)}`;
}

/**
 * @typedef {Object} SourceObject
 * @property {string} ['@id']
 * @property {Array<string>} ['@type']
 * @property {Array<string>} ['rdfs:label']
 * @property {Array<string>} ['d3f:d3fend-id']
 */

/**
 * Ensures a value is returned as an array.
 * @param {any} value
 *  The value to convert.
 * @returns {any[]}
 *  The array form of the value.
 */
function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Loads the D3FEND matrix graph.
 * @param {string} url
 *  The remote graph JSON url.
 * @returns {Promise<SourceObject[]>}
 *  The graph array.
 */
async function loadGraph(url) {
  const json = await fetchJson(url);
  /** @type {SourceObject[]} */
  return asArray(json["@graph"]);
}

/**
 * Extracts the label from a node.
 * @param {SourceObject} node
 *  The node.
 * @returns {string|null}
 *  The label, if present.
 */
function getLabel(node) {
  const label = asArray(node?.["rdfs:label"])?.[0];
  return label || null;
}

/**
 * Extracts the D3FEND technique code from a node.
 * @param {SourceObject} node
 *  The node.
 * @returns {string|null}
 *  The technique code, if present.
 */
function getTechniqueCode(node) {
  const code = asArray(node?.["d3f:d3fend-id"])?.[0];
  return code || null;
}

/**
 * Creates a source object record.
 * @param {string} id
 *  The source object ID.
 * @param {string} name
 *  The source object name.
 * @param {string} label
 *  The display label.
 * @param {string} type
 *  The source object type.
 * @param {string} stixId
 *  The generated STIX-like ID.
 * @returns {Object}
 *  The source object record.
 */
function createSourceObject(id, name, label, type, stixId) {
  return {
    id,
    name,
    label,
    type,
    source: SOURCE_NAME,
    domains: [SOURCE_DOMAIN],
    stixId
  };
}

/**
 * Retrieves ATT&CK-to-D3FEND countermeasure mappings from the D3FEND ATT&CK
 * Extractor. The extractor exposes one JSON result per ATT&CK technique, so
 * requests are issued in bounded concurrent batches.
 * @param {string[]} attackTechniqueIds
 *  The active ATT&CK technique IDs.
 * @returns {Record<string, string[]>}
 *  Sorted, de-duplicated countermeasure IDs keyed by ATT&CK technique ID.
 */
async function fetchAttackCountermeasureMappings(attackTechniqueIds) {
  /** @type {Map<string, Set<string>>} */
  const mappings = new Map();
  for (let start = 0; start < attackTechniqueIds.length; start += ATTACK_EXTRACTOR_BATCH_SIZE) {
    const batch = attackTechniqueIds.slice(start, start + ATTACK_EXTRACTOR_BATCH_SIZE);
    console.log(` → Extracting mappings for ${start + 1}-${start + batch.length} of ${attackTechniqueIds.length} ATT&CK techniques...`);
    const results = await Promise.all(batch.map(async attackTechniqueId => {
      const endpoint = `${MITRE_DEFEND_ATTACK_EXTRACTOR_URL}/${encodeURIComponent(attackTechniqueId)}.json`;
      return [attackTechniqueId, await fetchJson(endpoint)];
    }));

    for (const [attackTechniqueId, result] of results) {
      const bindings = result.off_to_def?.results?.bindings ?? [];
      for (const binding of bindings) {
        const countermeasureId = binding.def_tech_id?.value;
        if (!countermeasureId) continue;
        if (!mappings.has(attackTechniqueId)) mappings.set(attackTechniqueId, new Set());
        mappings.get(attackTechniqueId).add(countermeasureId);
      }
    }
  }

  return Object.fromEntries(
    [...mappings.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([attackId, countermeasureIds]) => [
        attackId,
        [...countermeasureIds].sort((a, b) => a.localeCompare(b))
      ])
  );
}

/**
 * Updates the MitreDefend enums file by downloading and parsing the D3FEND matrix graph.
 */
export default async function updateMitreDefend() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const outPath = resolve(__dirname, `${ENUM_DIR}/MitreDefend.ts`);

  // Download the D3FEND matrix graph and current ATT&CK technique catalog.
  console.log("→ Downloading D3FEND matrix graph and ATT&CK technique catalog...");
  console.log(` → ${MITRE_DEFEND_URL}`);
  const [graph, attackTypes] = await Promise.all([
    loadGraph(MITRE_DEFEND_URL),
    fetchSourceData(...STIX_SOURCES.MitreAttack)
  ]);

  // D3FEND techniques are independent countermeasures; do not emit D3FEND
  // tactics or tactic-to-technique relationships.
  const techniqueLabelByCode = new Map(); // code -> label

  for (const node of graph) {
    const code = getTechniqueCode(node);
    const label = getLabel(node);
    if (code && label && !techniqueLabelByCode.has(code)) {
      techniqueLabelByCode.set(code, label);
    }
  }

  const attackTechniqueIds = attackTypes.get("technique")
    .filter(technique => !technique.deprecated)
    .map(technique => technique.id)
    .sort((a, b) => a.localeCompare(b));

  const relationships = {
    tacticTechniques: [],
    techniqueMitigations: [],
    techniqueDetections: [],
    offensiveTechniquesToCountermeasures: await fetchAttackCountermeasureMappings(attackTechniqueIds)
  };

  const techniques = Object.fromEntries(
    Array.from(techniqueLabelByCode.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([code, label]) => [code, createSourceObject(
        code,
        label,
        `[D3F] ${code} ${label}`,
        "technique",
        getCountermeasureStixId(code)
      )])
  );

  // Generate enums file
  let file = "";
  file += `export const ${EXPORT_KEY} = `;
  file += JSON.stringify({
    tactics: {},
    techniques,
    mitigations: {}, // No mitigation data
    detections: {}, // No detection data
    relationships
  }, null, 4);
  file += `;\n\nexport default ${EXPORT_KEY};\n`;

  writeFileSync(outPath, file);
  console.log("\nMitreDefend enums updated successfully.\n");
}

updateMitreDefend()

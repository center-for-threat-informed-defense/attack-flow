import { writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { MITRE_DEFEND_URL } from "./sources.mjs";
import { EXPORT_KEY, fetchJson } from "./source_utils.mjs";
import { randomUUID } from "crypto";

/**
 * The enumeration file's directory.
 */
const ENUM_DIR = `../src/assets/configuration/AttackFlowTemplates`;

/**
 * @typedef {Object} ChildRef
 * @property {string} ['@id']
 */

/**
 * @typedef {Object} SourceObject
 * @property {string} ['@id']
 * @property {Array<string>} ['@type']
 * @property {Array<string>} ['rdfs:label']
 * @property {Array<string>} ['d3f:d3fend-id']
 * @property {Array<ChildRef>} ['d3f:children']
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
 * Loads the D3FEND matrix graph from a remote source and indexes nodes by @id.
 * @param {string} url
 *  The remote graph JSON url.
 * @returns {{ graph: SourceObject[], byId: Map<string, SourceObject> }}
 *  The graph array and an index of nodes by @id.
 */
async function loadGraph(url) {
  const json = await fetchJson(url);
  /** @type {SourceObject[]} */
  const graph = asArray(json["@graph"]);
  /** @type {Map<string, SourceObject>} */
  const byId = new Map();
  for (const node of graph) {
    if (node && node["@id"]) byId.set(node["@id"], node);
  }
  return { graph, byId };
}

/**
 * Determines if a node is a D3FEND tactic.
 * @param {SourceObject} node
 *  The node to evaluate.
 * @returns {boolean}
 *  True if the node represents a defensive tactic; false otherwise.
 */
function isTactic(node) {
  const types = asArray(node?.["@type"]);
  return types.includes("d3f:DefensiveTactic");
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
 * Returns the child @id values for a node.
 * @param {SourceObject} node
 *  The node.
 * @returns {string[]}
 *  The child identifiers.
 */
function getChildrenIds(node) {
  const children = asArray(node?.["d3f:children"]);
  // Children are objects with { "@id": "..." }
  return children
    .map(k => (typeof k === "string" ? k : k?.["@id"]))
    .filter(Boolean);
}

/**
 * Collects all descendant techniques for a tactic node.
 * This performs a DFS through d3f:children links to arbitrary depth.
 * @param {SourceObject} rootNode
 *  The tactic node to traverse from.
 * @param {Map<string, SourceObject>} byId
 *  Index of nodes by @id.
 * @returns {{ techniqueIds: Set<string>, techniqueLabels: Map<string,string> }}
 *  The set of technique codes and a mapping to their labels.
 */
function collectDescendantTechniques(rootNode, byId) {
  const stack = [...getChildrenIds(rootNode)];
  const visited = new Set();
  /** @type {Set<string>} */
  const techniqueIds = new Set(); // stores technique code like D3-AMED
  /** @type {Map<string, string>} */
  const techniqueLabels = new Map(); // code -> label

  while (stack.length) {
    const id = stack.pop();
    if (!id || visited.has(id)) continue;
    visited.add(id);

    const node = byId.get(id);
    if (!node) continue;

    // If this node is a technique (has d3f:d3fend-id and label), record it
    const code = getTechniqueCode(node);
    const label = getLabel(node);
    if (code && label) {
      techniqueIds.add(code);
      if (!techniqueLabels.has(code)) techniqueLabels.set(code, label);
    }

    // Always traverse children to reach deeper techniques
    const children = getChildrenIds(node);
    for (const cid of children) stack.push(cid);
  }

  return { techniqueIds, techniqueLabels };
}

/**
 * Updates the MitreDefend enums file by downloading and parsing the D3FEND matrix graph.
 */
export default async function updateMitreDefend() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const outPath = resolve(__dirname, `${ENUM_DIR}/MitreDefend.ts`);

  // Download and index graph
  console.log("→ Downloading D3FEND matrix graph...");
  console.log(` → ${MITRE_DEFEND_URL}`);
  const { graph, byId } = await loadGraph(MITRE_DEFEND_URL);

  // Identify tactics
  const tacticsNodes = graph.filter(isTactic);

  // Organize tactics and relationships
  const tactics = [];
  const relationships = [];
  const techniqueLabelByCode = new Map(); // code -> label

  for (const t of tacticsNodes) {
    const tacticId = t["@id"];
    if (!tacticId) continue;

    // Remove the leading "d3f:" namespace from tactic identifiers for output
    const cleanTacticId = tacticId.replace(/^d3f:/, "");

    tactics.push([cleanTacticId, `[D3F] ${cleanTacticId}`]);

    const { techniqueIds, techniqueLabels } = collectDescendantTechniques(t, byId);

    for (const [code, label] of techniqueLabels.entries()) {
      if (!techniqueLabelByCode.has(code)) techniqueLabelByCode.set(code, label);
    }
    for (const code of techniqueIds) {
      // Relationship uses tactic id without d3f: prefix
      relationships.push(["tactic", cleanTacticId, "technique", code]);
    }
  }

  tactics.sort(([a], [b]) => a.localeCompare(b));

  const techniques = Array.from(techniqueLabelByCode.entries())
    .map(([code, label]) => [code, `[D3F] ${code} ${label}`])
    .sort(([a], [b]) => a.localeCompare(b));

  // Generate UUIDv4 refs for all tactics and techniques (no STIX, but we need these anyway)
  const stixIds = Object.fromEntries([
    ...tactics.map(([id]) => [id, `x-mitre-tactic--${randomUUID()}`]),
    ...techniques.map(([id]) => [id, `attack-pattern--${randomUUID()}`])
  ]);

  // Generate enums file
  let file = "";
  file += `export const ${EXPORT_KEY} = `;
  file += JSON.stringify({ tactics, techniques, relationships, stixIds });
  file += `;\n\nexport default ${EXPORT_KEY};\n`;

  writeFileSync(outPath, file);
  console.log("\nMitreDefend enums updated successfully.\n");
}

updateMitreDefend()

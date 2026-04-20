/**
 * The base URLs for source repositories.
 */
const ATTACK_BASE_URL = "https://raw.githubusercontent.com/mitre-attack/attack-stix-data/master";

/**
 * The STIX sources.
 */
export const STIX_SOURCES = {
    MitreAttack: [
        `${ATTACK_BASE_URL}/enterprise-attack/enterprise-attack-17.0.json`,
        `${ATTACK_BASE_URL}/ics-attack/ics-attack-17.0.json`,
        `${ATTACK_BASE_URL}/mobile-attack/mobile-attack-17.0.json`
    ],
    MitreAtlas: [
        "https://raw.githubusercontent.com/mitre-atlas/atlas-navigator-data/refs/heads/main/dist/stix-atlas.json"
    ],
    MitreF3: [
        "https://raw.githubusercontent.com/center-for-threat-informed-defense/fight-fraud-framework/refs/heads/main/public/f3-stix.json"
    ]
};

/**
 * The D3FEND source.
 */
export const MITRE_DEFEND_URL = "https://d3fend.mitre.org/api/matrix-graph.json"

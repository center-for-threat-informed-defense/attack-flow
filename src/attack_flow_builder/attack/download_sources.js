/**
 * The base URL for the ATT&CK repository.
 */
const BASE_URL = "https://raw.githubusercontent.com/mitre-attack/attack-stix-data/master";

/**
 * The STIX sources.
 */
const STIX_SOURCES = [
    `${BASE_URL}/enterprise-attack/enterprise-attack-16.0.json`,
    `${BASE_URL}/ics-attack/ics-attack-16.0.json`,
    `${BASE_URL}/mobile-attack/mobile-attack-16.0.json`
]

/**
 * Export
 */
module.exports = {
    STIX_SOURCES
};

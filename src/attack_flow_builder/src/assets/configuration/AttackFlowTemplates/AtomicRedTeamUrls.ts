import {
    atomicRedTeamBaseUrl,
    atomicRedTeamRawBaseUrl,
    atomicRedTeamTechniqueIds
} from "./AtomicRedTeam";

/** Returns the Atomic Red Team file base URL for an exact ATT&CK technique ID. */
export function getAtomicRedTeamUrl(techniqueId?: string): string | undefined {
    return techniqueId && atomicRedTeamTechniqueIds.has(techniqueId)
        ? `${atomicRedTeamBaseUrl}/${techniqueId}`
        : undefined;
}

/** Returns the Atomic Red Team raw file base URL for an exact ATT&CK technique ID. */
export function getAtomicRedTeamRawUrl(techniqueId?: string): string | undefined {
    return techniqueId && atomicRedTeamTechniqueIds.has(techniqueId)
        ? `${atomicRedTeamRawBaseUrl}/${techniqueId}`
        : undefined;
}

import type { StixObject } from "./StixTypes";

/**
 * Compiles the list of embedded relationships from a {@link StixObject}.
 * @param stix
 *  The {@link StixObject}.
 * @returns
 *  The embedded relationship identifiers (if there are any).
 */
export function resolveEmbeddedRelationships(stix: StixObject): string[] {
    // Marking References
    const common: (string | string[] | undefined)[] = [
        stix.object_marking_refs
    ];
    // Created By
    if ("created_by_ref" in stix) {
        common.push(stix.created_by_ref);
    }
    // Type Specific
    switch (stix.type) {
        case "note":
        case "grouping":
        case "observed-data":
        case "opinion":
        case "report":
            return compileIdentifiers(
                ...common,
                stix.object_refs
            );
        case "malware":
            return compileIdentifiers(
                ...common,
                stix.sample_refs
            );
        case "malware-analysis":
            return compileIdentifiers(
                ...common,
                stix.host_vm_ref,
                stix.operating_system_ref,
                stix.installed_software_refs,
                stix.analysis_sco_refs
            );
        case "sighting":
            return compileIdentifiers(
                ...common,
                stix.sighting_of_ref,
                stix.observed_data_refs,
                stix.where_sighted_refs
            );
        case "directory":
            return compileIdentifiers(
                ...common,
                stix.contains_refs
            );
        case "email-addr":
            return compileIdentifiers(
                ...common,
                stix.belongs_to_ref
            );
        case "email-message":
            return compileIdentifiers(
                ...common,
                stix.from_ref,
                stix.sender_ref,
                stix.to_refs,
                stix.cc_refs,
                stix.bcc_refs,
                stix.raw_email_ref
            );
        case "file":
            return compileIdentifiers(
                ...common,
                stix.parent_directory_ref,
                stix.contains_refs,
                stix.content_ref
            );
        case "network-traffic":
            return compileIdentifiers(
                ...common,
                stix.src_ref,
                stix.dst_ref,
                stix.src_payload_ref,
                stix.dst_payload_ref,
                stix.encapsulates_refs,
                stix.encapsulated_by_ref
            );
        case "process":
            return compileIdentifiers(
                ...common,
                stix.opened_connection_refs,
                stix.creator_user_ref,
                stix.image_ref,
                stix.parent_ref,
                stix.child_refs
            );
        case "windows-registry-key":
            return compileIdentifiers(
                ...common,
                stix.creator_user_ref
            );
        case "attack-action":
            return compileIdentifiers(
                ...common,
                stix.command_ref,
                stix.asset_refs,
                stix.effect_refs
            );
        case "attack-condition":
            return compileIdentifiers(
                ...common,
                stix.on_true_refs,
                stix.on_false_refs
            );
        case "attack-asset":
            return compileIdentifiers(
                ...common,
                stix.object_ref
            );
        case "attack-operator":
            return compileIdentifiers(
                ...common,
                stix.effect_refs
            );
        default:
            return compileIdentifiers(
                ...common
            );
    }
}

/**
 * Compiles a list of identifiers into a flat list.
 * @param ids
 *  The set of ids.
 * @returns
 *  The flattened list of ids.
 */
export function compileIdentifiers(
    ...ids: (undefined | string | string[])[]
): string[] {
    return ids.filter(Boolean).flat() as string[];
}

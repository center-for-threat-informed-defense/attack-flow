import { StringProperty, TTPTupleProperty } from "@OpenChart/DiagramModel";
import { getAtomicRedTeamUrl } from "./AtomicRedTeamUrls";
import type { InlineBlockLinkResolver } from "@OpenChart/DiagramView";

/** Supplies an Atomic Red Team link for an action's exact ATT&CK technique. */
export const atomicRedTeamActionLinks: InlineBlockLinkResolver = view => {
    const ttp = view.properties.get("ttp", TTPTupleProperty);
    const techniqueId = ttp?.get("technique", StringProperty)?.value;
    const baseUrl = getAtomicRedTeamUrl(techniqueId ?? undefined);
    const url = baseUrl && techniqueId ? `${baseUrl}/${techniqueId}.md` : undefined;
    return url ? [{ afterField: "technique", text: "red-team this ↗", url }] : [];
};

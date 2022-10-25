export enum AttackSource {
    Enterprise = "mitre-attack",
    ICS = "mitre-ics-attack",
    Mobile = "mitre-mobile-attack",
}

// Domain looks really similar to matrix -- duplicative, even -- but the ATT&CK STIX
// data model does separate these concepts.
export enum AttackDomain {
    Enterprise = "enterprise-attack",
    ICS = "ics-attack",
    Mobile = "mobile-attack",
}

export enum AttackObjectType {
    Technique = "technique",
    Subtechnique = "subtechnique",
    Mitigation = "mitigation",
    Group = "group",
    Software = "software",
    DataSource = "data_source",
    Tactic = "tactic"
}

export interface AttackObject {
    ref: string; // STIX ID
    tid: string; // Technique ID
    type: AttackObjectType;
    name: string;
    source: AttackSource;
    isEnterprise: boolean;
    isIcs: boolean;
    isMobile: boolean;
    deprecated: boolean;
    tacticRefs: string[];
}

export const fuseOptions = {
    includeMatches: true,
    distance: 1000,
    threshold: 0.1,
    ignoreFieldNorm: true,
    minMatchCharLength: 3,
    keys: [
        {
            name: "tid",
            weight: 3,
        },
        {
            name: "name",
            weight: 2,
        },
        {
            name: "description",
            weight: 1,
        },
    ],
};

// let fuse: Fuse<AttackObject> = new Fuse([], fuseOptions);
let tacticLookup: Map<string, AttackObject> = new Map();

export class AttackSearchFilter {
    // Object types:
    public includeTechniques: boolean = false;
    public includeSubtechniques: boolean = false;
    public includeMitigations: boolean = false;
    public includeSoftware: boolean = false;
    public includeTactics: boolean = false;
    public includeDataSources: boolean = false;
    public includeGroups: boolean = false;
    // Matrices:
    public includeEnterprise: boolean = false;
    public includeIcs: boolean = false;
    public includeMobile: boolean = false;
    // Deprecation:
    public includeDeprecated: boolean = false;
}

/**
 * Check if an ATT&CK object passes through this filter.
 *
 * @param filter - The filter to check.
 * @param attackObj - The item to check.
 * @returns true if the item passes this filter
 */
function check(filter: AttackSearchFilter, attackObj: AttackObject): boolean {
    // Apply object type filters:
    if (attackObj.type == AttackObjectType.Technique && !filter.includeTechniques ||
        attackObj.type == AttackObjectType.Subtechnique && !filter.includeSubtechniques ||
        attackObj.type == AttackObjectType.Software && !filter.includeSoftware ||
        attackObj.type == AttackObjectType.Tactic && !filter.includeTactics ||
        attackObj.type == AttackObjectType.DataSource && !filter.includeDataSources ||
        attackObj.type == AttackObjectType.Group && !filter.includeGroups
    ) {
        return false;
    }

    // Apply deprecation filter:
    if (attackObj.deprecated && !filter.includeDeprecated) {
        return false;
    }

    // Apply matrix filters:
    return (
        attackObj.isEnterprise && filter.includeEnterprise ||
        attackObj.isIcs && filter.includeIcs ||
        attackObj.isMobile && filter.includeMobile);
}

/**
 * Initialize the search index.
 */
export async function initializeAttackSearch() {
    // Note that Chrome service workers don't support XMLHttpRequest, so we must
    // use the fetch() API here.
    const attackResponse = await fetch("./attack.json");
    const attackData = await attackResponse.json();
    const indexResponse = await fetch("./fuse-index.json");
    const indexData = await indexResponse.json();
    // const fuseIndex = Fuse.parseIndex(indexData);
    // fuse = new Fuse<AttackObject>(attackData, fuseOptions, fuseIndex);
    for (let attackObject of attackData as AttackObject[]) {
        if (attackObject.type === AttackObjectType.Tactic) {
            tacticLookup.set(attackObject.ref, attackObject);
        }
    }
    console.log("Search index is initialized.");
}

/**
 * Run a query on the search index and return the results.
 *
 * @param query - The term[s] to search for in the index
 * @param filter - Options to filter the result set
 * @param maxResults - The maximum number of results to return
 */
// export function searchAttack(query: string, filter: AttackSearchFilter, maxResults = 25) {

//     // const unfilteredResults = fuse.search(query);
//     let filteredResults = [];
//     let resultCount = 0;

//     for (const result of unfilteredResults) {
//         const type = result.item.type;
//         const deprecated = result.item.deprecated;
//         if (check(filter, result.item)) {
//             if (resultCount < maxResults) {
//                 filteredResults.push(result);
//             }
//             resultCount++;
//         }
//     }

//     return {
//         query,
//         items: filteredResults,
//         totalCount: resultCount,
//     };
// }

/**
 * Look up an ATT&CK object by it's STIX ID (a.k.a. "ref").
 *
 * @param ref - STIX ID to look up
 */
export function lookupAttack(ref: string) {
    return tacticLookup.get(ref);
}
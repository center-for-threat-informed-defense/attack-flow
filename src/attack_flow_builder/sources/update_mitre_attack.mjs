import updateApplicationSourceEnums from "./update_stix_source.mjs";
import updateAtomicRedTeam from "./update_atomic_red_team.mjs";

await updateApplicationSourceEnums("MitreAttack");
await updateAtomicRedTeam();

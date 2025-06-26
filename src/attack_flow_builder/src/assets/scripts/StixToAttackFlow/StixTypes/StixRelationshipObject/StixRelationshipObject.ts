import type { Sighting } from "./Sighting";
import type { Relationship } from "./Relationship";

export type StixRelationshipObject
    = Relationship
    | Sighting;

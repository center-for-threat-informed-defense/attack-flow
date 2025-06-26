import type { StixDomainObject } from "./StixDomainObject";
import type { StixObservableObject } from "./StixObservableObject";
import type { StixRelationshipObject } from "./StixRelationshipObject";

export type StixObject
    = StixDomainObject
    | StixObservableObject
    | StixRelationshipObject;

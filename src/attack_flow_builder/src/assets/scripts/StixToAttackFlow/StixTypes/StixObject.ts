import type { StixDomainObject } from "./StixDomainObject";
import type { StixObservableObject } from "./StixObservableObject";
import type { StixRelationshipObject } from "./StixRelationshipObject";
import type { StixExtensionDefinition } from "./StixMetaObject";

export type StixObject
    = StixDomainObject
    | StixObservableObject
    | StixRelationshipObject
    | StixExtensionDefinition;

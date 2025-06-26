import type { StixMetaObjectType } from "./StixMetaObject";
import type { StixObservableObjectType } from "./StixObservableObject";
import type { StixRelationshipObjectType } from "./StixRelationshipObject";
import type { AttackFlowObjectType, StixDomainObjectType } from "./StixDomainObject";

export type StixObjectType
    = StixDomainObjectType
    | StixMetaObjectType
    | StixObservableObjectType
    | StixRelationshipObjectType
    | AttackFlowObjectType;

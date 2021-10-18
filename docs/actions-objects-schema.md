# Attack Flow Format

Attack Flow represents the linkage of adversary behavior for a given attack flow . 

The type, description, and required attributes of each field are provided in the subsequent sections along with an example.

TODO: Visual for the Attack Flow model / Data Dictionary.

*Entity Diagram for Attack Flow Format*

## TODOs / Open Items
1. Extension point for properties not defined on Actions/Assets

## Data Dictionary
### Top Level Metadata Fields
 
| Name | Type | Required | Description |
|------|------|----------|-------------|
| type | String | yes | One of `attack-flow` or `attack-flow-pattern` to indicate the type of this Attack Flow or Pattern. |
| id | String | yes | The UUID-formatted identifier for this Attack Flow or Pattern. |
| name | String | yes | The name of the Attack Flow or Pattern. |
| version | String | yes | The version of the Attack Flow format used in this file. Currently `dev`. |
| created | Timestamp | yes | Creation time of the Attack Flow or Pattern.<br /> Format: `YYYY-MM-DDThh:mm:ss.ssssssZ` |
| author | String | no | The author of the Attack Flow or Pattern. |
| description | String | no | The description of the Attack Flow or Pattern. |
| actions | List of Action objects | yes | The list of Action Nodes in the Attack Flow or Pattern. |
| assets | List of Asset objects | yes | The list of Asset Nodes in the Attack Flow or Pattern. |
| relationships | List of Relationship objects | yes | The list of Relationship Edges in the Attack Flow or Pattern. |

### Action object Fields
An action object describes a discrete action for one step in an attack flow(ex: ATT&CK technique).
 
| Name | Type | Required | Description |
|------|------|----------|-------------|
| type | String | yes | MUST be `action` |
| id | String | yes | The UUID-formatted id of the action. |
| name | String | yes | The name of the action. May be an ATT&CK technique name. |
| description | String | yes | A description of the action. |
| timestamp | Timestamp | no | The timestamp when this action was observed. Format: `YYYY-MM-DDThh:mm:ss.ssssssZ` |
| reference | String | no | A reference for the action. May be a URL to an ATT&CK technique. |
| properties | List of Strings | no | The list of properties associated with this action object. |
| succeeded | Float | no | float from 0 (failed) to 1 (succeeded) or distribution representing the probability that action succeeded in its effects. Any effects which may be separable should be defined through a separate action. Assumed to be 1 (100% ~ TRUE) if not included. |
| confidence | Float | no | float from 0 to 1 or distribution representing the confidence that the action succeeded. Assumed to be 1 (100% ~ ground truth) if not included. |
| logic_operator | String | yes | `AND` means that all input nodes/trees must be true in order for this Action to succeed. `OR` means that one input node/tree must be true in order for this Action to succeed. The returned 'success' state should match the 'state' used on assets. TBD extension point |

### Asset object Fields
An asset object describes a resource or capability that is being acted on or is involved with an action object.

| Name | Type | Required | Description |
|------|------|----------|-------------|
| type | String | yes | The type of the object. MUST be `action`. |
| id | String | yes | The UUID-formatted id of the action. |
| state | String | no | A property that may be used as a transient string representing the state of the object during a point in time representing the current state of the system. The sum of all object states is the state of the system. This may be as simple as "compromised", the Confidentiality, Integrity, Availability triad, DIMFUI (Degradation, Interruption, Modification, Fabrication, Unauthorized Use, and Interception), or it may even be an arbitrary string. If not included, it is assumed that the state is 'compromised' after a parent action succeeds. |
| properties | List of Strings | no | The list of properties associated with the asset. |

### Relationship object Fields.
A relationship links an Action to an Object or an Object to an Action.

| Name | Type | Required | Description |
|------|------|----------|-------------|
| type | String | yes | The type of the object. MUST be `relationship`. |
| id | String | yes | The UUID-formatted id of the relationship. |
| label | String | yes | The type of the relationship. e.g., `modifies` |
| source | String | yes | The source Action ID or Asset ID for this relationship. |
| destination | String | yes | The destination Asset ID or Action ID for this relationship. If the source is an Action, this MUST be an Asset. If the source is an Asset, this MUST be an Action. |

### Relationships

| Source | Label | Destination | Description |
|--------|-------|-------------|-------------|
| Action | actor_of | Asset | The person identified by the asset caused the action to happen |



## Example Attack Flow 
NOTE: Serialization format TBD. Could be JSON, YAML, CSV, or something else.

<img src="/data/action-object-tesla.png" width="528px">

*Visualization of Tesla breach*

```
type: attack-flow
id: attack-flow--00
name: 'Tesla Breach Flow'
version: 1.0
created: 2021-09-29
modified: 2021-09-29
author: Center for Threat-Informed Defense (CTID)
description: Attack Flow for Tesla Breach (2018)
tags:
  - AWS
  - Cloud
  - Containers
  - Kubernetes
  - S3
start-action-id:
  - action--00
comments: >-
  A quick draft using Version 0.2 of the Actions/Objects Model and the Tesla breach described in
  https://www.zdnet.com/article/tesla-systems-used-by-hackers-to-mine-cryptocurrency/
sightings:
  - type: report
    id: report--00
    name: 'Tesla cloud systems exploited by hackers to mine cryptocurrency'
    report_type: campaign
    published: 2018-02-20
    description: >-
      Updated: Researchers have discovered that Tesla's AWS cloud systems were compromised for the
      purpose of cryptojacking.
    external_references: 'https://www.zdnet.com/article/tesla-systems-used-by-hackers-to-mine-cryptocurrency/'
actions:
  - type: action
    id: action--00
    name: 'External Remote Services'
    description: >-
      Adversary accesses unsecured Kubernetes dashboard, gaining administrative console access
    external_references:
      - external_id: T1133
        source_name: mitre-attack
        url: https://attack.mitre.org/techniques/T1133
    x-attack-flow-relative-time: 00:00.000Z
    requirements:
      - object--00
      - object--01
    outputs:
      - object--02
      - object--03
    properties: properties--00
  - type: action
    id: action--01
    name: 'Deploy Container'
    description: >-
      Adversary deploys one/more containers to run cryptomining software
    external_references:
      - external_id: T1610
        source_name: mitre-attack
        url: https://attack.mitre.org/techniques/T1610
    x-attack-flow-relative-time: 01:00.000Z
    requirements:
      - object--02
    outputs:
      - object--04
      - object--05
    properties: properties--01
  - type: action
    id: action--02
    name: 'Resource Hijacking'
    description: >-
      Adversary container(s) run cryptomining software using system resources
    external_references:
      - external_id: T1496
        source_name: mitre-attack
        url: https://attack.mitre.org/techniques/T1496
    x-attack-flow-relative-time: 02:00.000Z
    requirements:
      - object--04
      - object--05
    outputs:
      - object--06
    properties: properties--02
  - type: action
    id: action--03
    name: 'Unsecured Credentials: Credentials in Files'
    description: >-
      Adversary finds AWS credentials stored in accessible Kubernetes cluster secrets
    external_references:
      - external_id: T1552.001
        source_name: mitre-attack
        url: https://attack.mitre.org/techniques/T1552/001
    x-attack-flow-relative-time: 03:00.000Z
    requirements:
      - object--02
      - object--03
    outputs:
      - object--07
    properties: properties--03
  - type: action
    id: action--04
    name: 'Valid Accounts: Cloud Accounts'
    description: >-
      Adversary uses stolen AWS credentials to authenticate to AWS
    external_references:
      - external_id: T1078.004
        source_name: mitre-attack
        url: https://attack.mitre.org/techniques/T1078/004
    x-attack-flow-relative-time: 04:00.000Z
    requirements:
      - object--07
    outputs:
      - object--08
    properties: properties--04
  - type: action
    id: action--05
    name: 'Data from Cloud Storage Object'
    description: >-
      Adversary uses AWS access to collect non-public Tesla information from accessible S3
      bucket(s)
    external_references:
      - external_id: T1530
        source_name: mitre-attack
        url: https://attack.mitre.org/techniques/T1530
    x-attack-flow-relative-time: 05:00.000Z
    requirements:
      - object--08
    outputs:
      - object--09
    properties: properties--05
objects:
  - type: object
    id: object--00
    properties:
  - type: object
    id: object--01
    properties:
  - type: object
    id: object--02
    properties:
  - type: object
    id: object--03
    properties:
  - type: object
    id: object--04
    properties:
  - type: object
    id: object--05
    properties:
  - type: object
    id: object--06
    properties:
  - type: object
    id: object--07
    properties:
  - type: object
    id: object--08
    properties:
  - type: object
    id: object--09
    properties:
```
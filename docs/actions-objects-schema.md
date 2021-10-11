# Attack Flow Format

The attack flow format shown below represents the linkage of adversary behavior for a given attack flow with the accompanying data on the reports and relationships for the steps. The type, description, and required attributes of each field are provided in the subsequent sections along with an example.

<img src="/data/action-object-model.png" width="900px">

*Entity Diagram for Attack Flow Format*

## Data Dictionary
### Top Level Metadata Fields
 
| Name | Type | Required | Description |
|------|------|----------|-------------|
| type | String | yes | The attack flow or attack flow pattern type |
| id | String | yes | The unique identifier for this file. |
| name | String | yes | The name of the attack flow or pattern represented in this file. |
| version | String | yes | The version of the attack flow format used in this file. |
| created | Timestamp | yes | Creation time of this file.<br /> Format:  2021-01-01 |
| modified | Timestamp | no | Last modified time of this mapping file.<br /> Format:  2021-01-01 |
| author | String | no | The author of this file. |
| description | String | yes | The description of the attack flow |
| tags | List of Strings | yes | The list of tags/key words for this attack flow to allow for aggregation and search of subsets of flows. |
| start-step-id | String | yes | The ID for the starting point of the flow object. |
| sightings | List of Report objects | yes	| A list of report objects that provide the intelligence used for generating the attack flow model represented in the file. |
| actions | List of Action objects | yes | The list of actions that represent activity in the attack flow. |
| assets | List of Asset objects | yes | The list of asset objects the represent resources in the attack flow. |
| comments | String | no | Document any assumptions or comments on the attack flow. |




### Action object Fields
An action object describes a discrete action for one step in an attack flow(ex: ATT&CK technique).
 
| Name | Type | Required | Description |
|------|------|----------|-------------|
| type | String | yes | The type of the object, should be action. |
| id | String | yes | The id of the action. |
| name | String | yes | The name of the action, may be an ATT&CK technique name. |
| description | String | yes | A description of the action. |
| external_references | List of Reference objects | yes | A list of the references for the given action, may be a specific ATT&CK technique id |
| x-attack-flow-relative-time | String | yes | The relative time elapes between the first and last step linked by the relationship. |
| requirements | List of ids | yes | The list of action or asset objects that precede this action object in the attack flow. |
| outputs | List of ids | yes | The list of action or asset objects that follow this action object in the attack flow. |
| properties | List of Strings | no | The list of properties associated with this action object. | 




### Asset object Fields
An asset object describes a resource or capability that is being acted on or is involved with an action object.

| Name | Type | Required | Description |
|------|------|----------|-------------|
| type | String | yes | The type of the object, should be action. |
| id | String | yes | The id of the action. |
| properties | List of Strings | no | The list of properties associated with this asset object. | 



### Reference Object Fields
A Reference object contains a reference that describes the given action, this may be an ATT&CK reference.
 
| Name | Type | Required | Description |
|------|------|----------|-------------|
| external_id | String | yes | The unique id for the object, may be a ATT&CK technique id. |
| source_name | String | yes | The name of the reference, may be an ATT&CK technique name. |
| url | String | yes | The URL link for the reference. |




### Report Object Fields
A Report Object provides information on the intelligence report which provides the data on the steps and relationships of the attack flow.
 
| Name | Type | Required | Description |
|------|------|----------|-------------|
| type | String | yes | The type of the object, should be report. |
| id | String | yes | The ID of the report. |
| name | String | yes |The name of the report. |
| report-type | String | yes | The type of the report. Ex: [campaign] |
| published | Date | yes | The time the report was published |
| description | String | yes | The description of the report. |
| object_refs	| List of IDs | no | The list of steps and relationships referred to by this report.|
| external_references | List of URLs | yes | The list of links to the intelligence reports referenced in the report object |



## Example Attack Flow 

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
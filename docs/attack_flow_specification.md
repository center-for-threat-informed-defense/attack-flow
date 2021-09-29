# Attack Flow Format

The attack flow format shown below represents the linkage of adversary behavior for a given attack flow with the accompanying data on the reports and relationships for the steps. The type, description, and required attributes of each field are provided in the subsequent sections along with an example.

<img src="/data/flow_diagram.png" width="900px">

*Entity Diagram for Attack Flow Format*

## Data Dictionary
### Top Level Metadata Fields
 
| Name | Type | Required | Description |
|------|------|----------|-------------|
| type | String | yes | The attack flow or attack flow pattern type |
| spec_version | String | yes | The version of the STIX specification used |
| name | String | yes | The name of the attack flow or pattern represented in this file. |
| version | String | yes | The version of the attack flow format used in this file. |
| created | Timestamp | yes | Creation time of this file.<br /> Format:  2021-01-01 |
| modified | Timestamp | no | Last modified time of this mapping file.<br /> Format:  2021-01-01 |
| author | String | no | The author of this file. |
| id | String | yes | The unique identifier for this file. |
| description | String | yes | The description of the attack flow |
| tags | List of Strings | yes | The list of tags/key words for this attack flow to allow for aggregation and search of subsets of flows. |
| start-step-id | String | yes | The ID for the starting point of the flow object. |
| flow-data | List of Step and/or Relationship objects | yes | The list of step and relationship objects that represent the attack flow. |
| comments | String | no | Document any assumptions or comments on the attack flow. |
| sightings_refs | List of Report objects | yes	| A list of report objects that provide the intelligence used for generating the attack flow model represented in the file. |





### Step Object Fields
A step object contains a list of attack-patterns that make up a discrete step in an attack flow.
 
| Name | Type | Required | Description |
|------|------|----------|-------------|
| type | String | yes | The type of the object, should be step. |
| id | String | yes | The id of the step. |
| attack-patterns | List of attack-pattern objects | yes | A list of the attack patterns for this step. |




### Relationship Object Fields
A relationship object describes the relationship between two step objects.
 
| Name | Type | Required | Description |
|------|------|----------|-------------|
| type | String | yes | The type of the object, should be relationship. |
| id | String | yes | The ID of the relationship. |
| tags | List of Strings | yes | The list of tags/key words for this relationship. |
| relationship-type | String | yes | The type of the relationship between the two linked steps. |
| source_ref | String | yes | The ID of the step object that occured first in the set of steps linked by the relationship. |
| target_ref | String | yes | The ID of the step object that occured last in the set of steps linked by the relationship. |
| confidence | String | yes | The value representing the confidence in the relationship between the linked steps. |
| x-attack-flow-relative-time | String | yes | The relative time elapes between the first and last step linked by the relationship. |




### Attack-Pattern Object Fields
A attack-pattern object describes a discrete tactic, technique, or procedure derived from the adversary behavior.
 
| Name | Type | Required | Description |
|------|------|----------|-------------|
| type | String | yes | The type of the object, should be attack-pattern. |
| id | String | yes | The ID of the attack-pattern. |
| name | String | yes | The name of the attack-pattern. If using ATT&CK techniques, this would be the name of the technique. Ex: 'Masquerading' |
| tags | List of Strings | yes | The list of tags/key words for this attack-pattern. |
| description | String | yes | The description of the attack-pattern. |
| external_references | List of Technique Objects | yes | The list of technique objects described in the attack-pattern |




### Technique Object Fields
A technique object contains the reference to a ATT&CK technique.
 
| Name | Type | Required | Description |
|------|------|----------|-------------|
| external_id | String | yes | The ATT&CK ID of the technique. |
| source_name | String | yes | The name of the ATT&CK technique. |
| url | String | yes | The link to the ATT&CK technique page in the ATT&CK Matrix. |




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



<img src="/data/tesla_diagram.png" width="528px">

*Visualization of Tesla breach*

## Example Attack Flow 

```
{
   "type": "attack-flow",
   "spec_version" : "2.1",
   "name": "Tesla Breach Flow",
   "version": 1,
   "modified": "2021-08-23T00:00:00.000Z",
   "author": "Center for Threat-Informed Defense (CTID)",
   "id": "attack-flow--00",
   "description": "ATT&CK Flow for Tesla Breach (2018)",
   "tags": [
      "AWS",
      "Cloud",
      "Containers",
      "Kubernetes",
      "S3"
   ],
   "start_step_id": [
      "step--00"
   ],
   "flow-data": [
      {
         "type": "step",
         "id": "step--00",
         "attack_patterns": [
            {
               "type": "attack-pattern",
               "id": "attack-pattern--00",
               "name": "External Remote Services",
               "tags": [
                  "Kubernetes"
               ],
               "description": "Adversary accesses unsecured Kubernetes dashboard, gaining administrative console access",
               "external_references": [
                  {
                     "external_id": "T1133",
                     "source_name": "mitre-attack",
                     "url": "https://attack.mitre.org/techniques/T1133"
                  }
               ]
            }
         ]
      },
      {
         "type": "relationship",
         "id": "relationship--00",
         "relationship_type": "step-flow",
         "source_ref": "step--00",
         "target_ref": "step--01",
         "confidence": "strong",
         "x-attack-flow-relative-time": "20:00.000Z"
      },
      {
         "type": "step",
         "id": "step--01",
         "attack_patterns": [
            {
               "type": "attack-pattern",
               "id": "attack-pattern--01",
               "name": "Deploy Container",
               "tags": [
                  "Kubernetes"
               ],
               "description": "Adversary deploys one/more containers to run cryptomining software",
               "external_references": [
                  {
                     "external_id": "T1610",
                     "source_name": "mitre-attack",
                     "url": "https://attack.mitre.org/techniques/T1610"
                  }
               ]
            }
         ]
      },
      {
         "type": "relationship",
         "id": "relationship--01",
         "relationship_type": "step-flow",
         "source_ref": "step--01",
         "target_ref": "step--02",
         "confidence": "strong",
         "x-attack-flow-relative-time": "21:00.000Z"
      },
      {
         "type": "step",
         "id": "step--02",
         "attack_patterns": [
            {
               "type": "attack-pattern",
               "id": "attack-pattern--02",
               "name": "Resource Hijacking",
               "tags": [
                  "Kubernetes",
                  "Cryptomining"
               ],
               "description": "Adversary container(s) run cryptomining software using system resources",
               "external_references": [
                  {
                     "external_id": "T1496",
                     "source_name": "mitre-attack",
                     "url": "https://attack.mitre.org/techniques/T1496"
                  }
               ]
            }
         ]
      },
      {
         "type": "relationship",
         "id": "relationship--02",
         "relationship_type": "step-flow",
         "source_ref": "step--00",
         "target_ref": "step--03",
         "confidence": "strong",
         "x-attack-flow-relative-time": "20:00.000Z"
      },
      {
         "type": "step",
         "id": "step--03",
         "attack_patterns": [
            {
               "type": "attack-pattern",
               "id": "attack-pattern--03",
               "name": "Unsecured Credentials: Credentials in Files",
               "tags": [
                  "Kubernetes",
                  "AWS"
               ],
               "description": "Adversary finds AWS credentials stored in accessible Kubernetes cluster secrets",
               "external_references": [
                  {
                     "external_id": "T1552.001",
                     "source_name": "mitre-attack",
                     "url": "https://attack.mitre.org/techniques/T1552/001"
                  }
               ]
            }
         ]
      },
      {
         "type": "relationship",
         "id": "relationship--03",
         "relationship_type": "step-flow",
         "source_ref": "step--03",
         "target_ref": "step--04",
         "confidence": "strong",
         "x-attack-flow-relative-time": "40:00.000Z"
      },
      {
         "type": "step",
         "id": "step--04",
         "attack_patterns": [
            {
               "type": "attack-pattern",
               "id": "attack-pattern--04",
               "name": "Valid Accounts: Cloud Accounts",
               "tags": [
                  "AWS"
               ],
               "description": "Adversary uses stolen AWS credentials to authenticate to AWS",
               "external_references": [
                  {
                     "external_id": "T1078.004",
                     "source_name": "mitre-attack",
                     "url": "https://attack.mitre.org/techniques/T1078/004"
                  }
               ]
            }
         ]
      },
      {
         "type": "relationship",
         "id": "relationship--04",
         "relationship_type": "step-flow",
         "source_ref": "step--04",
         "target_ref": "step--05",
         "confidence": "strong",
         "x-attack-flow-relative-time": "60:00.000Z"
      },
      {
         "type": "step",
         "id": "step--05",
         "attack_patterns": [
            {
               "type": "attack-pattern",
               "id": "attack-pattern--05",
               "name": "Data from Cloud Storage Object",
               "tags": [
                  "AWS",
                  "S3"
               ],
               "description": "Adversary uses AWS access to collect non-public Tesla information from accessible S3 bucket(s)",
               "external_references": [
                  {
                     "external_id": "T1530",
                     "source_name": "mitre-attack",
                     "url": "https://attack.mitre.org/techniques/T1530"
                  }
               ]
            }
         ]
      }
   ],
   "comments": "A quick draft using Version 0.2 of this model and the Tesla breach described in https://www.zdnet.com/article/tesla-systems-used-by-hackers-to-mine-cryptocurrency/",
   "sightings_refs": [
      {
         "type": "report",
         "id": "report--00",
         "name": "Tesla cloud systems exploited by hackers to mine cryptocurrency",
         "report_type": "campaign",
         "published": "2018-02-20T00:00:00.000Z",
         "description": "Updated: Researchers have discovered that Tesla's AWS cloud systems were compromised for the purpose of cryptojacking.",
         "object_refs": [
            "step--00",
            "step--01",
            "step--02",
            "step--03",
            "step--04",
            "step--05",
            "relationship--00",
            "relationship--01",
            "relationship--02",
            "relationship--03",
            "relationship--04"
         ],
         "external_references": "https://www.zdnet.com/article/tesla-systems-used-by-hackers-to-mine-cryptocurrency/"
      }
   ]
}
```
## Attack Flow Model

| Node   | Property     | Definition | Type |
|--------|--------------| ---------- | ---- |
| Action | uuid         | The identifier for this Action | uuid |
| Action | id           | The Action's ID (e.g., T12345) | text |
| Action | name         | Name of the action. e.g., the Technique Name | text |
| Action | reference    | A link to the definition of the action | text |
| Object | uuid         | The identifier for this Object | UUID |
| Object | \<property\> | TBD properties | TBD Properties |

Model Rules:
1. Relationships MUST be between an Action and an Object

Example:
```json
{
  "TBD": "TBD"
}
```

## Attack Flow Schema
TBD
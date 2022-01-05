# Working with ATT&CK Flow

This repository includes some tools for working with ATT&CK Flow documents.

## Validation

To validate an ATT&CK Flow document, you need to choose a schema version to
validate against. Then run the following command, replacing the

```
$ python -m attack_flow.scripts.validate_doc schema/attack-flow-2022-01-05-draft.json <ATTACK_FLOW_JSON>
```

This command can validate multiple files at once, e.g.:

```
$ python -m attack_flow.scripts.validate_doc schema/attack-flow-2022-01-05-draft.json schema/attack-flow-example.json corpus/*
schema/attack-flow-example.json is valid
corpus/dfir_report_zero_to_domain_admin.json is valid
```

# GraphViz Export

Attack Flows can be converted into GraphViz format (i.e. the "dot" language)

```
python -m attack_flow.scripts.graphviz schema/attack-flow-example.json attack_flow-example.dot
```

To render a graphic, you need [GraphViz
installed](https://www.graphviz.org/download/), then:

```
$ dot -Tpng -O attack-flow-example.dot
```

This produces a file  named `attack-flow-example.png`.

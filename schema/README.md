# Attack Flow: JSON Schema

This directory contains a [JSON Schema](https://json-schema.org/) for Attack Flow. To create a document within this schema, add the `$schema` property to the root level of your document and set the value to the schema URI.

```json
{
    "$schema": "./attack-flow-schema.json",
    ...
}
```

If your text editor supports JSON Schema, then it can provide validation and autocompletion for your Attack Flow documents.

The `attack_flow` package contains command line tools for working with scripts.
For example, to validate Attack Flow documents:

```
$ python -m attack_flow.scripts.validate_doc schema/attack-flow-schema.json
doc1.json doc2.json doc3.json
doc1.json is valid
doc2.json is not valid: 'created' is a required property
doc3.json is valid
Add --verbose for more details.
```

To generate documentation for the schema:

```
$ python -m attack_flow.scripts.generate_schema_docs schema/attack-flow-schema.json docs/actions-objects-schema.md
```

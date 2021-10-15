# Attack Flow: JSON Schema

This directory contains a [JSON Schema](https://json-schema.org/) for Attack Flow. To create a document within this schema, add the `$schema` property to the root level of your document and set the value to the schema URI.

```json
{
    "$schema": "./attack-flow-schema.json",
    ...
}
```

If your text editor supports JSON Schema, then it can provide validation and autocompletion for your Attack Flow documents.

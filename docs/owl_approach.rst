Translation to OWL/RDF
======================

Overview
--------
The Resource Description Framework (`RDF <https://www.w3.org/RDF/>`_) and the Web Ontology Language (`OWL <https://www.w3.org/OWL/>`_) are web standards designed to ease data aggregation across sources and contexts.
ATT&CK Flow users may find it convenient to represent their flows in RDF in order to use query tools such as `SPARQL <https://www.w3.org/TR/sparql11-query/>`_ or graph databases such as `Blazegraph <https://blazegraph.com/>`_.

The purpose of this document is to outline an approach for translating flows to RDF through the use of the JSON-LD standard (`JSON for Linking Data <https://json-ld.org/>`_). The ATT&CK Flow project does not provide an official translation of flows into RDF, nor a suggest a particular vocabulary. Such a translation may become possible after the OASIS Threat Actor Context (`TAC <https://www.oasis-open.org/committees/tc_home.php?wg_abbrev=tac>`_)  Technical Committee releases their `ontology <https://github.com/oasis-tcs/tac-ontology>`_ for representing STIX documents as RDF.



The Context
-----------

In JSON-LD, a top-level `@context` property provides document-wide definitions for mapping JSON structures into RDF triples. Below we provide a sample context for the Tesla flow.

.. code-block:: json-ld
    :caption: Sample context for converting the Tesla flow to JSON-LD.

    {
        "@context": {
            "@base": "http://example.com/kb/",
            "@vocab": "http://docs.oasis-open.org/cti/ns/stix#",
            "id": "@id",
            "objects": "@graph",
            "xsd": "http://www.w3.org/2001/XMLSchema#",
            "stix": "http://docs.oasis-open.org/cti/ns/stix#",
            "kb": "http://example.com/kb/",
            "af": "http://example.com/af#",
            "created": {
                "@id": "stix:created",
                "@type": "xsd:dateTime"
            },
            "modified": {
                "@id": "stix:modified",
                "@type": "xsd:dateTime"
            },
            "first_seen": {
                "@id": "stix:first_seen",
                "@type": "xsd:dateTime"
            },
            "last_seen": {
                "@id": "stix:last_seen",
                "@type": "xsd:dateTime"
            },
            "url": {
                "@id": "stix:url",
                "@type": "@id"
            },
            "start_refs": {
                "@id": "af:start_ref",
                "@type": "@id"
            },
            "effect_refs": {
                "@id": "af:effect_ref",
                "@type": "@id"
            },
            "technique_ref": {
                "@id": "af:technique_ref",
                "@type": "@id"
            },
            "source_ref": {
                "@id": "af:source_ref",
                "@type": "@id"
            }
        }
    }

Some important notes on the above context:

* The `@base` URI and `kb` namespace should be set to something unique per document.
* The `stix` namespace should be checked against the most recent TAC ontology release, and each of the standard STIX properties should be matched against the corresponding type in TAC.
* Unless ATT&CK flows releases its own ontology aligned against TAC, the `af` namespace should be set to a consistent URI within your organization.

Objects
-------

Once the `@context` has been defined, a `@type` property must be added to all JSON objects in the document. Care should be taken to map the objects to the appropriate type in the TAC ontology, as STIX JSON and TAC RDF types have different names for the same objects.

.. code-block:: json-ld
    :caption: Top-level properties from the Tesla flow converted to JSON-LD. The `@context` value should be filled in as above.

    {
        "@context": {},
        "type": "bundle",
        "@type": "stix:Report",
        "id": "bundle--9cfa7cd7-9fb1-426b-ba9b-afb02fe88c99",
    }

.. code-block:: json-ld
    :caption: Sample object from the Tesla flow converted to JSON-LD.

    {
        "type": "attack-flow",
        "@type": "af:attack-flow",
        "spec_version": "2.1",
        "id": "attack-flow--e9ec3a4b-f787-4e81-a3d9-4cfe017ebc2f",
        "created_by_ref": "identity--61d33cc7-dc05-4657-8c58-157c456651c0",
        "created": "2022-08-24T23:25:58.000Z",
        "modified": "2022-08-24T23:25:58.000Z",
        "name": "Tesla Kubernetes Breach",
        "description": "A vulnerable Kubernetes console leads to cryptojacking and exposure of AWS storage credentials.",
        "scope": "incident",
        "start_refs": [
            "attack-condition--0d8b4b52-5f61-42f1-8b4e-f09fca687233"
        ],
        "external_references": [
            {
                "@type": "stix:reference",
                "source_name": "The Cryptojacking Epidemic",
                "description": "RedLock CSI Team. Feb 20 2018.",
                "url": "https://blog.redlock.io/cryptojacking-tesla"
            }
        ],
        "extensions": {
            "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                "extension_type": "new-sdo"
            }
        }
    }

Converting to RDF
-----------------

There are many tools for converting JSON-LD into RDF. In the above examples, we have stayed with the prescripts of JSON-LD 1.0 for maximum compatibility. Below, we use `RDF Toolkit <https://github.com/edmcouncil/rdf-toolkit>`_ to convert the flow into `Turtle <https://www.w3.org/TR/turtle/>`_ (an alternative RDF syntax):

.. code-block:: console

    $ java -jar rdf-toolkit.jar -sfmt json-ld -tfmt turtle -s tesla-ld.json -t tesla-ld.owl


.. code-block:: turtle
    :caption: Snippet from the above conversion of a Flow object into Turtle syntax

    kb:attack-flow--e9ec3a4b-f787-4e81-a3d9-4cfe017ebc2f
        a af:attack-flow ;
        stix:created "2022-08-24T23:25:58.000Z"^^xsd:dateTime ;
        stix:created_by_ref "identity--61d33cc7-dc05-4657-8c58-157c456651c0" ;
        stix:description "A vulnerable Kubernetes console leads to cryptojacking and exposure of AWS storage credentials." ;
        stix:extensions _:blank09 ;
        stix:external_references _:blank02 ;
        stix:modified "2022-08-24T23:25:58.000Z"^^xsd:dateTime ;
        stix:name "Tesla Kubernetes Breach" ;
        stix:scope "incident" ;
        stix:spec_version "2.1" ;
        stix:type "attack-flow" ;
        af:start_ref kb:attack-condition--0d8b4b52-5f61-42f1-8b4e-f09fca687233 ;
        .

    _:blank02
        a stix:reference ;
        stix:description "RedLock CSI Team. Feb 20 2018." ;
        stix:source_name "The Cryptojacking Epidemic" ;
        stix:url <https://blog.redlock.io/cryptojacking-tesla> ;
    
    _:blank09
        stix:extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4 _:blank23 ;
        .
    
    _:blank23
        stix:extension_type "new-sdo" ;
        .
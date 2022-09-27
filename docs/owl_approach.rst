Translation to OWL/RDF
======================

Overview
--------
The Resource Description Framework (`RDF <https://www.w3.org/RDF/>`_) and the Web Ontology Language (`OWL <https://www.w3.org/OWL/>`_) are web standards designed to ease data aggregation across sources and contexts.
Attack Flow users may find it convenient to represent their flows in RDF in order to use query tools such as `SPARQL <https://www.w3.org/TR/sparql11-query/>`_ or graph databases such as `Blazegraph <https://blazegraph.com/>`_.

The purpose of this document is to outline an approach for translating flows to RDF through the use of the JSON-LD standard (`JSON for Linking Data <https://json-ld.org/>`_).

.. note::
    The Attack Flow project does not provide an official translation of flows into RDF, nor a suggest a particular vocabulary. Such an "official" translation may become possible after the OASIS Threat Actor Context (`TAC <https://www.oasis-open.org/committees/tc_home.php?wg_abbrev=tac>`_)  Technical Committee releases their `ontology <https://github.com/oasis-tcs/tac-ontology>`_ for representing STIX reports in RDF.



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

* The ``@base`` URI and ``kb`` namespace should be set to something unique per document.
* The ``stix`` namespace should be checked against the most recent TAC ontology release, and each of the standard STIX properties should be matched against a corresponding type in TAC.
* Because the Attack Flow project has not released its own ontology aligned against the TAC ontology, we recommend that the ``af`` namespace be set to a consistent URI within your organization.

Objects
-------

Once the ``@context`` has been defined, a ``@type`` property must be added to all JSON objects in the document. Care should be taken to map the objects to the appropriate type in the TAC ontology, as STIX JSON and TAC RDF types have different names for the same objects.

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


.. code-block::
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

Full Code Listing
-----------------

Below, you can find the full conversion of the Tesla flow into JSON-LD, as well as the resulting RDF in Turtle syntax.

.. raw:: html

   <details>
   <summary><a>Full JSON-LD for the Tesla flow</a></summary>

.. code-block:: json-ld
    :caption: Full code listing for the JSON-LD Tesla flow

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
            },
        "type": "bundle",
        "@type": "stix:Report",
        "id": "bundle--9cfa7cd7-9fb1-426b-ba9b-afb02fe88c99",
        "objects": [
            {
                "type": "extension-definition",
                "@type": "stix:ExtensionDefinition",
                "id": "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4",
                "spec_version": "2.1",
                "name": "Attack Flow",
                "description": "Extends STIX 2.1 with features to create Attack Flows.",
                "created": "2022-08-02T19:34:35.143Z",
                "modified": "2022-08-02T19:34:35.143Z",
                "created_by_ref": "identity--d673f8cb-c168-42da-8ed4-0cb26725f86c",
                "schema": "./attack-flow-schema-2.0.0.json",
                "version": "2.0.0",
                "extension_types": [
                    "new-sdo"
                ],
                "external_references": [
                    {
                        "@type": "stix:reference",
                        "source_name": "Documentation",
                        "description": "Documentation for Attack Flow",
                        "url": "https://center-for-threat-informed-defense.github.io/attack-flow"
                    },
                    {
                        "@type": "stix:reference",
                        "source_name": "GitHub",
                        "description": "Source code repository for Attack Flow",
                        "url": "https://github.com/center-for-threat-informed-defense/attack-flow"
                    }
                ]
            },
            {
                "type": "identity",
                "@type": "stix:identity",
                "spec_version": "2.1",
                "id": "identity--d673f8cb-c168-42da-8ed4-0cb26725f86c",
                "created_by_ref": "identity--d673f8cb-c168-42da-8ed4-0cb26725f86c",
                "created": "2022-08-02T19:34:35.143Z",
                "modified": "2022-08-02T19:34:35.143Z",
                "name": "MITRE Engenuity Center for Threat-Informed Defense",
                "identity_class": "organization"
            },
            {
                "type": "identity",
                "@type": "stix:identity",
                "spec_version": "2.1",
                "id": "identity--61d33cc7-dc05-4657-8c58-157c456651c0",
                "created_by_ref": "identity--61d33cc7-dc05-4657-8c58-157c456651c0",
                "created": "2022-08-24T23:25:58.000Z",
                "modified": "2022-08-24T23:25:58.000Z",
                "name": "Mark Haase",
                "contact_information": "mhaase@mitre.org",
                "identity_class": "individual"
            },
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
            },
            {
                "type": "attack-condition",
                "@type": "af:attack-condition",
                "spec_version": "2.1",
                "id": "attack-condition--0d8b4b52-5f61-42f1-8b4e-f09fca687233",
                "created": "2022-08-24T23:25:58.000Z",
                "modified": "2022-08-24T23:25:58.000Z",
                "description": "Tesla's Kubernetes dashboard is exposed to the public internet with no password required for access.",
                "on_true_refs": [
                    "attack-action--fcd630b0-9958-43ad-977e-d9e236c14a29"
                ],
                "extensions": {
                    "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                        "extension_type": "new-sdo"
                    }
                }
            },
            {
                "type": "attack-action",
                "@type": "af:attack-action",
                "spec_version": "2.1",
                "id": "attack-action--fcd630b0-9958-43ad-977e-d9e236c14a29",
                "created": "2022-08-24T23:25:58.000Z",
                "modified": "2022-08-24T23:25:58.000Z",
                "technique_id": "T1133",
                "name": "External Remote Services",
                "technique_ref": "attack-pattern--40f5caa0-4cb7-4117-89fc-d421bb493df3",
                "description": "The adversary logs into the Kubernetes console.",
                "confidence": 90,
                "effect_refs": [
                    "attack-action--430a4928-4eef-498d-a5ba-a2c739908a4c",
                    "attack-action--35c10b05-2035-4a72-bf40-a82ee548f363"
                ],
                "extensions": {
                    "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                        "extension_type": "new-sdo"
                    }
                }
            },
            {
                "type": "attack-action",
                "@type": "af:attack-action",
                "spec_version": "2.1",
                "id": "attack-action--430a4928-4eef-498d-a5ba-a2c739908a4c",
                "created": "2022-08-24T23:25:58.000Z",
                "modified": "2022-08-24T23:25:58.000Z",
                "technique_id": "T1610",
                "name": "Deploy Container",
                "technique_ref": "attack-pattern--56e0d8b8-3e25-49dd-9050-3aa252f5aa92",
                "description": "The adversary deploys a new container on the Kubernetes cluster.",
                "confidence": 90,
                "effect_refs": [
                    "attack-operator--31982617-e0c7-4113-a4b0-830783d96fc2"
                ],
                "extensions": {
                    "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                        "extension_type": "new-sdo"
                    }
                }
            },
            {
                "type": "attack-action",
                "@type": "af:attack-action",
                "spec_version": "2.1",
                "id": "attack-action--9f649ddc-687c-4f58-8c72-0a361c460d62",
                "created": "2022-08-24T23:25:58.000Z",
                "modified": "2022-08-24T23:25:58.000Z",
                "technique_id": "T1583.004",
                "name": "Acquire Infrastructure: Server",
                "technique_ref": "attack-pattern--60c4b628-4807-4b0b-bbf5-fdac8643c337",
                "description": "The adversary runs an \"unlisted\" mining pool server on a non-standard port to evade IP and port blocklists.",
                "effect_refs": [
                    "attack-action--16002983-8519-46d6-9a2b-7a983557e3a9"
                ],
                "confidence": 90,
                "extensions": {
                    "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                        "extension_type": "new-sdo"
                    }
                }
            },
            {
                "type": "infrastructure",
                "@type": "af:infrastructure",
                "spec_version": "2.1",
                "id": "infrastructure--cb0106c0-6705-44d7-905f-9a1d855ead11",
                "created": "2022-08-24T23:25:58.000Z",
                "modified": "2022-08-24T23:25:58.000Z",
                "name": "Unlisted Mining Pool",
                "infrastructure_types": [
                    "unknown"
                ]
            },
            {
                "type": "relationship",
                "@type": "af:relationship",
                "spec_version": "2.1",
                "id": "relationship--9ec9afcc-4adf-4324-b32e-3bda5e0dd986",
                "created": "2022-08-24T23:25:58.000Z",
                "modified": "2022-08-24T23:25:58.000Z",
                "relationship_type": "related-to",
                "source_ref": "attack-action--9f649ddc-687c-4f58-8c72-0a361c460d62",
                "target_ref": "infrastructure--cb0106c0-6705-44d7-905f-9a1d855ead11"
            },
            {
                "type": "attack-action",
                "@type": "af:attack-action",
                "spec_version": "2.1",
                "id": "attack-action--16002983-8519-46d6-9a2b-7a983557e3a9",
                "created": "2022-08-24T23:25:58.000Z",
                "modified": "2022-08-24T23:25:58.000Z",
                "technique_id": "T0884",
                "name": "Connection Proxy",
                "technique_ref": "attack-pattern--cd25c1b4-935c-4f0e-ba8d-552f28bc4783",
                "description": "The adversary proxies their mining pool through Cloudflare CDN.",
                "effect_refs": [
                    "attack-operator--31982617-e0c7-4113-a4b0-830783d96fc2"
                ],
                "confidence": 90,
                "extensions": {
                    "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                        "extension_type": "new-sdo"
                    }
                }
            },
            {
                "type": "attack-operator",
                "@type": "af:attack-operator",
                "spec_version": "2.1",
                "id": "attack-operator--31982617-e0c7-4113-a4b0-830783d96fc2",
                "created": "2022-08-24T23:25:58.000Z",
                "modified": "2022-08-24T23:25:58.000Z",
                "operator": "AND",
                "effect_refs": [
                    "attack-action--b5f27faa-f66d-438a-80dc-878ade2644fd"
                ],
                "extensions": {
                    "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                        "extension_type": "new-sdo"
                    }
                }
            },
            {
                "type": "attack-action",
                "@type": "af:attack-action",
                "spec_version": "2.1",
                "id": "attack-action--b5f27faa-f66d-438a-80dc-878ade2644fd",
                "created": "2022-08-24T23:25:58.000Z",
                "modified": "2022-08-24T23:25:58.000Z",
                "technique_id": "T1496",
                "name": "Resource Highjacking",
                "technique_ref": "attack-pattern--cd25c1b4-935c-4f0e-ba8d-552f28bc4783",
                "description": "The adversary runs cryptomining software in the container, configured to use their private mining pool.",
                "confidence": 90,
                "extensions": {
                    "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                        "extension_type": "new-sdo"
                    }
                }
            },
            {
                "type": "relationship",
                "@type": "af:relationship",
                "spec_version": "2.1",
                "id": "relationship--9ec9afcc-4adf-4324-b32e-3bda5e0dd986",
                "created": "2022-08-24T23:25:58.000Z",
                "modified": "2022-08-24T23:25:58.000Z",
                "relationship_type": "related-to",
                "source_ref": "attack-action--b5f27faa-f66d-438a-80dc-878ade2644fd",
                "target_ref": "infrastructure--cb0106c0-6705-44d7-905f-9a1d855ead11"
            },
            {
                "type": "attack-action",
                "@type": "af:attack-action",
                "spec_version": "2.1",
                "id": "attack-action--35c10b05-2035-4a72-bf40-a82ee548f363",
                "created": "2022-08-24T23:25:58.000Z",
                "modified": "2022-08-24T23:25:58.000Z",
                "technique_id": "T1552.001",
                "name": "Unsecured Credentials: Credentials In Files",
                "technique_ref": "attack-pattern--837f9164-50af-4ac0-8219-379d8a74cefc",
                "description": "The adversary could view plaintext AWS keys in the Kubernetes console.",
                "confidence": 0,
                "effect_refs": [
                    "attack-action--834f885b-718d-47d7-b94d-a7c15f0bcf34"
                ],
                "extensions": {
                    "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                        "extension_type": "new-sdo"
                    }
                }
            },
            {
                "type": "attack-action",
                "@type": "af:attack-action",
                "spec_version": "2.1",
                "id": "attack-action--834f885b-718d-47d7-b94d-a7c15f0bcf34",
                "created": "2022-08-24T23:25:58.000Z",
                "modified": "2022-08-24T23:25:58.000Z",
                "technique_id": "T1078.004",
                "name": "Valid Accounts: Cloud Accounts",
                "technique_ref": "attack-pattern--f232fa7a-025c-4d43-abc7-318e81a73d65",
                "description": "The adversary authenticates to AWS S3 using the discovered credentials.",
                "confidence": 0,
                "effect_refs": [
                    "attack-action--24728445-761a-42d6-afd8-548c82669544"
                ],
                "extensions": {
                    "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                        "extension_type": "new-sdo"
                    }
                }
            },
            {
                "type": "attack-action",
                "@type": "af:attack-action",
                "spec_version": "2.1",
                "id": "attack-action--24728445-761a-42d6-afd8-548c82669544",
                "created": "2022-08-24T23:25:58.000Z",
                "modified": "2022-08-24T23:25:58.000Z",
                "technique_id": "T1530",
                "name": "Data from Cloud Storage Object",
                "technique_ref": "attack-pattern--3298ce88-1628-43b1-87d9-0b5336b193d7",
                "description": "The adversary can access data in private S3 buckets.",
                "confidence": 0,
                "extensions": {
                    "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
                        "extension_type": "new-sdo"
                    }
                }
            }
        ]
    }

.. raw:: html

   </details>

.. raw:: html

   <details>
   <summary><a>Full RDF/Turtle output for the Tesla workflow</a></summary>

.. code-block::

    @prefix adversary: <http://docs.oasis-open.org/cti/ns/stix/adversary#> .
    @prefix af: <http://example.com/af#> .
    @prefix kb: <http://example.com/kb/> .
    @prefix owl: <http://www.w3.org/2002/07/owl#> .
    @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
    @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
    @prefix stix: <http://docs.oasis-open.org/cti/ns/stix#> .
    @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

    kb:attack-action--16002983-8519-46d6-9a2b-7a983557e3a9
        a af:attack-action ;
        stix:confidence "90"^^xsd:integer ;
        stix:created "2022-08-24T23:25:58.000Z"^^xsd:dateTime ;
        stix:description "The adversary proxies their mining pool through Cloudflare CDN." ;
        stix:extensions _:blank05 ;
        stix:modified "2022-08-24T23:25:58.000Z"^^xsd:dateTime ;
        stix:spec_version "2.1" ;
        stix:technique_id "T0884" ;
        stix:name "Connection Proxy" ;
        stix:type "attack-action" ;
        af:effect_ref kb:attack-operator--31982617-e0c7-4113-a4b0-830783d96fc2 ;
        af:technique_ref kb:attack-pattern--cd25c1b4-935c-4f0e-ba8d-552f28bc4783 ;
        .

    kb:attack-action--24728445-761a-42d6-afd8-548c82669544
        a af:attack-action ;
        stix:confidence "0"^^xsd:integer ;
        stix:created "2022-08-24T23:25:58.000Z"^^xsd:dateTime ;
        stix:description "The adversary can access data in private S3 buckets." ;
        stix:extensions _:blank11 ;
        stix:modified "2022-08-24T23:25:58.000Z"^^xsd:dateTime ;
        stix:spec_version "2.1" ;
        stix:technique_id "T1530" ;
        stix:name "Data from Cloud Storage Object" ;
        stix:type "attack-action" ;
        af:technique_ref kb:attack-pattern--3298ce88-1628-43b1-87d9-0b5336b193d7 ;
        .

    kb:attack-action--35c10b05-2035-4a72-bf40-a82ee548f363
        a af:attack-action ;
        stix:confidence "0"^^xsd:integer ;
        stix:created "2022-08-24T23:25:58.000Z"^^xsd:dateTime ;
        stix:description "The adversary could view plaintext AWS keys in the Kubernetes console." ;
        stix:extensions _:blank08 ;
        stix:modified "2022-08-24T23:25:58.000Z"^^xsd:dateTime ;
        stix:spec_version "2.1" ;
        stix:technique_id "T1552.001" ;
        stix:name "Unsecured Credentials: Credentials In Files" ;
        stix:type "attack-action" ;
        af:effect_ref kb:attack-action--834f885b-718d-47d7-b94d-a7c15f0bcf34 ;
        af:technique_ref kb:attack-pattern--837f9164-50af-4ac0-8219-379d8a74cefc ;
        .

    kb:attack-action--430a4928-4eef-498d-a5ba-a2c739908a4c
        a af:attack-action ;
        stix:confidence "90"^^xsd:integer ;
        stix:created "2022-08-24T23:25:58.000Z"^^xsd:dateTime ;
        stix:description "The adversary deploys a new container on the Kubernetes cluster." ;
        stix:extensions _:blank14 ;
        stix:modified "2022-08-24T23:25:58.000Z"^^xsd:dateTime ;
        stix:spec_version "2.1" ;
        stix:technique_id "T1610" ;
        stix:name "Deploy Container" ;
        stix:type "attack-action" ;
        af:effect_ref kb:attack-operator--31982617-e0c7-4113-a4b0-830783d96fc2 ;
        af:technique_ref kb:attack-pattern--56e0d8b8-3e25-49dd-9050-3aa252f5aa92 ;
        .

    kb:attack-action--834f885b-718d-47d7-b94d-a7c15f0bcf34
        a af:attack-action ;
        stix:confidence "0"^^xsd:integer ;
        stix:created "2022-08-24T23:25:58.000Z"^^xsd:dateTime ;
        stix:description "The adversary authenticates to AWS S3 using the discovered credentials." ;
        stix:extensions _:blank10 ;
        stix:modified "2022-08-24T23:25:58.000Z"^^xsd:dateTime ;
        stix:spec_version "2.1" ;
        stix:technique_id "T1078.004" ;
        stix:name "Valid Accounts: Cloud Accounts" ;
        stix:type "attack-action" ;
        af:effect_ref kb:attack-action--24728445-761a-42d6-afd8-548c82669544 ;
        af:technique_ref kb:attack-pattern--f232fa7a-025c-4d43-abc7-318e81a73d65 ;
        .

    kb:attack-action--9f649ddc-687c-4f58-8c72-0a361c460d62
        a af:attack-action ;
        stix:confidence "90"^^xsd:integer ;
        stix:created "2022-08-24T23:25:58.000Z"^^xsd:dateTime ;
        stix:description 'The adversary runs an "unlisted" mining pool server on a non-standard port to evade IP and port blocklists.' ;
        stix:extensions _:blank04 ;
        stix:modified "2022-08-24T23:25:58.000Z"^^xsd:dateTime ;
        stix:spec_version "2.1" ;
        stix:technique_id "T1583.004" ;
        stix:name "Acquire Infrastructure: Server" ;
        stix:type "attack-action" ;
        af:effect_ref kb:attack-action--16002983-8519-46d6-9a2b-7a983557e3a9 ;
        af:technique_ref kb:attack-pattern--60c4b628-4807-4b0b-bbf5-fdac8643c337 ;
        .

    kb:attack-action--b5f27faa-f66d-438a-80dc-878ade2644fd
        a af:attack-action ;
        stix:confidence "90"^^xsd:integer ;
        stix:created "2022-08-24T23:25:58.000Z"^^xsd:dateTime ;
        stix:description "The adversary runs cryptomining software in the container, configured to use their private mining pool." ;
        stix:extensions _:blank07 ;
        stix:modified "2022-08-24T23:25:58.000Z"^^xsd:dateTime ;
        stix:spec_version "2.1" ;
        stix:technique_id "T1496" ;
        stix:name "Resource Highjacking" ;
        stix:type "attack-action" ;
        af:technique_ref kb:attack-pattern--cd25c1b4-935c-4f0e-ba8d-552f28bc4783 ;
        .

    kb:attack-action--fcd630b0-9958-43ad-977e-d9e236c14a29
        a af:attack-action ;
        stix:confidence "90"^^xsd:integer ;
        stix:created "2022-08-24T23:25:58.000Z"^^xsd:dateTime ;
        stix:description "The adversary logs into the Kubernetes console." ;
        stix:extensions _:blank13 ;
        stix:modified "2022-08-24T23:25:58.000Z"^^xsd:dateTime ;
        stix:spec_version "2.1" ;
        stix:technique_id "T1133" ;
        stix:name "External Remote Services" ;
        stix:type "attack-action" ;
        af:effect_ref
            kb:attack-action--35c10b05-2035-4a72-bf40-a82ee548f363 ,
            kb:attack-action--430a4928-4eef-498d-a5ba-a2c739908a4c
            ;
        af:technique_ref kb:attack-pattern--40f5caa0-4cb7-4117-89fc-d421bb493df3 ;
        .

    kb:attack-condition--0d8b4b52-5f61-42f1-8b4e-f09fca687233
        a af:attack-condition ;
        stix:created "2022-08-24T23:25:58.000Z"^^xsd:dateTime ;
        stix:description "Tesla's Kubernetes dashboard is exposed to the public internet with no password required for access." ;
        stix:extensions _:blank12 ;
        stix:modified "2022-08-24T23:25:58.000Z"^^xsd:dateTime ;
        stix:on_true_refs "attack-action--fcd630b0-9958-43ad-977e-d9e236c14a29" ;
        stix:spec_version "2.1" ;
        stix:type "attack-condition" ;
        .

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

    kb:attack-operator--31982617-e0c7-4113-a4b0-830783d96fc2
        a af:attack-operator ;
        stix:created "2022-08-24T23:25:58.000Z"^^xsd:dateTime ;
        stix:extensions _:blank06 ;
        stix:modified "2022-08-24T23:25:58.000Z"^^xsd:dateTime ;
        stix:operator "AND" ;
        stix:spec_version "2.1" ;
        stix:type "attack-operator" ;
        af:effect_ref kb:attack-action--b5f27faa-f66d-438a-80dc-878ade2644fd ;
        .

    kb:bundle--9cfa7cd7-9fb1-426b-ba9b-afb02fe88c99
        a stix:Report ;
        stix:type "bundle" ;
        .

    kb:extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4
        a stix:ExtensionDefinition ;
        stix:created "2022-08-02T19:34:35.143Z"^^xsd:dateTime ;
        stix:created_by_ref "identity--d673f8cb-c168-42da-8ed4-0cb26725f86c" ;
        stix:description "Extends STIX 2.1 with features to create Attack Flows." ;
        stix:extension_types "new-sdo" ;
        stix:external_references
            _:blank01 ,
            _:blank03
            ;
        stix:modified "2022-08-02T19:34:35.143Z"^^xsd:dateTime ;
        stix:name "Attack Flow" ;
        stix:schema "./attack-flow-schema-2.0.0.json" ;
        stix:spec_version "2.1" ;
        stix:type "extension-definition" ;
        stix:version "2.0.0" ;
        .

    kb:identity--61d33cc7-dc05-4657-8c58-157c456651c0
        a stix:identity ;
        stix:contact_information "mhaase@mitre.org" ;
        stix:created "2022-08-24T23:25:58.000Z"^^xsd:dateTime ;
        stix:created_by_ref "identity--61d33cc7-dc05-4657-8c58-157c456651c0" ;
        stix:identity_class "individual" ;
        stix:modified "2022-08-24T23:25:58.000Z"^^xsd:dateTime ;
        stix:name "Mark Haase" ;
        stix:spec_version "2.1" ;
        stix:type "identity" ;
        .

    kb:identity--d673f8cb-c168-42da-8ed4-0cb26725f86c
        a stix:identity ;
        stix:created "2022-08-02T19:34:35.143Z"^^xsd:dateTime ;
        stix:created_by_ref "identity--d673f8cb-c168-42da-8ed4-0cb26725f86c" ;
        stix:identity_class "organization" ;
        stix:modified "2022-08-02T19:34:35.143Z"^^xsd:dateTime ;
        stix:name "MITRE Engenuity Center for Threat-Informed Defense" ;
        stix:spec_version "2.1" ;
        stix:type "identity" ;
        .

    kb:infrastructure--cb0106c0-6705-44d7-905f-9a1d855ead11
        a af:infrastructure ;
        stix:created "2022-08-24T23:25:58.000Z"^^xsd:dateTime ;
        stix:infrastructure_types "unknown" ;
        stix:modified "2022-08-24T23:25:58.000Z"^^xsd:dateTime ;
        stix:name "Unlisted Mining Pool" ;
        stix:spec_version "2.1" ;
        stix:type "infrastructure" ;
        .

    kb:relationship--9ec9afcc-4adf-4324-b32e-3bda5e0dd986
        a af:relationship ;
        stix:created "2022-08-24T23:25:58.000Z"^^xsd:dateTime ;
        stix:modified "2022-08-24T23:25:58.000Z"^^xsd:dateTime ;
        stix:relationship_type "related-to" ;
        stix:spec_version "2.1" ;
        stix:target_ref "infrastructure--cb0106c0-6705-44d7-905f-9a1d855ead11" ;
        stix:type "relationship" ;
        af:source_ref
            kb:attack-action--9f649ddc-687c-4f58-8c72-0a361c460d62 ,
            kb:attack-action--b5f27faa-f66d-438a-80dc-878ade2644fd
            ;
        .

    _:blank01
        a stix:reference ;
        stix:description "Documentation for Attack Flow" ;
        stix:source_name "Documentation" ;
        stix:url <https://center-for-threat-informed-defense.github.io/attack-flow> ;
        .

    _:blank02
        a stix:reference ;
        stix:description "RedLock CSI Team. Feb 20 2018." ;
        stix:source_name "The Cryptojacking Epidemic" ;
        stix:url <https://blog.redlock.io/cryptojacking-tesla> ;
        .

    _:blank03
        a stix:reference ;
        stix:description "Source code repository for Attack Flow" ;
        stix:source_name "GitHub" ;
        stix:url <https://github.com/center-for-threat-informed-defense/attack-flow> ;
        .

    _:blank04
        stix:extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4 _:blank16 ;
        .

    _:blank05
        stix:extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4 _:blank17 ;
        .

    _:blank06
        stix:extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4 _:blank18 ;
        .

    _:blank07
        stix:extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4 _:blank19 ;
        .

    _:blank08
        stix:extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4 _:blank20 ;
        .

    _:blank09
        stix:extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4 _:blank23 ;
        .

    _:blank10
        stix:extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4 _:blank21 ;
        .

    _:blank11
        stix:extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4 _:blank22 ;
        .

    _:blank12
        stix:extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4 _:blank24 ;
        .

    _:blank13
        stix:extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4 _:blank25 ;
        .

    _:blank14
        stix:extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4 _:blank15 ;
        .

    _:blank15
        stix:extension_type "new-sdo" ;
        .

    _:blank16
        stix:extension_type "new-sdo" ;
        .

    _:blank17
        stix:extension_type "new-sdo" ;
        .

    _:blank18
        stix:extension_type "new-sdo" ;
        .

    _:blank19
        stix:extension_type "new-sdo" ;
        .

    _:blank20
        stix:extension_type "new-sdo" ;
        .

    _:blank21
        stix:extension_type "new-sdo" ;
        .

    _:blank22
        stix:extension_type "new-sdo" ;
        .

    _:blank23
        stix:extension_type "new-sdo" ;
        .

    _:blank24
        stix:extension_type "new-sdo" ;
        .

    _:blank25
        stix:extension_type "new-sdo" ;
        .



.. raw:: html

   </details>

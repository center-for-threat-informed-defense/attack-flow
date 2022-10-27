Language
========

Overview
--------

Attack Flow is a machine-readable language that is defined as an extension to the
`Structured Threat Information Expression (STIX) 2.1 Standard.
<https://docs.oasis-open.org/cti/stix/v2.1/os/stix-v2.1-os.html>`__ STIX is a
machine-readable standard for cyber threat intelligence that is expressed in JSON for
easy parsing and processing across a variety of programming languages and computer
architectures. STIX 2.1 has `a formal extension mechanism
<https://docs.oasis-open.org/cti/stix/v2.1/os/stix-v2.1-os.html#_32j232tfvtly>`__ that
allows STIX to be augmented with new features and capabilities.

As a result of extending STIX, the Attack Flow language is interoperable with a broad
ecosystem of STIX content, tools, and vendors. A flow can reference external STIX
objects (e.g. an identity or a threat actor) and external STIX objects can also refer
back to an attack flow. Attack Flow extends STIX by defining several new STIX Domain
Objects (SDOs) that are described below.

The formal specification for the Attack Flow language is represented as `a JSON schema,
<https://github.com/center-for-threat-informed-defense/attack-flow/stix/attack-flow-schema-2.0.0.json>`__
but this page summarizes the extension objects and attributes that make up the language.

STIX Datatypes
--------------

STIX has built-in datatypes that are used in Attack Flow. The datatypes that are most
relevant to Attack Flow are summarized below.

.. list-table::
  :widths: 30 70
  :header-rows: 1

  * - Datatype
    - Description
  * - **boolean**
    - A value of true or false.
  * - **enum**
    - A value from a STIX Enumeration.
  * - **external-reference**
    - A non-STIX identifier or reference to other related external content.
  * - **float**
    - An IEEE 754 [IEEE 754-2008] double-precision number.
  * - **identifier**
    - An identifier (ID) is for STIX Objects.
  * - **integer**
    - A whole number.
  * - **string**
    - A series of Unicode characters.
  * - **timestamp**
    - A time value (date and time).

For the full list of data types, see `the STIX Standard Chapter 2.
<https://docs.oasis-open.org/cti/stix/v2.1/os/stix-v2.1-os.html#_gv21fm9t1qgx>`__

STIX Common Properties
----------------------

All STIX objects, including Attack Flow objects, share a set of common properties. The
most important common properties are described in the table below. (See the STIX
specification for the complete list of `common properties.
<https://docs.oasis-open.org/cti/stix/v2.1/os/stix-v2.1-os.html#_ble33ropuhb8>`__)

.. list-table::
  :widths: 25 25 50
  :header-rows: 1

  * - Property Name
    - Type
    - Description
  * - **type** *(required)*
    - ``string``
    - Identifies the type of STIX object. It must be a valid object type as defined in
      the STIX 2.1 standard or in an extension (such as Attack Flow).
  * - **spec_version** *(required)*
    - ``string``
    - The version of the STIX specification used to represent this object. The value
      must be ``2.1`` for all Attack Flow objects.
  * - **id** *(required)*
    - ``identifier``
    - Uniquely identifies each object.
  * - **created_by_ref** *(optional)*
    - ``identifier``
    - Specifies the ``id`` property of the ``identity`` object that describes the entity
      that created this object.
  * - **created** *(required)*
    - ``timestamp``
    - Represents the time at which the object was originally created. The object creator
      can use the time it deems most appropriate as the time the object was created. The
      minimum precision MUST be milliseconds (three digits after the decimal place in
      seconds), but MAY be more precise.
  * - **modified** *(required)*
    - ``timestamp``
    - The modified property is only used by STIX Objects that support versioning and
      represents the time that this particular version of the object was last modified.
      The object creator can use the time it deems most appropriate as the time this
      version of the object was modified. The minimum precision MUST be milliseconds
      (three digits after the decimal place in seconds), but MAY be more precise.
  * - **confidence** *(optional)*
    - ``integer``
    - The confidence property identifies the confidence that the creator has in the
      correctness of their data. The confidence value MUST be a number in the range of
      0-100. Attack Flow uses a :ref:`confidence scale <confidence>` to convert from
      numerical confidence to human terms.
  * - **external_references** *(optional)*
    - ``list`` of ``external-reference``
    - Citing the intelligence sources consulted for creating an Attack Flow is an
      important part of producing informative and trustworthy flows. You can include
      this property on the ``attack-flow`` object to cite the sources used for creating
      the flow, or you can include references on ``attack-action`` objects for
      fine-grained sourcing. For the STIX standard, see `STIX Chap. 2.5.
      <https://docs.oasis-open.org/cti/stix/v2.1/cs02/stix-v2.1-cs02.html#_72bcfr3t79jx>`__

Attack Flow SDOs
----------------

This section describes the STIX Domain Objects (SDOs) defined in the Attack Flow
extension. The complete extension, schema, and example flow can be found on `the Attack
Flow GitHub.
<https://github.com/center-for-threat-informed-defense/attack-flow/stix/>`__

.. ATTACK_FLOW_SCHEMA Generated by `af` tool at 2022-10-27T01:49:09.494662Z

.. _schema_attack_flow:

Attack Flow
~~~~~~~~~~~

Every Attack Flow document **MUST** contain exactly one ``attack-flow`` object.
It provides metadata for name and description, starting points for the flow of
actions, and can be referenced from other STIX objects.

.. list-table::
   :widths: 20 30 50
   :header-rows: 1

   * - Property Name
     - Type
     - Description
   * - **type** *(required)*
     - ``string``
     - The type **MUST** be ``attack-flow``.
   * - **spec_version** *(required)*
     - ``string``
     - The version **MUST** be ``2.1``.
   * - **name** *(required)*
     - ``string``
     - The name of the Attack Flow.
   * - **description** *(optional)*
     - ``string``
     - A description of the overall Attack Flow.
   * - **scope** *(required)*
     - ``enum``
     - Indicates what type of behavior the Attack Flow describes: a specific incident,
       a campaign, etc.
       
       The value of this property **MUST** be one of: "incident", "campaign", "threat-actor", "malware", "other".
   * - **start_refs** *(required)*
     - ``list`` of type ``identifier`` (of type ``attack-action`` or ``attack-condition``)
     - A list of objects that start the flow.

*Example:*

.. code:: json

    {
      "type": "attack-flow",
      "spec_version": "2.1",
      "id": "attack-flow--e9ec3a4b-f787-4e81-a3d9-4cfe017ebc2f",
      "created_by_ref": "identity--fe7860f3-e23f-4d3f-9248-91105467a77a",
      "created": "2022-08-02T19:34:35.143Z",
      "modified": "2022-08-02T19:34:35.143Z",
      "name": "Example Flow",
      "description": "This Attack Flow example demonstrates some of the key concepts of the Attack Flow specification.",
      "scope": "incident",
      "start_refs": [
        "attack-action--37345417-3ee0-4e11-b421-1d4be68e6f15",
        "attack-action--3ea0de71-67a6-426e-bb2f-86375c620478",
        "attack-action--4f541c4c-b7bb-4b14-befd-ca8e8fe12599"
      ],
      "external_references": [
        {
          "source_name": "APT X Campaign Report. Fictitious Corp. August 15 2022.",
          "description": "A threat intel report summarizing the public CTI associated with the APT X phishing campaign.",
          "url": "http://blog.example.com/apt-x-campaign-report/"
        },
        {
          "source_name": "APT X Threat Actor Report. Imaginary LLC. Jun 24 2022.",
          "description": "A threat intel report summarizing the public CTI associated with the APT X threat actor profile.",
          "url": "http://blog.example.com/apt-x-threat-actor/"
        }
      ],
      "extensions": {
        "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
          "extension_type": "new-sdo"
        }
      }
    }

.. _schema_attack_action:

Attack Action
~~~~~~~~~~~~~

An ``attack-action`` object represents the execution of a particular technique,
i.e. a discrete unit of adverary behavior.

.. list-table::
   :widths: 20 30 50
   :header-rows: 1

   * - Property Name
     - Type
     - Description
   * - **type** *(required)*
     - ``string``
     - The type **MUST** be ``attack-action``.
   * - **spec_version** *(required)*
     - ``string``
     - The version **MUST** be ``2.1``.
   * - **name** *(required)*
     - ``string``
     - The name of the technique, or if a specific technique is not known, then the
       name of the tactic.
   * - **tactic_id** *(optional)*
     - ``string``
     - A tactic identifier or shortname that may reference an authoritative collection
       of tactics, e.g. ATT&CK.
   * - **tactic_ref** *(optional)*
     - ``identifier``
     - A reference to the tactic's STIX representation. For ATT&CK, this should be an
       ``x-mitre-tactic`` object.
   * - **technique_id** *(optional)*
     - ``string``
     - A technique identifier or shortname that may reference an authoritative
       collection of techniques, e.g. ATT&CK.
   * - **technique_ref** *(optional)*
     - ``identifier`` (of type ``attack-pattern``)
     - A reference to the technique's STIX representation.
   * - **description** *(optional)*
     - ``string``
     - A description of the adversary behavior, e.g. what they did, how they did it,
       and why. This field may contain prose as well as technical information, but
       consider using ``command_ref`` for providing technical details about technique
       execution.
   * - **execution_start** *(optional)*
     - ``identifier``
     - Timestamp indicating when the execution of this action began.
   * - **execution_end** *(optional)*
     - ``identifier``
     - Timestamp indicating when the execution of this action ended.
   * - **command_ref** *(optional)*
     - ``identifier`` (of type ``process``)
     - Describe tools or commands executed by the attacker by referring to a STIX
       Process object, which can represent commands, environment variables, process
       image, etc.
   * - **asset_refs** *(optional)*
     - ``list`` of type ``identifier`` (of type ``attack-asset``)
     - The assets involved in this action, i.e. where this action modifies or depends
       on the state of the asset.
   * - **effect_refs** *(optional)*
     - ``list`` of type ``identifier`` (of type ``attack-action`` or ``attack-operator`` or ``attack-condition``)
     - The potential effects that result from executing this action. (See:
       :ref:`effects`.)

*Example:*

.. code:: json

    {
      "type": "attack-action",
      "spec_version": "2.1",
      "id": "attack-action--37345417-3ee0-4e11-b421-1d4be68e6f15",
      "created": "2022-08-02T19:34:35.143Z",
      "modified": "2022-08-02T19:34:35.143Z",
      "technique_id": "T1583.002",
      "name": "Acquire Infrastructure: Domains",
      "technique_ref": "attack-pattern--40f5caa0-4cb7-4117-89fc-d421bb493df3",
      "description": "The attacker obtains a phishing domain similar to the target company.",
      "effect_refs": [
        "attack-condition--7e809f5b-319a-4b3f-82fe-e4dc09af5088"
      ],
      "extensions": {
        "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
          "extension_type": "new-sdo"
        }
      }
    }

.. _schema_attack_asset:

Attack Asset
~~~~~~~~~~~~

An asset is any object that is the subject or target of an action. Assets can be
technical assets (such as machines and data) or non-technical assets such as
people and physical systems. Actions typically either modify or depend upon the
*state* of an asset in some way.

Note that assets are not applicable in all
contexts. For example, public threat reports may not include enough detail to
represent the assets in a flow, or the flow might represent aggregate behavior
(at the campaign or actor level) for which it does not make sense to specify an
asset. Assets should be used to add context to a flow when the underlying
intelligence contains sufficient detail to do so.

.. list-table::
   :widths: 20 30 50
   :header-rows: 1

   * - Property Name
     - Type
     - Description
   * - **type** *(required)*
     - ``string``
     - The type **MUST** be ``attack-asset``.
   * - **spec_version** *(required)*
     - ``string``
     - The version **MUST** be ``2.1``.
   * - **name** *(required)*
     - ``string``
     - An name for the asset.
   * - **description** *(optional)*
     - ``string``
     - A description of the asset.
   * - **object_ref** *(optional)*
     - ``identifier``
     - A reference to any STIX data object (i.e. SDO) or observable (i.e. SCO) that
       contains structured data about this asset.

*Example:*

.. code:: json

    {
      "type": "attack-asset",
      "spec_version": "2.1",
      "id": "attack-asset--f7edf4aa-29ec-47aa-b4f6-c42dfbe2ac20",
      "created": "2022-08-02T19:34:35.143Z",
      "modified": "2022-08-02T19:34:35.143Z",
      "name": "Employee WordPress Account",
      "description": "The employee's credentials for accessing the WordPress blog.",
      "object_ref": "user-account--ce035bd0-8e58-4d18-aefb-f1fbb031d782",
      "extensions": {
        "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
          "extension_type": "new-sdo"
        }
      }
    }

.. _schema_attack_condition:

Attack Condition
~~~~~~~~~~~~~~~~

An ``attack-condition`` object represents some possible condition, outcome, or
state that could occur. Conditions can be used to split flows based on the
success or failure of an action, or to provide further description of an
action's results.

.. list-table::
   :widths: 20 30 50
   :header-rows: 1

   * - Property Name
     - Type
     - Description
   * - **type** *(required)*
     - ``string``
     - The type **MUST** be ``attack-condition``.
   * - **spec_version** *(required)*
     - ``string``
     - The version **MUST** be ``2.1``.
   * - **description** *(required)*
     - ``string``
     - The condition that is evaluated, usually based on the success or failure of the
       preceding action.
   * - **pattern** *(optional)*
     - ``string``
     - *(This is an experimental feature.)* The detection pattern for this condition
       may be expressed as a STIX Pattern or another appropriate language such as
       SNORT, YARA, etc.
   * - **pattern_type** *(optional)*
     - ``string``
     - *(This is an experimental feature.)* The pattern langauge used in this
       condition. The value for this property should come from the STIX
       ``pattern-type-ov`` open vocabulary.
   * - **pattern_version** *(optional)*
     - ``string``
     - *(This is an experimental feature.)* The version of the pattern language used
       for the data in the ``pattern`` property. For the STIX Pattern language, the
       default value is determined by the ``spec_version`` of the condition object.
   * - **on_true_refs** *(optional)*
     - ``list`` of type ``identifier`` (of type ``attack-action`` or ``attack-operator`` or ``attack-condition``)
     - When the condition is ``true``, the flow continues to these objects.
   * - **on_false_refs** *(optional)*
     - ``list`` of type ``identifier`` (of type ``attack-action`` or ``attack-operator`` or ``attack-condition``)
     - When the condition is ``false``, the flow continues to these objects. (If there
       are no objects, then the flow halts at this node.)

*Example:*

.. code:: json

    {
      "type": "attack-condition",
      "spec_version": "2.1",
      "id": "attack-condition--7e809f5b-319a-4b3f-82fe-e4dc09af5088",
      "created": "2022-08-02T19:34:35.143Z",
      "modified": "2022-08-02T19:34:35.143Z",
      "description": "Adversary possesses a phishing domain.",
      "on_true_refs": [
        "attack-operator--609d7adf-a3d2-44e8-82de-4b30e3fb97be"
      ],
      "extensions": {
        "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
          "extension_type": "new-sdo"
        }
      }
    }

.. _schema_attack_operator:

Attack Operator
~~~~~~~~~~~~~~~

An ``attack-operator`` object joins multiple attack paths together using boolean
logic.

.. list-table::
   :widths: 20 30 50
   :header-rows: 1

   * - Property Name
     - Type
     - Description
   * - **type** *(required)*
     - ``string``
     - The type **MUST** be ``attack-operator``.
   * - **spec_version** *(required)*
     - ``string``
     - The version **MUST** be ``2.1``.
   * - **operator** *(required)*
     - ``enum``
     - The logical operator to apply to the input effects.
       
       The value of this property **MUST** be one of: "AND", "OR".
   * - **effect_refs** *(optional)*
     - ``list`` of type ``identifier`` (of type ``attack-action`` or ``attack-operator`` or ``attack-condition``)
     - The effects, outcomes, or states that result when this operator evaluates to
       ``true``. If the operator evaluates to ``false``, then the flow halts. (See:
       :ref:`effects`.)

*Example:*

.. code:: json

    {
      "type": "attack-operator",
      "spec_version": "2.1",
      "id": "attack-operator--609d7adf-a3d2-44e8-82de-4b30e3fb97be",
      "created": "2022-08-02T19:34:35.143Z",
      "modified": "2022-08-02T19:34:35.143Z",
      "operator": "AND",
      "effect_refs": [
        "attack-action--d68e5201-796c-469c-b012-290b7040db02"
      ],
      "extensions": {
        "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4": {
          "extension_type": "new-sdo"
        }
      }
    }

.. /ATTACK_FLOW_SCHEMA

.. _effects:

Effects
-------

One of the key ideas behind Attack Flow is understanding how individual adversary
techniques relate to each other. The concept of *effect* is critical for understanding
these relationships between techniques. An effect is the outcome, result, or change in
state that occurs when an adversary executes a technique. Examples of effects include:

1. The attacker modifies the state of an asset, e.g. opening a port on the firewall.
2. The attacker gains some knowledge, e.g. a password.
3. The attacker achieves code execution.

Actions can produce effects, and subsequent actions may *depend* on those effects:

1. The attacker wants to connect to an internal service, which requires opening a port
   on the firewall.
2. The attacker wants to log in remotely, which depends on knowing the password.
3. The attacker wants to run a C2 implant, which depends on having code execution.

While an *action* is being executed, it's effect is an *indeterminate* state, i.e. we
cannot make any statement about the outcome or result. Once the action concludes, then
we can evaluate its effects, whether it succeeded or failed, etc. When one action is
chained to another, the latter depends on the effects of the former, i.e. the second one
can only execute when the first one completes successfully.

A *condition* splits a flow into multiple paths based on evaluating an effect, e.g. if
the action is a privilege escalation exploit, then the condition can test whether the
attacker has obtained elevated privileges (i.e. the exploit succeeded) or still has
regular privileges (i.e. the exploit failed.) A condition always selects one path to
follow, either the ``on_true_refs`` or the ``on_false_refs``.

On the other hand, an *operator* joins multiple attack paths together by aggregating
multiple effects. Conditions and operators can be used to encode complex behavior into
an attack flow that represents how attackers coordinate multiple behaviors to achieve a
desired outcome, as well as how they handle individual technique failure.

.. _confidence:

Confidence
----------

The ``confidence`` property is STIX common property that establishes the confidence in
the correctness of the data in a particular object, e.g. in a particular
``attack-action``. In STIX, the value is defined as a number from 0 to 100 (inclusive),
i.e. a percentage. It is often difficult or impossible to estimate confidence to that
level of precision, because Attack Flow typically describes real-world behavior that may
have been observed only a few times, which is not a large enough sample to compute
precise statistics.

To make ``confidence`` easier to reason about, Attack Flow uses the following confidence
scale to map confidence terms to numbers, and vice-versa.

.. list-table:: Confidence Terms
  :widths: 15 55 15 15
  :header-rows: 1

  * - Term
    - Description
    - Confidence Value
    - Confidence Range
  * - Speculation
    - Information that is purely speculative or hypothetical, e.g. the author imagines a
      what-if scenario.
    - 0
    - 0-0
  * - Very Doubtful
    - Information that is very unlikely to be true. All of the available evidence is
      against it, or it may have bias in its reporting, e.g. an adversary providing
      attribution information.
    - 10
    - 1-20
  * - Doubtful
    - Information that is unlikely to be true. Most of the available evidence is against
      it.
    - 30
    - 21-40
  * - Even Odds
    - Information that is equally like to be true as not true; a coin flip. The
      available evidence is equally weighted in support and against.
    - 50
    - 41-60
  * - Probable
    - Information that is likely to be true. Most of the available evidence supports it.
    - 70
    - 61-80
  * - Very Probable
    - Information that is very likely to be true. All of the available evidence supports
      it.
    - 90
    - 81-99
  * - Certainty
    - Information that is unquestionably true.
    - 100
    - 100-100

Example usage of the table:

* Convert "Very Probable" to a confidence number:
    * Look up "Very Probable" in the table: it is in row 6.
    * Read off the Confidence Value for row 6: it is 90.
* Convert 38 to a confidence term.
    * Go down the Confidence Range column to find the range containing 38: it is in the
      21-40 range, which is row 3.
    * Read off the term from row 3: "Doubtful".

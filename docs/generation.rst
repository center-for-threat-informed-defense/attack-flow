AI Generation
========

Overview
--------

The Attack Flow Builder is now able to generate Attack Flows out of security incident reports, saving you hours of time in initial flow setup. Generating an Attack Flow through the Builder results in a fully editable Attack Flow, able to be modified, added on to, and saved just like any other Attack Flow file (.afb).

It is always recommended to validate the AI generated flow, as LLMs do not always have the same cyber knowledge or attention to detail as a human analyst. You can validate your flow by going item by item through the flow and updating the Confidence property on each object, which will initially be set to "AI Generated".

Accepted Input Formats
~~~~~~~~~~~~~~~~~~~
The Attack Flow Builder supports security incident report pdfs, urls, and plain text as inputs for flow generation. Many security incident reports have unique formats, but the AI skill does its best to normalize the text it receives, supporting a large variety of input types. Best results for Attack Flow generation are received from security incident reports that follow the best practices outlined in `our usage guide section </usage_guides/cyber-threat-intel/#mapping-cti-reports-to-att-ck-techniques>`_.

.. note::

   Our AI skill cannot read through paywalls. If the link you're pasting in is behind a paywall or requires you to log in to read it, you may want to try copy/pasting the body of the article as a text input.

Generate on the Builder's Website
----------------------------------

You can test out flow generation right now in our Attack Flow Builder. Simply select the Generate Flow option from the splash screen, and fill out the required inputs. You'll need to provide your own endpoint and token. If you don't have one handy, you can get a free endpoint and token from `Gemini <https://ai.google.dev/gemini-api/docs/api-key>`_.


.. important::

    The Attack Flow Builder UI **does not** save or store any information entered as part of flow generation. We will **never** save your LLM token and **never** compromise it.


Running API Locally
--------------------

We have also wrapped the AI skill into an API that you can run locally to avoid re-entering your token each time you generate a flow. If you run both the frontend and API together, it will default to using the credentials saved in your local configuration file, but you are also able to override that and use any credentials entered into the Overrides section on the UI.

Setup Your Environment
~~~~~~~~~~~~~~~~~~~~~~~

Copy ``.env.example`` to ``.env`` and update values for your environment.

.. code:: bash

    $ cp .env.example .env

Configure an API Provider
~~~~~~~~~~~~~~~~~~~~~~~~~

The API does not include a default LLM provider. Copy the provider template
and edit it for the provider and model your deployment is authorized to use.

.. code:: bash

    $ cp config/providers.yml.example config/providers.yml

Set ``enabled: true`` for at least one provider and replace each ``MODEL_ID``
placeholder with a model (or Azure deployment name) available to that
provider. The first enabled provider is the default for API jobs that do not
select a provider explicitly.

Keep API keys out of ``providers.yml``. Instead, set the environment variable
named by ``api_key_env`` or ``azure_api_key_env`` in ``.env`` or your deployment
secret manager. For example, an OpenAI entry with ``api_key_env:
OPENAI_API_KEY`` requires ``OPENAI_API_KEY`` to contain the key.

``config/providers.yml`` is ignored by Git because its endpoint choices are
deployment-specific. ``config/providers.yml.example`` contains commented
templates for OpenAI, OpenAI-compatible providers, Azure OpenAI, Anthropic
(Claude), and Gemini.

Docker
~~~~~~~

Running the UI and the API together in Docker is the easiest way to spin up the Attack Flow Builder.

Create and configure ``config/providers.yml`` before building the API image so
Docker can copy it into the container.

Then, run the following command to run both together.

.. code:: bash

    $ docker compose -f docker-compose.proxy.yml up --build

Poetry
~~~~~~~

If you don't have docker, you can run the API directly in your terminal with Poetry.

You'll first need to change the following config variables to allow your API and UI to have different origins:

.. code:: none

    CORS_ENABLED=true
    CORS_ALLOW_ORIGINS=https://ui.example.com
    CORS_ALLOW_CREDENTIALS=false
    CORS_ALLOW_METHODS=*
    CORS_ALLOW_HEADERS=*

Then, you can run the API locally with the following command:

.. code:: bash

    $ poetry install --with api
    $ poetry run uvicorn attack_flow_api.main:app --reload --host 127.0.0.1 --port 8000

Then, in another terminal window, run the UI


.. code:: bash

    $ cd src/attack_flow_builder/
    $ npm install
    $ npm run dev


Generate in Chat Window
------------------------

If you want to generate an Attack Flow using your favorite LLM but aren't able to run the API yourself, here is a more minimal prompt you can copy/paste into any AI chat to generate an Attack Flow. This will generate the flow in STIX format, and all you'll need to do is click 'Import STIX' to load the generated file into the Attack Flow Builder.


.. code:: none

    Generate a STIX 2.1 Attack Flow from the security incident report
    below using a conservative, evidence-based approach. Return JSON
    only as a valid STIX Bundle. Preserve any explicit MITRE ATT&CK
    tactics/techniques/IDs mentioned in the source and normalize them
    to the latest ATT&CK version when possible. If an ATT&CK mapping
    is explicit but cannot be fully normalized, keep the best
    source-grounded ATT&CK identifier or name rather than omitting it.
    Only infer tactics, techniques, branching, or relationships when
    the report strongly supports them; inferred content should be
    lower confidence than explicit evidence. Create attack-action
    steps for clearly described attacker behavior even if no ATT&CK
    technique can be mapped. Use verbatim source excerpts for action
    descriptions where possible, concise summaries for names, and
    represent tools, files, URLs, IPs, processes, users, and other
    observables as linked STIX objects. Preserve source-grounded
    branching with attack-condition/attack-operator objects when explicit,
    merge tool setup with the concrete runtime action when they describe
    the same step, and retain relevant external_references, authors,
    and relationships.

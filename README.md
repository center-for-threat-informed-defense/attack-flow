[![codecov](https://codecov.io/gh/center-for-threat-informed-defense/attack-flow/branch/main/graph/badge.svg?token=MSGpc9mM6U)](https://codecov.io/gh/center-for-threat-informed-defense/attack-flow)

<!--
When updating README.md, take a look at overview.rst and consider if you should
make the same updates there.
-->

# Attack Flow

The Attack Flow project helps defenders move from tracking adversary behaviors
individually to the sequence of techniques adversaries use to achieve their
goals. Understanding the context within those sequences, as well as the
relationships among them, enables additional defensive capabilities that make
defenders much more effective. The project seeks to demonstrate how attack flows
can explain defensive posture to executives, aid defenders to understand
lessons-learned from an incident, and support red-teamers to easily compose
realistic adversary emulation scenarios.

## Getting Started

At a high level, Attack Flow is a machine-readable representation of a sequence
of actions and assets along with knowledge properties about those actions and
assets. This representation is composed of five main objects: the *flow* itself,
a list of *actions*, a list of *assets*, a list of knowledge *properties*, and a
list of causal *relationships* between the actions and assets. Each of these
five objects includes a set of *required* and *optional* fields. Attack Flow
uses MITRE ATT&CK to describe specific adversary behaviors.

| Resource                                                                                   | Description                                                              |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| [Documentation](https://center-for-threat-informed-defense.github.io/attack-flow-private/) | An overview of the Attack Flow format and corresponding data dictionary. |
| [JSON Schema](/schema/attack-flow-2022-01-05-draft.json)                                   | The JSON of the Attack Flow schema.                                      |
| [Example Flows](/corpus/)                                                                  | A corpus of example Attack Flows.                                        |
| Attack Flow Builder                                                                        | A GUI tool for building Attack Flows.                                    |

For more information, refer to the
[documentation](https://center-for-threat-informed-defense.github.io/attack-flow-private/).

## Docker

The builder tool can be run as a Docker container. Run `make docker-build` to
build the container image initially, then `make docker-run` to start the
container. Once the image is running, open your browser to http://localhost:8080
to view the builder.

## Getting Involved

There are several ways that you can get involved with this project and help
advance threat-informed defense:

- **Review the standard, use the designer, and tell us what you think.**  We
  welcome your review and feedback on the data model and our methodology.
- **Help us prioritize additional example flows to create.** Let us know what
  examples you would like to turned into an Attack Flow. Your input will help us
  prioritize how we expand our corpus.
- **Share your use cases.** We are interested in developing additional tools and
  resources to help the community understand and make threat-informed decisions
  in their risk management programs. If you have ideas or suggestions, we
  consider them as we explore additional research projects.

## Questions and Feedback

Please submit issues for any technical questions/concerns or contact
ctid@mitre-engenuity.org directly for more general inquiries.

Also see the guidance for contributors if are you interested in contributing or
simply reporting issues.

## How Do I Contribute?

We welcome your feedback and contributions to help advance Attack Flow. Please
see the guidance for contributors if are you interested in [contributing or
simply reporting issues.](/CONTRIBUTING.md)

Please submit
[issues](https://github.com/center-for-threat-informed-defense/attack-flow/issues)
for any technical questions/concerns or contact ctid@mitre-engenuity.org
directly for more general inquiries.

## Notice

Copyright 2021 MITRE Engenuity. Approved for public release. Document number
CT0040

Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.

This project makes use of ATT&CK®

[ATT&CK Terms of Use](https://attack.mitre.org/resources/terms-of-use/)

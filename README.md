[![codecov](https://codecov.io/gh/center-for-threat-informed-defense/attack-flow/branch/main/graph/badge.svg?token=MSGpc9mM6U)](https://codecov.io/gh/center-for-threat-informed-defense/attack-flow)

# Attack Flow
The Attack Flow project helps defenders move from tracking adversary behaviors individually to the sequence of techniques adversaries use to achieve their goals. Understanding the context within those sequences, as well as the relationships among them, enables additional defensive capabilities that make defenders much more effective. The project seeks to demonstrate how attack flows can explain defensive posture to executives, aid defenders to understand lessons-learned from an incident, and support red-teamers to easily compose realistic adversary emulation scenarios.

## Resources

| Resource | Description |
|----------|-------------|
| [Attack Flow Specification](/docs/attack-flow-schema.md) | An overview of the Attack Flow format and corresponding data dictionary. |
| [Attack Flow JSON Schema](/schema/attack-flow-2022-01-05-draft.json) | The JSON of the Attack Flow schema. |
| [Attack Flow JSON Example Document](/schema/attack-flow-example.json) | A JSON example of an Attack Flow. |
| Attack Flow Designer | A GUI tool for building Attack Flows. (See "Getting Started" below)|

## Getting Started
At a high level, Attack Flow is a machine-readable representation of a sequence of actions and assets along with knowledge properties about those actions and assets. This representation is composed of five main objects: the *flow* itself, a list of *actions*, a list of *assets*, a list of knowledge *properties*, and a list of causal *relationships* between the actions and assets. Each of these five objects includes a set of *required* and *optional* fields. Attack Flow uses MITRE ATT&CK to describe specific adversary behaviors.

Once you familiarize yourself with [the Attack Flow specification](/docs/attack-flow-schema.md), try using the
Attack Flow Designer GUI to view or create your own Attack Flow. To get started:

1. Go to the [release page](https://github.com/center-for-threat-informed-defense/attack-flow/releases) and
   download `attack_flow_designer.zip` as well as `corpus.zip`.
2. Unzip these two files.
3. In the `attack_flow_builder` directory, double click on `index.html` to open it in a web browser.
4. Inside the Attack Flow Designer, go to File → Open Attack Flow. Navigate to the `corpus` directory and
   open one of the `*.afd` files.
5. To create your own Attack Flow, refresh the page. Right-click in the Attack Flow workspace to create a
   node. Drag and drop from the plug icon to connect nodes together (subject to the rules of the Attack Flow
   specification).
6. Save your Attack Flow in one of two formats:
    1. File → Save Attack Flow: saves the file with `*.afd` extension. This file is suitable for opening up
       for editing in the Attack Flow Designer.
    2. File → Publish Attack Flow: saves a `*.json` file that conforms to the Attack Flow specification; this
       file is interoperable with other Attack Flow tools.

## Getting Involved
There are several ways that you can get involved with this project and help advance threat-informed defense: 
- **Review the schema, use the builder, and tell us what you think.**  We welcome your review and feedback on the data model and our methodology.
- **Help us prioritize additional example flows to create.** Let us know what examples you would like to turned into an Attack Flow. Your input will help us prioritize how we expand our corpus.
- **Share your use cases.** We are interested in developing additional tools and resources to help the community understand and make threat-informed decisions in their risk management programs. If you have ideas or suggestions, we consider them as we explore additional research projects. 

## Questions and Feedback
Please submit issues for any technical questions/concerns or contact ctid@mitre-engenuity.org directly for more general inquiries.

Also see the guidance for contributors if are you interested in contributing or simply reporting issues.

## How Do I Contribute?
We welcome your feedback and contributions to help advance Attack Flow. Please see the guidance for
contributors if are you interested in [contributing or simply reporting issues.](/CONTRIBUTING.md)

Please submit [issues](https://github.com/center-for-threat-informed-defense/attack-flow/issues) for any
technical questions/concerns or contact ctid@mitre-engenuity.org directly for more general inquiries.

## Notice
Copyright 2021 MITRE Engenuity. Approved for public release. Document number CT0040

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

This project makes use of ATT&CK®

[ATT&CK Terms of Use](https://attack.mitre.org/resources/terms-of-use/)

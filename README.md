[![codecov](https://codecov.io/gh/center-for-threat-informed-defense/attack-flow/branch/main/graph/badge.svg?token=MSGpc9mM6U)](https://codecov.io/gh/center-for-threat-informed-defense/attack-flow)

# Attack Flow
Attack Flow helps executives, SOC managers, and defenders easily understand how attackers compose adversary techniques into attacks by developing a representation of attack flows, modeling attack flows for a small corpus of incidents, and creating visualization tools to display attack flows.

At the end of the project, the visualization tools will demonstrate how attack flows will help security leaders explain defensive posture to executives, help defenders understand lessons-learned in an incident, and help red-teamers easily compose realistic adversary emulation scenarios.

Resources:
* [Attack Flow Specification](/docs/attack-flow-schema.md)
* [Attack Flow JSON Schema](/schema/attack-flow-2022-01-05-draft.json)
* [Attack Flow JSON Example Document](/schema/attack-flow-example.json)
* Attack Flow Designer: A GUI tool for building Attack Flows. (See "Getting Started".)

## Getting Started
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
- **Share your use cases.** We are interested in developing additional tools and resources to help the community understand and make threat-informed decisions in their risk management programs. If you have ideas or suggestions, we consider them as explore additional research projects. 

## Questions and Feedback
Please submit issues for any technical questions/concerns or contact ctid@mitre-engenuity.org directly for more general inquiries.

Also see the guidance for contributors if are you interested in contributing or simply reporting issues.

## Notice
Copyright 2021 MITRE Engenuity. Approved for public release. Document number CT0040

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

This project makes use of ATT&CK®

[ATT&CK Terms of Use](https://attack.mitre.org/resources/terms-of-use/)

Overview
========

..
  Whenever you update overview.rst, also look at README.md and consider whether
  you should make a corresponding update there.

Introduction
------------

The Attack Flow project helps defenders move from tracking adversary behaviors
individually to the sequence of techniques adversaries use to achieve their
goals. Understanding the context within those sequences, as well as the
relationships among them, enables additional defensive capabilities that make
defenders much more effective. The project seeks to demonstrate how attack flows
can explain defensive posture to executives, aid defenders to understand
lessons-learned from an incident, and support red-teamers to easily compose
realistic adversary emulation scenarios.

Get Started
-----------

At a high level, Attack Flow is a machine-readable representation of a sequence
of actions and assets along with knowledge properties about those actions and
assets. This representation is composed of five main objects: the *flow* itself,
a list of *actions*, a list of *assets*, a list of knowledge *properties*, and a
list of causal *relationships* between the actions and assets. Each of these
five objects includes a set of *required* and *optional* fields. Attack Flow
uses MITRE ATT&CK to describe specific adversary behaviors.

Once you familiarize yourself with this documentation, try using the
:doc:`Attack Flow Builder <builder>` to view or create your own Attack Flow.


Get Involved
------------

There are several ways that you can get involved with this project and help
advance threat-informed defense:

- :newsgroup:`Tell us what you think.` Check out the :doc:`standard`, take the
  :doc:`builder` for a spin, and review the :doc:`example_flows`.
- :newsgroup:`Help us prioritize additional example flows to create.` Let us know what
  examples you would like to turned into an Attack Flow. Your input will help us
  prioritize how we expand our corpus.
- :newsgroup:`Share your use cases.` We are interested in developing additional tools
  and resources to help the community understand and make threat-informed decisions in
  their risk management programs. If you have ideas or suggestions, we consider them as
  we explore additional research projects.

Send your feedback to ctid@mitre-engenuity.org or post on `GitHub issues
<https://github.com/center-for-threat-informed-defense/attack-flow-private/issues>`__.

Notice
------

© 2022 MITRE Engenuity. Approved for public release. Document number CT0040.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.

This project makes use of ATT&CK®: `ATT&CK Terms of Use
<https://attack.mitre.org/resources/terms-of-use/>`__

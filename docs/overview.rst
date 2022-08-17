Overview
========

..
  Whenever you update overview.rst, also look at README.md and consider whether
  you should make a corresponding update there.

Introduction
-------------
.. epigraph::

   Defenders think in lists. Attackers think in graphs. As long as this is true, 
   attackers will win. 
   
   -- John Lambert (`Source <https://github.com/JohnLaTwC/Shared/blob/master/Defenders%20think%20in%20lists.%20Attackers%20think%20in%20graphs.%20As%20long%20as%20this%20is%20true%2C%20attackers%20win.md>`__)
      

The Attack Flow project helps defenders move from tracking adversary behaviors
individually to the sequence of techniques adversaries use to achieve their
goals. Understanding the context within those sequences, as well as the
relationships among them, enables additional defensive capabilities that make
defenders much more effective. The project seeks to demonstrate how attack flows
can explain defensive posture to executives, aid defenders to understand
lessons-learned from an incident, and support red-teamers to easily compose
realistic adversary emulation scenarios.

Who is Attack Flow For?
-------------------------
This project is meant for any cyber defender or leader in any industry seeking 
to understand how adversaries operate, the impact on their organization, and 
how to most effectively improve their defensive posture to address those threats.  
Threat intelligence analysts, security operations, incident response teams, 
red team members, and risk assessors are some of the groups that may benefit 
from Attack Flow. This shareable model helps users understand how adversaries 
target and exploit vulnerabilities by revealing the relationships 
within chains of techniques. With this information, users can perform 
realistic threat and risk assessments. Attack Flow also provides an easy way to
share threat intelligence with other defenders, as well as an effective means 
for users to present leadership with actionable information that can be used 
for defense improvement and resource prioritization.

Use Cases
----------
Attack Flow can be used for a variety of use cases. 

**Adversary Emulation**

Offensive operators and defenders can use Attack Flow to create 
adversary emulation plans that focus their security testing on observed behavior
by adversaries targeting their organization. Defenders can follow the scenario 
laid out in the flow and select tests that will effectively assess their 
defenses against the chains of attack. Having a large corpus of common attack 
paths and TTP sequences can help with the creation of adversary emulation plans.

**Defensive Posture**

Defenders can use Attack Flow to assess and improve their defensive posture, 
as well as provide leadership with a data-driven case for resource allocation.
Attack Flow allows for a realistic risk assessment based on observed adversary 
chains of attack, rather than hypothetical or isolated behaviors. 
Defenders can overlay controls over chains of TTPs to determine gaps in coverage, 
as well as chokeholds where defenses should be prioritized. Attack Flow can also 
be used to investigate an ongoing intrusion, as it provides a framework for 
understanding the TTP sequences that led to the attack.

**Executive Communications**

Defenders can use Attack Flow to effectively communicate actionable intelligence 
on likely threats and their business impact to executives in a format that is 
easily understood by them. Attack Flow allows defenders to present their analysis
of an attack and their defensive posture strategically and stripped of raw data 
logs, technical jargon, and other information that executives will not 
understand or need to make their business decisions. Defenders can use the flow 
to communicate the impact of an attack to an organization in a way that makes
sense to executives by highlighting the financial cost, as well as loss of 
time, expertise, or reputation. Defenders can then point out areas in the flow 
where tools or other controls should be prioritized, which allows them to present 
a persuasive case to leadership for resource allocation and enable decision-making. 

 

**Lessons Learned**

Defenders can use Attack Flow to improve their incident response planning capabilities
and organizational security posture. After a security incident has occurred, 
defenders can create flows to understand how their defenses failed and where they
can apply controls to reduce future risk and enhance threat containment.
Mapping a flow will also allow defenders to see where their defenses succeeded 
and what they should continue to do going forward. Creating attack flows is an 
easy way to ensure the incident is documented and organizational knowledge is 
retained for future use. Over time, this will improve defenders' ability to 
mitigate and recover from incidents more efficiently. 

**Threat Hunting**

Defenders can use Attack Flow to help outline and analyze critical infrastructure 
and determine assets, sensors, and threats facing their environment. Attack Flow can 
be used to correlate threat indicators and to help analyze and mitigate against 
specific threats based on certain flows. These flows can also help guide 
investigative searches, piecing together techniques and timestamps to construct 
detailed timelines. Attack Flow can showcase the adversary tools and TTPs that 
are being used, which can help aid in writing detections against common behaviors 
and/or adversary toolsets, as well as prioritizing those detections.

**Threat Intelligence**

Defenders can use Attack Flow to create a variety of threat intelligence products
that are shareable with other defenders and leaders. Users can track adversary 
TTPs and campaigns over time, as well as document single incidents. Attack Flow can 
also be used to explain how adversaries use OffSec tools, e.g. Mimikatz, to 
achieve their objectives. This allows the analyst to tell a full story of an 
incident and gain deeper insight into how they can defend against on-going threats. 



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

- **Tell us what you think.** Check out the :doc:`standard`, take the
  :doc:`builder` for a spin, and review the :doc:`example_flows`.
- **Help us prioritize additional example flows to create.** Let us know what
  examples you would like to turned into an Attack Flow. Your input will help us
  prioritize how we expand our corpus.
- **Share your use cases.** We are interested in developing additional tools and
  resources to help the community understand and make threat-informed decisions
  in their risk management programs. If you have ideas or suggestions, we
  consider them as we explore additional research projects.

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

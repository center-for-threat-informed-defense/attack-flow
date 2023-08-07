Overview
========

..
  Whenever you update overview.rst, also look at README.md and consider whether
  you should make a corresponding update there.

.. epigraph::

   Defenders think in lists. Attackers think in graphs. As long as this is true,
   attackers will win.

   -- John Lambert, `April 26, 2015 <https://github.com/JohnLaTwC/Shared/blob/master/Defenders%20think%20in%20lists.%20Attackers%20think%20in%20graphs.%20As%20long%20as%20this%20is%20true%2C%20attackers%20win.md>`__

Introduction
------------

The Attack Flow project helps defenders move from tracking individual adversary
behaviors to tracking the sequences of behaviors that adversaries employ to move towards
their goals. By looking at combinations of behaviors, defenders learn the relationships
between them: how some techniques set up other techniques, or how adversaries handles
uncertainty and recover from failure. The project supports a wide variety of use cases:
from blue team to red team, from manual analysis to autonomous response, and from
front-line worker to the C-suite. Attack Flow provides a common language and toolset for
describing complex, adversarial behavior.

Who is Attack Flow For?
-----------------------

This project is targeted at any cyber security professional seeking to understand how
adversaries operate, the impact on their organization, and how to most effectively
improve their defensive posture to address those threats. Threat intelligence analysts,
security operations, incident response teams, red team members, and risk assessors are
some of the groups that can benefit from Attack Flow. This specification facilitates
sharing of threat intelligence, communicating about risks, modeling efficacy of security
controls, and more. The project includes tools to visualize attacks for the benefit of
low-level analysis as well as communicating high-level principles to management.

Use Cases
---------

Attack Flow is designed to support many different use cases.

**Threat Intelligence**

CTI analysts can use Attack Flow to create highly detailed, behavior-based threat
intelligence products. The langauge is machine-readable to provide for interoperability
across organizations and commercial tools. Users can track adversary behavior at the
incident level, campaign level, or threat actor level. Instead of focusing on indicators
of compromise (IOCs), which are notoriously inexpensive for the adversary to change,
Attack Flow is centered on adversary behavior, which is much more costly to change.

**Defensive Posture**

The blue team can use Attack Flow to assess and improve their defensive posture, as well
as provide leadership with a data-driven case for resource allocation. Attack Flow
allows for a realistic risk assessment based on observed adversary sequences of attack,
allowing defenders to play out hypothetical scenarios (e.g. table top exercises) with
high fidelity. Defenders can reason about security controls over chains of TTPs to
determine gaps in coverage, as well as choke points where defenses should be
prioritized.

**Executive Communications**

Front-line cyber professionals can use Attack Flow to roll up highly complicated,
technical details of an incident into a visual depiction that aids communication with
non-technical stakeholders, management, and executives. This format Attack Flow allows
defenders to present their analysis of an attack and their defensive posture
strategically while de-emphasizing raw data, technical jargon, and other information
that executives do not need to make a business decision. Defenders can use flows to
communicate the impact of an attack in business terms (i.e. money) and make a convincing
case for new tools, personnel, or security controls to prioritize.

**Incident Reponse**

Incident responders can use Attack Flow to improve their incident response (IR) planning
and after-action review. After a security incident has occurred, responders can create
flows to understand how their defenses failed and where they can apply controls to
reduce future risk and enhance threat containment. Mapping a flow will also allow
defenders to see where their defenses succeeded and what they should continue to do
going forward. Creating attack flows is an easy way to ensure the incident is documented
and organizational knowledge is retained for future use. Over time, this will improve
defenders' ability to mitigate and recover from incidents more efficiently.

**Adversary Emulation**

The red team can use Attack Flow to create adversary emulation plans that focus their
security testing on realistic sequences of TTPs informed by public as well as
proprietary intelligence. The red team can leverage a corpus of attack flow to identify
common attack paths and TTP sequences. In purple team scenarios, a flow is a very
precise way to communicate between attackers and defenders.

**Threat Hunting**

Threat hunters can use Attack Flow to identify common sequences of TTPs observed in the
wild, then hunt for those same TTP chains in their own environment. These flows can
guide investigative searches, piecing together techniques and timestamps to construct
detailed timelines. Attack Flow can showcase the adversary tools and TTPs that are being
used, which can help aid in writing detections against common behaviors and/or adversary
toolsets, as well as prioritizing those detections.

Get Started
-----------

Here are a few ways for you to learn more and get started with Attack Flow:

1. :newsgroup:`Look at the corpus of example flows.` The :doc:`corpus <example_flows>`
   is a great place to start learning about Attack Flow. If you're new to the industry,
   it's also a great way to familiarize yourself with some high-profile breaches!
2. :newsgroup:`Build your own flow.` The :doc:`Attack Flow Builder <builder>` is a
   user-friendly tool that runs in your browser (no download required!) and will let
   start creating flows in just minutes.
3. :newsgroup:`Tell us what you think.` Find us `on LinkedIn
   <https://www.linkedin.com/showcase/center-for-threat-informed-defense/>`__ or email
   us `ctid@mitre-engenuity.org <mailto:ctid@mitre-engenuity.org>`__ and let us know how
   you're using Attack Flow and what ideas you have to improve it.
4. :newsgroup:`Spread the word!` Our goals is to get members of the community excited
   about Attack Flow and adopt it in their own work. Attack Flow is open source and
   royalty-free, so go ahead and share it to your professional network!

Deep Dive
---------

If you decide you want to dive even deeper into Attack Flow, here are the key resources
for building up a full understanding of the project:

* The :doc:`language specification <language>` goes into very
  deep detail about the inner working of Attack Flow. This is intended for developers
  who want to write code that works with Attack Flow, and not required reading for the
  general audience.
* The :doc:`developer guide <developers>` explains how to set up a development
  environment if you want to start using the Attack Flow python library or modify the
  Attack Flow Builder.
* The `GitHub repository
  <https://github.com/center-for-threat-informed-defense/attack-flow>`__ is ready for
  your contributions -- issues and pull requests are welcome!

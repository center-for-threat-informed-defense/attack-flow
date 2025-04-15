Cyber Threat Intelligence
-------------------------

Attack Flow helps CTI teams transform threat data into structured, sequential, visual narratives that improve analysis, reporting, and decision-making.

**Key applications include:**

* CTI analysts can use Attack Flow to create highly detailed, behavior-based threat intelligence reports. 
* Flows can be embedded in published CTI reports and blogs to visualize adversary activity and enhance understanding of attack paths.
* Malware analysts may reverse engineer samples discovered during threat hunting and use flows to document the TTPs uncovered—streamlining the creation of CTI blog posts or internal reports.
* Analysts can extract ATT&CK techniques from CTI reports, blogs, and research papers to build structured flows from unstructured data.
* Flows help preserve IOCs (Indicators of Compromise) and IOAs (Indicators of Attack) in their original context for better correlation and recall.
* Visual attack flows enhance threat briefings by making complex behavior more accessible to diverse stakeholders.

.. Attention::
   Attack Flow now supports the automatic import of STIX bundles to provide an intial flow diagram from threat intelligence

Mapping CTI Reports to ATT&CK Techniques
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

*Open-Source Report Selection*

If you choose to use an open-source report to create an attack flow, it is important to
assess the strengths and weaknesses of the report in order to establish a confidence
level in its data and assessments. Factors affecting source quality include the manner
of data collection, the level of source access to the data, report completeness, and the
age and currency of the information. In addition to extracting the technical details, it
is also beneficial to construct the victimology of the attack from the reports, as its
inclusion will allow any reader to quickly gauge the scope and applicability of the flow
to their own organization. It is important to use high-quality sources, because they
will support the credibility of your flow and provide an accurate portrayal of the
threat, which may be used to inform decisions on defense and resource prioritization.

.. important::

   **Key Takeaways for Selecting a Report**

   * Reports should be transparent about where the data originates and provide a technically competent overview of an incident.
   * Reports should originate from a credible vendor with a track record of accurate reporting
     and first-hand analysis of the incident in question.
   * Reports should provide the most current information on the malware or breach.
   * Reports should make it easy to identify any information gaps. Use multiple sources
     to address gaps and corroborate the data, if possible.
   * Reports should distinguish between facts, assumptions, and analytical assessments.
   * When available, use attribution and targeting information from reports to enrich
     your attack flows.

Conversely, sources that do not meet the above criteria should be avoided. Sources that
do not have technical expertise and the ability to analyze the malware or attack
themselves (for example, news sites) are not considered optimal for creating attack
flows.

**Characteristics of Reports to Avoid:**

* Second-hand sources that simply regurgitate information about attacks instead of providing their own technical analysis.
* Sources that do not provide the context in which the information was obtained.
* Reports focusing mainly on a security product rather than the attack.
* Sources that do not provide adequate technical information and/or contain vague timelines.

Examples of Reports to Avoid
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Cloudflare: `"What are Petya and NotPetya?" <https://www.cloudflare.com/learning/security/ransomware/petya-notpetya-ransomware>`_
     This article simply summarizes the attack and does not offer the technical detail
     needed to create a flow.

Vox: `"U.S. hospitals have been hit by the global ransomware attack" <https://www.vox.com/2017/6/27/15881666/global-eu-cyber-attack-us-hackers-nsa-hospitals>`_
     This news article does not have the source credibility and technical detail needed
     to create a flow.

Trellix: `"Update on WhisperGate, Destructive Malware Targeting Ukraine - Threat Intelligence & Protections Update" <https://www.trellix.com/en-us/about/newsroom/stories/threat-labs/update-on-whispergate-destructive-malware-targeting-ukraine.html>`_
     This article focuses on mitigation strategies and tools rather than the technical
     details of the attack. However, the report bases its information on a technical
     report by Trellix, which would be a good source to create an attack flow.

Examples of Reports to Use
~~~~~~~~~~~~~~~~~~~~~~~~~~~

Crowdstrike: `“NotPetya Technical Analysis -  A Triple Threat: File Encryption, MFT Encryption, Credential Theft” <https://www.crowdstrike.com/blog/petrwrap-ransomware-technical-analysis-triple-threat-file-encryption-mft-encryption-credential-theft/>`_
     Crowdstrike performs a first-hand analysis of the NotPetya malware and provides a
     sufficient level of technical detail.

Cisco Talos: `"Ukraine Campaign Delivers Defacement and Wipers, in Continued Escalation" <https://blog.talosintelligence.com/2022/01/ukraine-campaign-delivers-defacement.html>`_
     Cisco performs a first-hand analysis of the WhisperGate malware and provides
     sufficient technical detail. This report also provides information on adversary
     intent, targeting, and attribution, and distinguishes between information and
     analytical judgements.

The DFIR Report: `"SEO Poisoning - A Gootloader Story" <https://thedfirreport.com/2022/05/09/seo-poisoning-a-gootloader-story/>`_
     DFIR performs a first-hand analysis of this attack and provides sufficient
     technical detail, including a detailed timeline of events.

.. note::

   The three examples in this section have all been mapped into attack flows in
   :doc:`../example_flows`.

MITRE ATT&CK™ is a knowledge base observed adversary tactics, techniques, and procedures
extracted from public threat reporting. There are hundreds of techniques in the ATT&CK
knowledge base, and it can be challenging to map CTI reports if you are not familiar
with the overall structure of ATT&CK.

.. Attention::

   Attack Flow does not require the use of MITRE ATT&CK. You can represent adversary behaviors from
   other knowledge bases (e.g., MITRE ATLAS, etc.) or even internal proprietary techniques.

Consider the following steps when mapping reports to ATT&CK techniques:

* Familiarize yourself with the `ATT&CK Enterprise Matrix <https://attack.mitre.org/matrices/enterprise/>`_.
* Read CISA's `best practices for mapping to ATT&CK
  <https://www.cisa.gov/uscert/sites/default/files/publications/Best%20Practices%20for%20MITRE%20ATTCK%20Mapping.pdf>`__.
* Read through your selected report(s) and try to order the behaviors into chronological
  events, beginning with Reconnaissance or Initial Access tactics and ending with the
  Impact of the attack.
* If the order of events is unclear in your report, you may need to compare several
  technical reports to determine a timeline.
* Once you have your order of events, assign a technique to each event. You may need to
  conduct further research on the behavior to determine the best-fitting technique.
* Use the Center for Threat-Informed Defenses `ATT&CK Powered Suit
  <https://chrome.google.com/webstore/detail/attck-powered-suit/gfhomppaadldngjnmbefmmiokgefjddd?hl=en&authuser=0>`_
  browser extension to quickly research ATT&CK techniques, groups, and more.
* Set the confidence property in your actions to reflect any potential uncertainty in
  your sources.

Example Technique Mapping
~~~~~~~~~~~~~~~~~~~~~~~~~

This section works through an example of mapping a report to illustrate the process. The
report used is from Cisco Talos: `"Iranian APT MuddyWater targets Turkish users via
malicious PDFs, executables"
<https://blog.talosintelligence.com/2022/01/iranian-apt-muddywater-targets-turkey.html>`_.
The corresponding "Muddy Water" Attack Flow can be found in :doc:`../example_flows`. The
"Muddy Water" Attack Flow has some additional details and depicts two variants of the
Muddy Water beahvior. This section is based on the older variant of Muddy Water
campaigns.

**Initial Access**

The adversary gains initial access to the system through the distribution of PDF files
containing embedded links.

.. image:: ../_static/SpearPhishing.png
   :alt: Screenshot from Cisco report underlining the sentence "...it is highly likely that the PDFs served as the initial entry points to the attack and were distributed via email messages as part of spear-phishing efforts conducted by the group." The sentence is labeled with ATT&CK technique T1566.001 SpearPhishing Attachment.

**Execution**

The malware requires user-interaction to execute.

.. image:: ../_static/MaliciousLink.png
   :alt: Screenshot from Cisco report of the Infection Chain section. It underlines the sentence "The PDF files typically show an error message and ask the user to click on a link." The sentence is labeled with ATT&CK technique T1204.001 User Execution: Malicious Link.

**Command and Control**

This report downloads two variants of the infection chain. The PDF either downloads
malicious XLS files or a Windows executable from an attacker-hosted website. In an
attack flow, multiple paths would be passed using an operator "OR"/"AND." However, for
the sake of this example, we will only map the first variation.

.. image:: ../_static/IngressTool.png
   :alt: Screenshot from Cisco report of the Malicious Executables-Based Infection Chain section. It underlines the sentence "The URLs corresponding to the download button in the PDF files will typically host the malicious XLS files containing the macros that deploy the subsequent VBS and powershell scripts." The sentence is labeled with ATT&CK technique T1105 Ingress Tool Transfer.

**Infection Chain**

The malicious XLS file variation executes via VBA macros and establishes persistence.

.. image:: ../_static/VBAMacros.png
   :alt: Screenshot from Cisco report of the Persistence section with five techniques labeled. The first technique is T1059.005 Command and Scripting Interpreter: Visual Basic drawn from the sentence "The infection chain instrumented by the VBA macros consists of three key artifacts..." The second technique is T1059.005 Command and Scripting Interpreter: Visual Basic drawn from the bullet stating that one of the artifacts is the malicious VB script intermediate component that the macro sets up for persistence. The third technique is T1059.001 Command and Scripting Interpreter: PowerShell drawn from the bullet stating that one of the artifacts is a malicious PowerShell-based downloader script. The fourth technique is T1547.001 Boot or Logon Autostart Execution: Registry Run Keys/Startup Folder drawn from the sentence "...persistence is set up by creating a malicious Registry run for the infected user." The final technique is T1218 System Binary Process Execution drawn from the sentence "This campaign relies on the use of a LoLBin to execute the malicious VBScript."

There was no ATT&CK technique associated with this Canary Token technique that may have
served as a means of defense evasion or anti-analysis. The action was simply named
"Canary Token Execution."

.. image:: ../_static/CanaryToken.png
   :alt: Screenshot from Cisco report from the Tracking Tokens section underlining the sentence "The latest versions of the VBA code deployed could make HTTP requests to a canary tooken from canarytokens.com." The extracted technique is simply labeled "Canary Token Execution."

This variation of the malware concludes with the PowerShell downloader reaching out to a
remote location for the final payload, which Cisco was unable to obtain.

.. image:: ../_static/PowerShell.png
   :alt: Screenshot from Cisco report of the Malicious Powershell-Based Downloader section with two techniques extracted. The first technique is T1105 Ingress Tool Transfer drawn from the sentence "The PowerShell script that downloads another PowerShell from a remote location which will then be executed." The second technique is T1059.001 Command and Scripting Interpreter: Powershell, which is also drawn from the same sentence.

**Impact**

Because Cisco was unable to obtain the final payload, we cannot determine the objective
of the attack. However, we can assess possible impact based on information in the report
on Muddy Water's observed behavior in past campaigns. We will reflect this uncertainty
in our flow in the Action descriptions and confidence property and by using an ``OR
operator``.

.. image:: ../_static/Impact.png
   :alt: Screenshot from Cisco report of the MuddyWater Threat Actor section. The section says "Campaigns carried out by the threat actor aim to achieve either of three outcomes." Each outcome is underlined: Espionage, Intellectual Property Theft, and Ransomware attacks. The three techniques labeled correspond to those outcomes and are TA0009 Collection, TA0010 Exfiltration, and T1486 Data Encrypted for Impact.

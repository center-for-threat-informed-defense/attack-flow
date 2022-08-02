Best Practices Guide
===================

Overview
---------
This document provides criteria for creating an attack flow that extend beyond the technical requirements of the standard. While it is possible to create a valid flow without adhering to these rules, we recommend considering them in order to produce a high-quality flow that effectively and accurately portrays the threat. This guide provides recommendations for the entire flow creation process, from selecting a reliable report to mapping techniques and structuring the flow. 

Stylistic Terms
---------------------
The project as a whole should be referred to as "Attack Flow."

Individual documents should be referred to as "attack flows."

Open-Source Report Selection
-----------------------------

If you choose to use an open-source report to create an attack flow, it is important to assess the strengths and weaknesses of the report in order to establish a confidence level in its data and assessments. Factors affecting source quality include the manner of data collection, the level of source access to the data, report completeness and the age and currency of the information. In addition to extracting the technical details, it is also beneficial to construct the victimology of the attack from the reports, as its inclusion in the flow metadata will allow anyone to quickly gauge who should care about this attack and why.  It is important to use  high-quality sources, because they will support the credibility of your flow and provide an accurate portrayal of the threat, which may be used to inform decisions on defense and resource prioritization. 

Key Takeaways for Selecting a Report: 

* Reports should be transparent about where the data originates and provide a technically competent overview of the breach or malware.
* Reports should preferably be from a security vendor and/or U.S. government organization with first-hand analysis of the malware or attack to ensure credibility and reliability in reporting.
* Reports should provide the most current information on the malware or breach. 
* Reports should make it easy to identify any information gaps. Use multiple sources to address gaps and corroborate the data, if possible.
* Reports should distinguish between facts, assumptions, and analytical assessments. 
* If available, glean details from threat intelligence on attribution and targeting to add to the flow metadata for context and relevance.

Reports to Avoid
~~~~~~~~~~~~~~~~~

Conversely, sources that do not meet the above standard should be avoided. Sources that do not have technical expertise and the ability to analyze the malware or attack themselves (for example, news sites) are not considered optimal for creating attack flows. 

Characteristics of Reports to Avoid:

* Second-hand sources that simply regurgitate information about attacks instead of providing their own technical analysis.
* Sources that do not provide the context in which the information was obtained. 
* Reports focusing mainly on a security product rather than the attack.
* Sources that do not provide adequate technical information.

Examples of Reports to Avoid
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Cloudflare; `"What are Petya and NotPetya?" <https://www.cloudflare.com/learning/security/ransomware/petya-notpetya-ransomware>`_
     This article simply summarizes the attack and does not offer the technical detail needed to create a flow.

Vox; June 27, 2017; `"U.S. hospitals have been hit by the global ransomware attack" <https://www.vox.com/2017/6/27/15881666/global-eu-cyber-attack-us-hackers-nsa-hospitals>`_
     This news article does not have the source credibility and technical detail needed to create a flow.

Trellix; January 20, 2022; `"Update on WhisperGate, Destructive Malware Targeting Ukraine - Threat Intelligence & Protections Update" <https://www.trellix.com/en-us/about/newsroom/stories/threat-labs/update-on-whispergate-destructive-malware-targeting-ukraine.html>`_
     This article focuses on mitigation strategies and tools rather than the technical details of the attack. However, the report bases its information on a technical report by Trellix, which would be a good source to create an attack flow. 

Examples of Reports to Use
~~~~~~~~~~~~~~~~~~~~~~~~~~~

Crowdstrike; June 29, 2017; `“NotPetya Technical Analysis -  A Triple Threat: File Encryption, MFT Encryption, Credential Theft” <https://www.crowdstrike.com/blog/petrwrap-ransomware-technical-analysis-triple-threat-file-encryption-mft-encryption-credential-theft/>`_
`NotPetya Attack Flow <https://github.com/center-for-threat-informed-defense/attack-flow-private/blob/main/corpus/notpetya.afd>`_
     
     Crowdstrike performs a first-hand analysis of the NotPetya malware and provides a sufficient level of technical detail. 

Cisco Talos; January 21, 2022; `"Ukraine Campaign Delivers Defacement and Wipers, in Continued Escalation" <https://blog.talosintelligence.com/2022/01/ukraine-campaign-delivers-defacement.html>`_
`WhisperGate Attack Flow <https://github.com/center-for-threat-informed-defense/attack-flow-private/blob/main/corpus/WhisperGate.afd>`_   
     
     Cisco performs a first-hand analysis of the WhisperGate malware and provides sufficient technical detail. This report also provides information on adversary intent, targeting, and attribution and distinguishes between information and analytical judgements. 

The DFIR Report; May 9, 2022; `"SEO Poisoning - A Gootloader Story" <https://thedfirreport.com/2022/05/09/seo-poisoning-a-gootloader-story/>`_
`Gootloader Attack Flow <https://github.com/center-for-threat-informed-defense/attack-flow-private/blob/main/corpus/Gootloader.afd>`_

     DFIR performs a first-hand analysis of this attack and provides sufficient technical detail, including a detailed timeline of events.  

Mapping Reports to ATT&CK Techniques
------------------------------------ 
The MITRE ATT&CK framework is a catalogue of observed adversary tactics, techniques, and procedures extracted from threat reporting. There are hundreds of techniques in the ATT&CK knowledge base, and it can be challenging to map an internal or external report if you are not familiar with the overall structure of ATT&CK, as well as how to translate behaviors into techniques. Consider the following steps when mapping reports to ATT&CK techniques:



*      Familiarize yourself with the `ATT&CK Enterprise Matrix <https://attack.mitre.org/matrices/enterprise/>`_.  
       Take Engenuity's free `MAD CTI Training <https://mitre-engenuity.org/cybersecurity/mad/>`_ for additional help.
   
* You can also read this `helpful guide <https://www.cisa.gov/uscert/sites/default/files/publications/Best%20Practices%20for%20MITRE%20ATTCK%20Mapping.pdf>`__ for adoption of best practices for mapping to ATT&CK.
 
*  Read through your selected report(s) and try to order the behaviors into chronological events, beginning with Reconnaissance or Initial Access tactics and ending with the Impact of the attack. If the order of events is unclear 
   in your report, you may need to compare several technical reports to determine a timeline. 
   

*  Once you have your order of events, assign a technique to each event. You may need to conduct further research on the behavior to determine the best-fitting technique. `ATT&CK Powered Suit <https://chrome.google.com/webstore/detail/attck-powered-suit/gfhomppaadldngjnmbefmmiokgefjddd?hl=en&authuser=0>`_ is a MITRE 
   Engenuity browser extension that can be used to instantly search for ATT&CK techniques, groups, and more. 
   
*  You can use the confidence property to reflect uncertainty in your sources. 
    

.. note::
    
    ATT&CK techniques do not have to be used for mapping, and there will be cases when a behavior does not align with an ATT&CK technique. Attack Flows was designed to support the use of all actions, and other sources, such as VERIS, can also be used. 

Example Technique Mapping
~~~~~~~~~~~~~~~~~~~~~~~~~~
Report Used: Cisco Talos; January, 31, 2022; `"Iranian APT MuddyWater targets Turkish users via malicious PDFs, executables" <https://blog.talosintelligence.com/2022/01/iranian-apt-muddywater-targets-turkey.html>`_
`MuddyWater Attack Flow <https://github.com/center-for-threat-informed-defense/attack-flow-private/blob/main/corpus/MuddyWater.afd>`_

Initial Access
~~~~~~~~~~~~~~~
The adversary gains initial access to the system through the distribution of PDF files containing embedded links.

.. image:: _static/SpearPhishing.png
   :alt: Screenshot from Cisco report underlining the sentence "...it is highly likely that the PDFs served as the initial entry points to the attack and were distributed via email messages as part of spear-phishing efforts conducted by the group." The sentence is labeled with ATT&CK technique T1566.001 SpearPhishing Attachment.

Execution
~~~~~~~~~~
The malware requires user-interaction to execute.

.. image:: _static/MaliciousLink.png
   :alt: Screenshot from Cisco report of the Infection Chain section. It underlines the sentence "The PDF files typically show an error message and ask the user to click on a link." The sentence is labeled with ATT&CK technique T1204.001 User Execution: Malicious Link. 

Command and Control
~~~~~~~~~~~~~~~~~~~~
This report downloads two variants of the infection chain. The PDF either downloads malicious XLS files or a Windows executable from an attacker-hosted website. In an attack flow, multiple paths would be passed using an operator "OR"/"AND." However, for the sake of this example, we will only map the first variation.
 
.. image:: _static/IngressTool.png 
   :alt: Screenshot from Cisco report of the Malicious Executables-Based Infection Chain section. It underlines the sentence "The URLs corresponding to the download button in the PDF files will typically host the malicious XLS files containing the macros that deploy the subsequent VBS and powershell scripts." The sentence is labeled with ATT&CK technique T1105 Ingress Tool Transfer. 

Infection Chain
~~~~~~~~~~~~~~~~
The malicious XLS file variation executes via VBA macros and establishes persistence. 

.. image:: _static/VBAMacros.png 
   :alt: Screenshot from Cisco report of the Persistence section with five techniques labeled. The first technique is T1059.005 Command and Scripting Interpreter: Visual Basic drawn from the sentence "The infection chain instrumented by the VBA macros consists of three key artifacts..." The second technique is T1059.005 Command and Scripting Interpreter: Visual Basic drawn from the bullet stating that one of the artifacts is the malicious VB script intermediate component that the macro sets up for persistence. The third technique is T1059.001 Command and Scripting Interpreter: PowerShell drawn from the bullet stating that one of the artifacts is a malicious PowerShell-based downloader script. The fourth technique is T1547.001 Boot or Logon Autostart Execution: Registry Run Keys/Startup Folder drawn from the sentence "...persistence is set up by creating a malicious Registry run for the infected user." The final technique is T1218 System Binary Process Execution drawn from the sentence "This campaign relies on the use of a LoLBin to execute the malicious VBScript."

There was no ATT&CK technique associated with this Canary Token technique that may have served as a means of defense evasion or anti-analysis. The action was simply named "Canary Token Execution."

.. image:: _static/CanaryToken.png 
   :alt: Screenshot from Cisco report from the Tracking Tokens section underlining the sentence "The latest versions of the VBA code deployed could make HTTP requests to a canary tooken from canarytokens.com." The extracted technique is simply labeled "Canary Token Execution."

This variation of the malware concludes with the PowerShell downloader reaching out to a remote location for the final payload, which Cisco was unable to obtain. 

.. image:: _static/PowerShell.png
   :alt: Screenshot from Cisco report of the Malicious Powershell-Based Downloader section with two techniques extracted. The first technique is T1105 Ingress Tool Transfer drawn from the sentence "The PowerShell script that downloads another PowerShell from a remote location which will then be executed." The second technique is T1059.001 Command and Scripting Interpreter: Powershell, which is also drawn from the same sentence. 

Impact
~~~~~~~
Because Cisco was unable to obtain the final payload, we cannot determine the objective of the attack. However, we can assess possible impact based on information in the report on Muddy Water's observed behavior in past campaigns. We will reflect this uncertainty in our flow in the Action descriptions and confidence property and by using an OR operator. 

.. image:: _static/Impact.png
   :alt: Screenshot from Cisco report of the MuddyWater Threat Actor section. The section says "Campaigns carried out by the threat actor aim to achieve either of three outcomes." Each outcome is underlined: Espionage, Intellectual Property Theft, and Ransomware attacks. The three techniques labeled correspond to those outcomes and are TA0009 Collection, TA0010 Exfiltration, and T1486 Data Encrypted for Impact. 

Flow Structure
--------------
*    Begin each flow with either a *Reconnaissance*, *Resource Development*, or an *Initial Access* Technique. 

          Note: If the Initial Access vector is unknown, begin the flow with an Action with the description that the Initial Access is unknown, along with any other details on the compromised state of the system.  If there are multiple possible Initial Access vectors, depict them using an OR operator.  
* Use preconditions to enhance human understanding of the flow. If a set of actions are self-explanatory, omit the precondition and connect the actions to each other directly. For example, the NotPetya encryption routine does not require preconditions in between the actions. 

.. image:: _static/Nopreconditions.png
   :alt: Excerpt from the NotPetya flow capturing three Actions directly connected to each other with no preconditions in between. The three actions are T1053.005 Scheduled Task/Job, Description: NotPetya creates a scheduled task that triggers a reboot 60 min after execution by default; T1529 System Shutdown/Reboot, Description: System reboots, displays decoy message; T1486 Data Encrypted for Impact, Description: The custom boot loader encrypts the MFT. NotPetya also encryped files with specfic extensions. 

* If two actions stemming from one action happen simultaneously, an AND operator is not needed.
*  End each flow with an *Impact* Technique. 
   
        Note: If the Impact is unknown, end the flow with an Action with the description that the impact is unknown, along with any other relevant details. Or, you may also include Impact techniques that are typical of the actor's campaigns and label them as such.

Flow Objects
------------
Metadata
~~~~~~~~~
*    Select a flow type which best represents your report(s).

     Incident 
             This flow represents a single observed attack. 
    
     Campaign 
            This flow represents multiple instances of a Threat Actor pursuing a goal through observed TTPs. For example, varying malware behavior over several attacks would fall into this category. 
     
     Adversary Emulation 
            This flow represents a constructed scenario that can be used to test defenses against the observed tactics, techniques, and chains of attack of an adversary group.
    
* Description 

           The metadata description for Incidents and Campaigns is open-ended but should bring context and relevance to the flow.  For example, include information on attribution, targeted company or industry or geography, specific technologies targeted, etc. if known. This way, readers can quickly gauge the relevance of the attack to their own assets. You may also want to include lessons learned, IOCs, or any other information that will inform threat prioritization and decision-making. 
    
           The metadata description of an Adversary Emulation flow is also open-ended but should contain information about the chosen scenario, as well as adversary information such as suspected identity or source country, community identifiers/aliases, suspected motivation, commonly exploited vulnerabilities/CVEs, associated malware, and targeted nations and industries if known. This information should be sourced. 
    
Actions
~~~~~~~~
* Descriptions must provide sufficient detail and must not simply repeat the technique name. 

           Bad Description: Exploits remote services. 
           
           Good Description: To move laterally, NotPetya tests for vulnerable SMBv1 condition (Eternal Blue/Eternal Romance exploit) and deploys an SMB backdoor.

*  The source field is optional. However, if you have multiple sources for the flow, it is a best practice to reference a source for each action to so that its data and the confidence field (if in use) can be verified.    
    
    
Criteria for Public Submissions into the Corpus
------------------------------------------------ 
*   The flow must be one continuous flow from start to finish, connecting events in the order that they occurred. (Rather than multiple flows broken up) 
*   The flow must be sufficiently complex for submission. The flow must have no fewer than 10 actions and must make proper use of preconditions and operators.
*   The flow must contain at least one source in the metadata. Source must be credible and technically competent. 
    
    
    
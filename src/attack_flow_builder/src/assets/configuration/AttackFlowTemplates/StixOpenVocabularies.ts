export const GroupingContextOv : [string, string][] = [
    ["suspicious-activity", "suspicious-activity"],
    ["malware-analysis", "malware-analysis"],
    ["unspecified", "unspecified"]
];
export const ReportTypeOv : [string, string][] = [
    ["threat-report", "threat-report"],
    ["attack-pattern", "attack-pattern"],
    ["campaign", "campaign"],
    ["identity", "identity"],
    ["indicator", "indicator"],
    ["malware", "malware"],
    ["observed-data", "observed-data"],
    ["threat-actor", "threat-actor"],
    ["tool", "tool"],
    ["vulnerability", "vulnerability"]
];
export const RegionOv : [string, string][] = [
    ["africa", "africa"],
    ["eastern-africa", "eastern-africa"],
    ["middle-africa", "middle-africa"],
    ["northern-africa", "northern-africa"],
    ["southern-africa", "southern-africa"],
    ["western-africa", "western-africa"],
    ["americas", "americas"],
    ["latin-america-caribbean", "latin-america-caribbean"],
    ["south-america", "south-america"],
    ["caribbean", "caribbean"],
    ["central-america northern-america", "central-america northern-america"],
    ["asia", "asia"],
    ["central-asia", "central-asia"],
    ["eastern-asia", "eastern-asia"],
    ["southern-asia", "southern-asia"],
    ["western-asia", "western-asia"],
    ["europe eastern-europe", "europe eastern-europe"],
    ["northern-europe", "northern-europe"],
    ["southern-europe", "southern-europe"],
    ["western-europe", "western-europe"],
    ["oceania", "oceania"],
    ["australia-new-zealand", "australia-new-zealand"],
    ["melanesia", "melanesia"],
    ["micronesia", "micronesia"],
    ["polynesia", "polynesia"],
    ["antarctica", "antarctica"]
];
export const MalwareTypeOv : [string, string][] = [
    ["adware", "adware"],
    ["backdoor", "backdoor"],
    ["bot", "bot"],
    ["bootkit", "bootkit"],
    ["ddos", "ddos"],
    ["downloader", "downloader"],
    ["dropper", "dropper"],
    ["exploit-kit", "exploit-kit"],
    ["keylogger", "keylogger"],
    ["ransomware", "ransomware"],
    ["remote-access-trojan", "remote-access-trojan"],
    ["resource-exploitation", "resource-exploitation"],
    ["rogue-security-software", "rogue-security-software"],
    ["rootkit", "rootkit"],
    ["screen-capture", "screen-capture"],
    ["spyware", "spyware"],
    ["trojan", "trojan"],
    ["unknown", "unknown"],
    ["virus", "virus"],
    ["webshell", "webshell"],
    ["wiper", "wiper"],
    ["worm", "worm"]
];
export const ImplementationLanguageOv : [string, string][] = [
    ["applescript", "applescript"],
    ["bash", "bash"],
    ["c", "c"],
    ["c++", "c++"],
    ["c#", "c#"],
    ["go", "go"],
    ["java", "java"],
    ["javascript", "javascript"],
    ["lua", "lua"],
    ["objective-c", "objective-c"],
    ["perl", "perl"],
    ["php", "php"],
    ["powershell", "powershell"],
    ["python", "python"],
    ["ruby", "ruby"],
    ["scala", "scala"],
    ["swift", "swift"],
    ["typescript", "typescript"],
    ["visual-basic", "visual-basic"],
    ["x86-32", "x86-32"],
    ["x86-64", "x86-64"]
];
export const MalwareCapabilitiesOv : [string, string][] = [
    ["accesses-remote-machines", "accesses-remote-machines"],
    ["anti-debugging", "anti-debugging"],
    ["anti-disassembly", "anti-disassembly"],
    ["anti-emulation", "anti-emulation"],
    ["anti-memory-forensics", "anti-memory-forensics"],
    ["anti-sandbox", "anti-sandbox"],
    ["anti-vm", "anti-vm"],
    ["captures-input-peripherals", "captures-input-peripherals"],
    ["captures-output-peripherals", "captures-output-peripherals"],
    ["captures-system-state-data", "captures-system-state-data"],
    ["cleans-traces-of-infection", "cleans-traces-of-infection"],
    ["commits-fraud", "commits-fraud"],
    ["communicates-with-c2", "communicates-with-c2"],
    ["compromises-data-availability", "compromises-data-availability"],
    ["compromises-data-integrity", "compromises-data-integrity"],
    ["compromises-system-availability", "compromises-system-availability"],
    ["controls-local-machine", "controls-local-machine"],
    ["degrades-security-software", "degrades-security-software"],
    ["degrades-system-updates", "degrades-system-updates"],
    ["determines-c2-server", "determines-c2-server"],
    ["emails-spam", "emails-spam"],
    ["escalates-privileges", "escalates-privileges"],
    ["evades-av", "evades-av"],
    ["exfiltrates-data", "exfiltrates-data"],
    ["fingerprints-host", "fingerprints-host"],
    ["hides-artifacts", "hides-artifacts"],
    ["hides-executing-code", "hides-executing-code"],
    ["infects-files", "infects-files"],
    ["infects-remote-machines", "infects-remote-machines"],
    ["installs-other-components", "installs-other-components"],
    ["persists-after-system-reboot", "persists-after-system-reboot"],
    ["prevents-artifact-access", "prevents-artifact-access"],
    ["prevents-artifact-deletion", "prevents-artifact-deletion"],
    ["probes-network-environment", "probes-network-environment"],
    ["self-modifies", "self-modifies"],
    ["steals-authentication-credentials", "steals-authentication-credentials"],
    ["violates-system-operational-integrity", "violates-system-operational-integrity"]
];
export const ProcessorArchitectureOv : [string, string][] = [
    ["alpha", "alpha"],
    ["arm", "arm"],
    ["ia-64", "ia-64"],
    ["mips", "mips"],
    ["powerpc", "powerpc"],
    ["sparc", "sparc"],
    ["x86", "x86"],
    ["x86-64", "x86-64"]
];
export const ToolTypeOv : [string, string][] = [
    ["denial-of-service", "denial-of-service"],
    ["exploitation", "exploitation"],
    ["information-gathering", "information-gathering"],
    ["network-capture", "network-capture"],
    ["credential-exploitation", "credential-exploitation"],
    ["remote-access", "remote-access"],
    ["vulnerability-scanning", "vulnerability-scanning"],
    ["unknown", "unknown"]
];
export const ThreatActorTypeOv : [string, string][] = [
    ["activist", "activist"],
    ["competitor", "competitor"],
    ["crime-syndicate", "crime-syndicate"],
    ["criminal", "criminal"],
    ["hacker", "hacker"],
    ["insider-accidental", "insider-accidental"],
    ["insider-disgruntled", "insider-disgruntled"],
    ["nation-state", "nation-state"],
    ["sensationalist", "sensationalist"],
    ["spy", "spy"],
    ["terrorist", "terrorist"],
    ["unknown", "unknown"]
];
export const ThreatActorRoleOv : [string, string][] = [
    ["agent", "agent"],
    ["director", "director"],
    ["independent", "independent"],
    ["sponsor", "sponsor"],
    ["infrastructure-operator", "infrastructure-operator"],
    ["infrastructure-architect", "infrastructure-architect"],
    ["malware-author", "malware-author"]
];
export const ThreatActorSophisticationOv : [string, string][] = [
    ["none", "none"],
    ["minimal", "minimal"],
    ["intermediate", "intermediate"],
    ["advanced", "advanced"],
    ["strategic", "strategic"],
    ["expert", "expert"],
    ["innovator", "innovator"]
];
export const AttackResourceLevelOv : [string, string][] = [
    ["individual", "individual"],
    ["club", "club"],
    ["contest", "contest"],
    ["team", "team"],
    ["organization", "organization"],
    ["government", "government"]
];
export const AttackMotivationOv : [string, string][] = [
    ["accidental", "accidental"],
    ["coercion", "coercion"],
    ["dominance", "dominance"],
    ["ideology", "ideology"],
    ["notoriety", "notoriety"],
    ["organizational-gain", "organizational-gain"],
    ["personal-gain", "personal-gain"],
    ["personal-satisfaction", "personal-satisfaction"],
    ["revenge", "revenge"],
    ["unpredictable", "unpredictable"]
];
export const MalwareResultOv : [string, string][] = [
    ["malicious", "malicious"],
    ["suspicious", "suspicious"],
    ["benign", "benign"],
    ["unknown", "unknown"]
];
export const IdentityClassOv : [string, string][] = [
    ["individual", "individual"],
    ["group", "group"],
    ["system", "system"],
    ["organization", "organization"],
    ["class", "class"],
    ["unknown", "unknown"]
];
export const IndustrySectorOv : [string, string][] = [
    ["agriculture", "agriculture"],
    ["aerospace", "aerospace"],
    ["automotive", "automotive"],
    ["chemical", "chemical"],
    ["commercial", "commercial"],
    ["communications", "communications"],
    ["construction", "construction"],
    ["defense", "defense"],
    ["education", "education"],
    ["energy", "energy"],
    ["engineering", "engineering"],
    ["entertainment", "entertainment"],
    ["financial-services", "financial-services"],
    ["government", "government"],
    ["emergency-services", "emergency-services"],
    ["government-local", "government-local"],
    ["government-national", "government-national"],
    ["government-public-services", "government-public-services"],
    ["government-regional", "government-regional"],
    ["healthcare", "healthcare"],
    ["hospitality-leisure", "hospitality-leisure"],
    ["infrastructure", "infrastructure"],
    ["dams", "dams"],
    ["nuclear", "nuclear"],
    ["water", "water"],
    ["insurance", "insurance"],
    ["manufacturing", "manufacturing"],
    ["mining", "mining"],
    ["non-profit", "non-profit"],
    ["pharmaceuticals", "pharmaceuticals"],
    ["retail", "retail"],
    ["technology", "technology"],
    ["telecommunications", "telecommunications"],
    ["transportation", "transportation"],
    ["utilities", "utilities"]
];
export const IndicatorTypeOv : [string, string][] = [
    ["anomalous-activity", "anomalous-activity"],
    ["anonymization", "anonymization"],
    ["benign", "benign"],
    ["compromised", "compromised"],
    ["malicious-activity", "malicious-activity"],
    ["attribution", "attribution"],
    ["unknown", "unknown"]
];
export const PatternTypeOv : [string, string][] = [
    ["stix", "stix"],
    ["pcre", "pcre"],
    ["sigma", "sigma"],
    ["snort", "snort"],
    ["suricata", "suricata"],
    ["yara", "yara"]
];
export const InfrastructureTypeOv : [string, string][] = [
    ["amplification", "amplification"],
    ["anonymization", "anonymization"],
    ["botnet", "botnet"],
    ["command-and-control", "command-and-control"],
    ["exfiltration", "exfiltration"],
    ["hosting-malware", "hosting-malware"],
    ["hosting-target-lists", "hosting-target-lists"],
    ["phishing", "phishing"],
    ["reconnaissance", "reconnaissance"],
    ["staging", "staging"],
    ["unknown", "unknown"]
];
export const AccountTypeOv : [string, string][] = [
    ["unix", "unix"],
    ["windows local", "windows local"],
    ["windows domain", "windows domain"],
    ["ldap", "ldap"],
    ["tacacs", "tacacs"],
    ["radius", "radius"],
    ["nis", "nis"],
    ["openid", "openid"],
    ["facebook", "facebook"],
    ["skype", "skype"],
    ["twitter", "twitter"],
    ["kavi", "kavi"]
];
export const WindowsPebinaryTypeOv : [string, string][] = [
    ["exe", "exe"],
    ["dll", "dll"],
    ["sys", "sys"]
];

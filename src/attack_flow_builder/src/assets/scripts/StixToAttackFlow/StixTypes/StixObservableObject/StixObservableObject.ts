import type { Artifact } from "./Artifact";
import type { AutonomousSystem } from "./AutonomousSystem";
import type { Directory } from "./Directory";
import type { DomainName } from "./DomainName";
import type { EmailAddress } from "./EmailAddress";
import type { EmailMessage } from "./EmailMessage";
import type { File } from "./File";
import type { IPv4Address } from "./IPv4Address";
import type { IPv6Address } from "./IPv6Address";
import type { MacAddress } from "./MacAddress";
import type { Mutex } from "./Mutex";
import type { NetworkTraffic } from "./NetworkTraffic";
import type { Process } from "./Process";
import type { Software } from "./Software";
import type { Url } from "./Url";
import type { UserAccount } from "./UserAccount";
import type { WindowsRegistryKey } from "./WindowsRegistryKey";
import type { X509Certificate } from "./X509Certificate";

/**
 * STIX 2.1 Cyber-Observable Object.
 */
export type StixObservableObject
    = Artifact
    | AutonomousSystem
    | Directory
    | DomainName
    | EmailAddress
    | EmailMessage
    | File
    | IPv4Address
    | IPv6Address
    | MacAddress
    | Mutex
    | NetworkTraffic
    | Process
    | Software
    | Url
    | UserAccount
    | WindowsRegistryKey
    | X509Certificate;

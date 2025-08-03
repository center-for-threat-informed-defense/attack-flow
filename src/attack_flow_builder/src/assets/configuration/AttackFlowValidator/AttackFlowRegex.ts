/**
 * Windows Registry Regex
 */
export const WindowsRegistryRegex
    = /^(Computer\\)?((HKEY_LOCAL_MACHINE)|(HKEY_CURRENT_CONFIG)|(HKEY_CLASSES_ROOT)|(HKEY_CURRENT_USER)|(HKEY_USERS))\\(.*)[^\\]/;

/**
 * IPv4 Regex
 */
export const IPv4Regex
    = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2][0-9]|[0-9]))?$/;

/**
 * IPv6 Regex
 */
export const IPv6Regex
    = /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?(\/(12[0-8]|1[0-1][0-9]|[1-9][0-9]|[0-9]))?$/i;

/**
 * Mac Address Regex
 */
export const MacAddressRegex
    = /^([0-9a-f]{2}[:]){5}([0-9a-f]{2})$/i;

/**
 * Email Address Regex
 */
export const EmailRegex
    = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/**
 * STIX Regex
 */
export const StixRegex
    = /^(?:[a-z][a-z0-9-]+[a-z0-9]--[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|null)$/i;

/**
 * Payload Regex
 */
export const PayloadRegex
    = /^([a-z0-9+/]{4})*([a-z0-9+/]{4}|[a-z0-9+/]{3}=|[a-z0-9+/]{2}==)$/i;

/**
 * MIME Type Regex
 */
export const MimeTypeRegex
    = /^(application|audio|font|image|message|model|multipart|text|video)\/[a-zA-Z0-9.+_-]+/;

/**
 * Regex for different hash types
 */
export const HashRegexes = new Map<string, RegExp>([
    ["md5", /^[a-zA-Z0-9]{32}$/],
    ["sha-1", /^[a-zA-Z0-9]{40}$/],
    ["sha-256", /^[a-zA-Z0-9]{64}$/],
    ["sha-512", /^[a-zA-Z0-9]{128}$/],
    ["sha3-256", /^[a-zA-Z0-9]{64}$/]
]);

/**
 * STIX Observables list
 */
export const StixObservables
    = new Set<string>([
        "artifact", "directory", "file", "mutex", "process", "software",
        "user_account", "windows_registry_key", "x509_certificate",
        "autonomous_system", "domain_name", "email_address", "email_message",
        "ipv4_addr", "ipv6_addr", "mac_addr", "network_traffic", "url"
    ]);

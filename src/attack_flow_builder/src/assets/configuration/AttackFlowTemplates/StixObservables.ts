import { BoolEnum } from "./BoolEnum";
import { AnchorConfiguration } from "./AnchorFormat";
import { DiagramObjectType, PropertyType } from "@OpenChart/DiagramModel";
import type { DiagramObjectTemplate } from "@OpenChart/DiagramModel";

export const StixObservables: DiagramObjectTemplate[] = [
    {
        name: "artifact",
        namespace: ["stix_observable", "artifact"],
        type: DiagramObjectType.Block,
        properties: {
            mime_type: {
                type: PropertyType.String
            },
            payload_bin: {
                type: PropertyType.String
            },
            url: {
                type: PropertyType.String
            },
            hashes: {
                type: PropertyType.List,
                form: {
                    type: PropertyType.Dictionary,
                    form: {
                        hash_type: {
                            type: PropertyType.Enum,
                            options: {
                                type: PropertyType.List,
                                form: { type: PropertyType.String },
                                default: [
                                    ["custom", "Custom Hash Key"],
                                    ["md5", "MD5"],
                                    ["sha-1", "SHA-1"],
                                    ["sha-256", "SHA-256"],
                                    ["sha-512", "SHA-512"],
                                    ["sha3-256", "SHA3-256"],
                                    ["ssdeep", "SSDEEP"],
                                    ["tlsh", "TLSH"]
                                ]
                            }
                        },
                        hash_value: {
                            type: PropertyType.String,
                            is_representative: true
                        }
                    }
                }
            },
            encryption_algorithm: {
                type: PropertyType.Enum,
                options: {
                    type: PropertyType.List,
                    form: { type: PropertyType.String },
                    default: [
                        ["AES-256-GCM", "AES-256-GCM"],
                        ["ChaCha20-Poly1305", "ChaCha20-Poly1305"],
                        ["mime-type-indicated", "Mime Type Indicated"]
                    ]
                }
            },
            decryption_key: {
                type: PropertyType.String
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "autonomous_system",
        namespace: ["stix_observable", "autonomous_system"],
        type: DiagramObjectType.Block,
        properties: {
            number: {
                type: PropertyType.Int,
                is_representative: true,
                metadata: {
                    validator: {
                        is_required: true
                    }
                }
            },
            name: {
                type: PropertyType.String
            },
            rir: {
                type: PropertyType.String
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "directory",
        namespace: ["stix_observable", "directory"],
        type: DiagramObjectType.Block,
        properties: {
            path: {
                type: PropertyType.String,
                is_representative: true,
                metadata: {
                    validator: {
                        is_required: true
                    }
                }
            },
            path_enc: {
                type: PropertyType.String
            },
            ctime: {
                type: PropertyType.Date
            },
            mtime: {
                type: PropertyType.Date
            },
            atime: {
                type: PropertyType.Date
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "domain_name",
        namespace: ["stix_observable", "domain_name"],
        type: DiagramObjectType.Block,
        properties: {
            value: {
                type: PropertyType.String,
                metadata: {
                    validator: {
                        is_required: true
                    }
                }
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "email_address",
        namespace: ["stix_observable", "email_address"],
        type: DiagramObjectType.Block,
        properties: {
            value: {
                type: PropertyType.String,
                metadata: {
                    validator: {
                        is_required: true
                    }
                }
            },
            display_name: {
                type: PropertyType.String
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "email_message",
        namespace: ["stix_observable", "email_message"],
        type: DiagramObjectType.Block,
        properties: {
            is_multipart: {
                ...BoolEnum,
                metadata: {
                    validator: {
                        is_required: true
                    }
                }
            },
            date: {
                type: PropertyType.String
            },
            content_type: {
                type: PropertyType.String
            },
            message_name: {
                type: PropertyType.String
            },
            subject: {
                type: PropertyType.String,
                is_representative: true
            },
            received_lines: {
                type: PropertyType.String
            },
            additional_header_fields: {
                type: PropertyType.String
            },
            body: {
                type: PropertyType.String
            },
            body_multipart: {
                type: PropertyType.String
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "file",
        namespace: ["stix_observable", "file"],
        type: DiagramObjectType.Block,
        properties: {
            name: {
                type: PropertyType.String,
                is_representative: true
            },
            name_enc: {
                type: PropertyType.String
            },
            size: {
                type: PropertyType.Int
            },
            hashes: {
                type: PropertyType.List,
                form: {
                    type: PropertyType.Dictionary,
                    form: {
                        hash_type: {
                            type: PropertyType.Enum,
                            options: {
                                type: PropertyType.List,
                                form: { type: PropertyType.String },
                                default: [
                                    ["custom", "Custom Hash Key"],
                                    ["md5", "MD5"],
                                    ["sha-1", "SHA-1"],
                                    ["sha-256", "SHA-256"],
                                    ["sha-512", "SHA-512"],
                                    ["sha3-256", "SHA3-256"],
                                    ["ssdeep", "SSDEEP"],
                                    ["tlsh", "TLSH"]
                                ]
                            }
                        },
                        hash_value: {
                            type: PropertyType.String,
                            is_representative: true
                        }
                    }
                }
            },
            magic_number_hex: {
                type: PropertyType.String
            },
            mime_type: {
                type: PropertyType.String
            },
            ctime: {
                type: PropertyType.Date
            },
            mtime: {
                type: PropertyType.Date
            },
            atime: {
                type: PropertyType.Date
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "ipv4_addr",
        namespace: ["stix_observable", "ipv4_addr"],
        type: DiagramObjectType.Block,
        properties: {
            value: {
                type: PropertyType.String,
                metadata: {
                    validator: {
                        is_required: true
                    }
                }
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "ipv6_addr",
        namespace: ["stix_observable", "ipv6_addr"],
        type: DiagramObjectType.Block,
        properties: {
            value: {
                type: PropertyType.String,
                metadata: {
                    validator: {
                        is_required: true
                    }
                }
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "mac_addr",
        namespace: ["stix_observable", "mac_addr"],
        type: DiagramObjectType.Block,
        properties: {
            value: {
                type: PropertyType.String,
                metadata: {
                    validator: {
                        is_required: true
                    }
                }
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "mutex",
        namespace: ["stix_observable", "mutex"],
        type: DiagramObjectType.Block,
        properties: {
            name: {
                type: PropertyType.String,
                metadata: {
                    validator: {
                        is_required: true
                    }
                }
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "network_traffic",
        namespace: ["stix_observable", "network_traffic"],
        type: DiagramObjectType.Block,
        properties: {
            start: {
                type: PropertyType.Date
            },
            end: {
                type: PropertyType.Date
            },
            is_active: BoolEnum,
            src_port: {
                type: PropertyType.Int,
                min: 0,
                max: 65535
            },
            dst_port: {
                type: PropertyType.Int,
                min: 0,
                max: 65535
            },
            protocols: {
                type: PropertyType.List,
                form: {
                    type: PropertyType.String,
                    metadata: {
                        validator: {
                            is_required: true
                        }
                    }
                },
                metadata: {
                    validator: {
                        min_items: 1
                    }
                }
            },
            src_byte_count: {
                type: PropertyType.Int,
                min: 0
            },
            dst_byte_count: {
                type: PropertyType.Int,
                min: 0
            },
            src_packets: {
                type: PropertyType.Int,
                min: 0
            },
            dst_packets: {
                type: PropertyType.Int,
                min: 0
            },
            ipfix: {
                type: PropertyType.String
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "process",
        namespace: ["stix_observable", "process"],
        type: DiagramObjectType.Block,
        properties: {
            is_hidden: BoolEnum,
            pname: {
                type: PropertyType.Int,
                min: 0
            },
            created_time: {
                type: PropertyType.Date
            },
            cwd: {
                type: PropertyType.String
            },
            command_line: {
                type: PropertyType.String,
                metadata: {
                    validator: {
                        is_required: true
                    }
                }
            },
            environment_variables: {
                type: PropertyType.String
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "software",
        namespace: ["stix_observable", "software"],
        type: DiagramObjectType.Block,
        properties: {
            name: {
                type: PropertyType.String,
                is_representative: true,
                metadata: {
                    validator: {
                        is_required: true
                    }
                }
            },
            cpe: {
                type: PropertyType.String
            },
            languages: {
                type: PropertyType.List,
                form: { type: PropertyType.String }
            },
            vendor: {
                type: PropertyType.String
            },
            version: {
                type: PropertyType.String
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "url",
        namespace: ["stix_observable", "url"],
        type: DiagramObjectType.Block,
        properties: {
            value: {
                type: PropertyType.String,
                metadata: {
                    validator: {
                        is_required: true
                    }
                }
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "user_account",
        namespace: ["stix_observable", "user_account"],
        type: DiagramObjectType.Block,
        properties: {
            user_name: {
                type: PropertyType.String
            },
            credential: {
                type: PropertyType.String
            },
            account_login: {
                type: PropertyType.String
            },
            account_type: {
                type: PropertyType.String
            },
            display_name: {
                type: PropertyType.String,
                is_representative: true,
                metadata: {
                    validator: {
                        is_required: true
                    }
                }
            },
            is_service_account: BoolEnum,
            is_privileged: BoolEnum,
            can_escalate_privs: BoolEnum,
            is_disabled: BoolEnum,
            account_created: {
                type: PropertyType.Date
            },
            account_expires: {
                type: PropertyType.Date
            },
            credential_last_changed: {
                type: PropertyType.Date
            },
            account_first_login: {
                type: PropertyType.Date
            },
            account_last_login: {
                type: PropertyType.Date
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "windows_registry_key",
        namespace: ["stix_observable", "windows_registry_key"],
        type: DiagramObjectType.Block,
        properties: {
            key: {
                type: PropertyType.String,
                is_representative: true
            },
            values: {
                type: PropertyType.List,
                form: {
                    type: PropertyType.Dictionary,
                    form: {
                        name: {
                            type: PropertyType.String
                        },
                        data: {
                            type: PropertyType.String,
                            is_representative: true
                        },
                        data_type: {
                            type: PropertyType.Enum,
                            options: {
                                type: PropertyType.List,
                                form: { type: PropertyType.String },
                                default: [
                                    ["REG_NONE", "REG_NONE"],
                                    ["REG_SZ", "REG_SZ"],
                                    ["REG_EXPAND_SZ", "REG_EXPAND_SZ"],
                                    ["REG_BINARY", "REG_BINARY"],
                                    ["REG_DWORD", "REG_DWORD"],
                                    ["REG_DWORD_BIG_ENDIAN", "REG_DWORD_BIG_ENDIAN"],
                                    ["REG_DWORD_LITTLE_ENDIAN", "REG_DWORD_LITTLE_ENDIAN"],
                                    ["REG_LINK", "REG_LINK"],
                                    ["REG_MULTI_SZ", "REG_MULTI_SZ"],
                                    ["REG_RESOURCE_LIST", "REG_RESOURCE_LIST"],
                                    ["REG_FULL_RESOURCE_DESCRIPTION", "REG_FULL_RESOURCE_DESCRIPTION"],
                                    ["REG_RESOURCE_REQUIREMENTS_LIST", "REG_RESOURCE_REQUIREMENTS_LIST"],
                                    ["REG_QWORD", "REG_QWORD"],
                                    ["REG_INVALID_TYPE", "REG_INVALID_TYPE"]
                                ]
                            }
                        }
                    }
                }
            },
            modified_time: {
                type: PropertyType.Date
            },
            number_of_subkeys: {
                type: PropertyType.Int,
                min: 0
            }
        },
        anchors: AnchorConfiguration
    },
    {
        name: "x509_certificate",
        namespace: ["stix_observable", "x509_certificate"],
        type: DiagramObjectType.Block,
        properties: {
            subject: {
                type: PropertyType.String,
                is_representative: true,
                metadata: {
                    validator: {
                        is_required: true
                    }
                }
            },
            is_self_signed: BoolEnum,
            hashes: {
                type: PropertyType.List,
                form: {
                    type: PropertyType.Dictionary,
                    form: {
                        hash_type: {
                            type: PropertyType.Enum,
                            options: {
                                type: PropertyType.List,
                                form: { type: PropertyType.String },
                                default: [
                                    ["custom", "Custom Hash Key"],
                                    ["md5", "MD5"],
                                    ["sha-1", "SHA-1"],
                                    ["sha-256", "SHA-256"],
                                    ["sha-512", "SHA-512"],
                                    ["sha3-256", "SHA3-256"],
                                    ["ssdeep", "SSDEEP"],
                                    ["tlsh", "TLSH"]
                                ]
                            }
                        },
                        hash_value: {
                            type: PropertyType.String,
                            is_representative: true
                        }
                    }
                }
            },
            version: {
                type: PropertyType.String
            },
            serial_number: {
                type: PropertyType.String
            },
            signature_algorithm: {
                type: PropertyType.String
            },
            issuer: {
                type: PropertyType.String
            },
            validity_not_before: {
                type: PropertyType.Date
            },
            validity_not_after: {
                type: PropertyType.Date
            },
            subject_public_key_algorithm: {
                type: PropertyType.String
            },
            subject_public_key_modulus: {
                type: PropertyType.String
            },
            subject_public_key_exponent: {
                type: PropertyType.Int,
                min: 0
            }
        },
        anchors: AnchorConfiguration
    }
];

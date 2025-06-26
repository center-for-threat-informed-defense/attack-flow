import AttackFlowValidator from "./validator/AttackFlowValidator";
import AttackFlowPublisher from "./publisher/AttackFlowPublisher";
import { DarkTheme } from "./themes/DarkTheme";
import { BlogTheme } from "./themes/BlogTheme";
import { LightTheme } from "./themes/LightTheme";
import { CtidIcon, CtidLogo } from "./images";
import {
    AttackFlow,
    AttackFlowObjects,
    BaseObjects,
    StixObjects,
    StixObservables
} from "./templates";
import type { AppConfiguration } from "../scripts/Application";

const configuration: AppConfiguration = {

    /**
     * The application's name.
     */
    application_name: "Attack Flow Builder",

    /**
     * The application's icon.
     */
    application_icon: CtidIcon,

    /**
     * The application file type's name.
     */
    file_type_name: "Attack Flow",

    /**
     * The application file type's extension.
     */
    file_type_extension: "afb",

    /**
     * The application's splash screen configuration.
     */
    splash: {
        organization: CtidLogo,
        new_file: {
            title: "New Flow",
            description: "Create a new, blank Flow."
        },
        open_file: {
            title: "Open Flow",
            description: "Open an existing Flow."
        },
        help_links: [
            {
                title: "Example Flows",
                description: "Visit a list of example Flows.",
                url: "https://center-for-threat-informed-defense.github.io/attack-flow/example_flows/"
            },
            {
                title: "Builder Help",
                description: "Read the Builder's User Guide.",
                url: "https://center-for-threat-informed-defense.github.io/attack-flow/builder/"
            }
        ]
    },

    /**
     * The application's schema.
     */
    schema: {
        id: "attack_flow_v2",
        canvas: AttackFlow,
        templates: [
            ...AttackFlowObjects,
            ...StixObjects,
            ...StixObservables,
            ...BaseObjects
        ]
    },

    /**
     * The application's themes.
     */
    themes: [
        BlogTheme,
        DarkTheme,
        LightTheme
    ],

    /**
     * The application's menus.
     */
    menus: {
        help_menu: {
            help_links: [
                {
                    text: "Attack Flow Website",
                    url: "https://center-for-threat-informed-defense.github.io/attack-flow/"
                },
                {
                    text: "Attack Flow Builder Help",
                    url: "https://center-for-threat-informed-defense.github.io/attack-flow/builder/"
                },
                {
                    text: "MITRE ATT&CK Framework",
                    url: "https://attack.mitre.org/"
                },
                {
                    text: "GitHub Repository",
                    url: "https://github.com/center-for-threat-informed-defense/attack-flow"
                },
                {
                    text: "Change Log",
                    url: "https://center-for-threat-informed-defense.github.io/attack-flow/builder/"
                }
            ]
        }
    },

    validator: AttackFlowValidator,

    publisher: AttackFlowPublisher,

    publisherMenuText: "Export STIX File"

};

export default configuration;

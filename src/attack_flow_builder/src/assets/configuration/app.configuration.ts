import { DarkTheme } from "./themes/DarkTheme";
import { BlogTheme } from "./themes/BlogTheme";
import { DiagramObjectType } from "@OpenChart/DiagramModel";
import { AttackFlow, AttackFlowObjects, StixObjects, StixObservables } from "./templates";
import type { AppConfiguration } from "../scripts/Application";


const configuration: AppConfiguration = {

    /**
     * The application's name.
     */
    application_name: "Attack Flow Builder",

    /**
     * The application's icon.
     */
    application_icon: "",

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
        organization: "",
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
            {
                name: "generic_line",
                type: DiagramObjectType.Line,
                latch_template: {
                    source: "generic_latch",
                    target: "generic_latch"
                },
                handle_template: "generic_handle"
            },
            {
                name: "generic_line_vert",
                type: DiagramObjectType.Line,
                latch_template: {
                    source: "generic_latch",
                    target: "generic_latch"
                },
                handle_template: "generic_handle"
            },
            {
                name: "vertical_anchor",
                type: DiagramObjectType.Anchor
            },
            {
                name: "horizontal_anchor",
                type: DiagramObjectType.Anchor
            },
            {
                name: "generic_latch",
                type: DiagramObjectType.Latch
            },
            {
                name: "generic_handle",
                type: DiagramObjectType.Handle
            }
        ]
    },

    /**
     * The application's themes.
     */
    themes: [
        BlogTheme,
        DarkTheme
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
    }

};

export default configuration;

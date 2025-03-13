import { DarkStyle } from "@OpenChart/ThemeLoader";
import { Alignment, FaceType } from "@OpenChart/DiagramView";
import { DiagramObjectType, PropertyType } from "@OpenChart/DiagramModel";
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
        id: "sample_schema",
        canvas: {
            name: "generic_canvas",
            type: DiagramObjectType.Canvas,
            properties: {
                author: {
                    type: PropertyType.String,
                    is_representative: true
                }
            }
        },
        templates: [
            {
                name: "generic_block",
                type: DiagramObjectType.Block,
                anchors: {
                    up    : "generic_anchor",
                    left  : "generic_anchor",
                    down  : "generic_anchor",
                    right : "generic_anchor"
                },
                properties: {
                    name: {
                        type: PropertyType.String,
                        is_representative: true
                    },
                    size: {
                        type: PropertyType.Int,
                        min: 0,
                        max: 10,
                        default: 100
                    }
                }
            },
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
                name: "generic_anchor",
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
        {
            id: "dark_theme",
            name: "Dark Theme",
            designs: {
                generic_canvas: {
                    type: FaceType.LineGridCanvas,
                    attributes: Alignment.Grid,
                    grid: [10, 10],
                    style: DarkStyle.Canvas()
                },
                generic_block: {
                    type: FaceType.DictionaryBlock,
                    attributes: Alignment.Grid,
                    style: DarkStyle.DictionaryBlock()
                },
                generic_line: {
                    type: FaceType.HorizontalElbowLine,
                    attributes: Alignment.Grid,
                    style: DarkStyle.Line()
                },
                generic_anchor: {
                    type: FaceType.AnchorPoint,
                    attributes: Alignment.Free,
                    style: DarkStyle.Point()
                },
                generic_latch: {
                    type: FaceType.LatchPoint,
                    attributes: Alignment.Grid,
                    style: DarkStyle.Point()
                },
                generic_handle: {
                    type: FaceType.HandlePoint,
                    attributes: Alignment.Grid,
                    style: DarkStyle.Point()
                }
            }
        }
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

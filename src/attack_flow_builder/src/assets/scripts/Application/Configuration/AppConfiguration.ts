import type { SplashButton } from "./SplashButton";
import type { FileValidator } from "../FileValidator";
import type { FilePublisher } from "../FilePublisher";
import type { DiagramThemeConfiguration } from "@OpenChart/ThemeLoader";
import type { DiagramSchemaConfiguration } from "@OpenChart/DiagramModel";

export interface AppConfiguration {

    /**
     * The application's name.
     */
    application_name: string;

    /**
     * The application's icon.
     */
    application_icon: string;

    /**
     * The application file type's name.
     */
    file_type_name: string;

    /**
     * The application file type's extension.
     */
    file_type_extension: string;

    /**
     * The application's splash screen configuration.
     */
    splash: {

        /**
         * The organization's logo.
         */
        organization: string;

        /**
         * New file splash button.
         */
        new_file: SplashButton;

        /**
         * Open file splash button.
         */
        open_file: SplashButton;

        /**
         * Help link splash buttons.
         */
        help_links: SplashButton[];

    };

    /**
     * The application's schema.
     */
    schema: DiagramSchemaConfiguration;

    /**
     * The application's themes.
     */
    themes: DiagramThemeConfiguration[];

    /**
     * The application's menus.
     */
    menus: {
        help_menu: {
            help_links: { text: string, url: string }[];
        };
    };

    /**
     * The application's validator.
     */
    validator?: typeof FileValidator,

    /**
     * The application's publisher.
     */
    publisher?: typeof FilePublisher,

    /**
     * The publisher's menu text.
     */
    publisherMenuText?: string

}

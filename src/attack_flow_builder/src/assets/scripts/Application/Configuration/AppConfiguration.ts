import type { SplashButton } from "./SplashButton";
import type { FileValidator } from "../FileValidator";
import type { FilePublisher } from "../FilePublisher";
import type { FilePreprocessor } from "../FilePreprocessor";
import type { DiagramThemeConfiguration } from "@OpenChart/ThemeLoader";
import type { DiagramSchemaConfiguration } from "@OpenChart/DiagramModel";
import type { SynchronousCommandProcessor } from "@OpenChart/DiagramEditor";

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
         * Import STIX file button.
         */
        import_stix: SplashButton;

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
    validator?: {

        /**
         * The application's validator.
         * @remarks
         *  `create` should return a new validator.
         */
        create: () => FileValidator;

    };

    /**
     * The application's publisher.
     */
    publisher?: {

        /**
         * The publisher's menu text.
         */
        menuText?: string;

        /**
         * The application's publisher.
         * @remarks
         *  `create` should return a new migrator.
         */
        create: () => FilePublisher;

    };

    /**
     * The application's file preprocessor.
     */
    filePreprocessor?: {

        /**
         * The application's file preprocessor.
         * @remarks
         *  `create` should return a new file preprocessor.
         */
        create: () => FilePreprocessor;

    };

    /**
     * The application's command processor.
     */
    cmdProcessor?: {

        create: () => SynchronousCommandProcessor;

    };

}

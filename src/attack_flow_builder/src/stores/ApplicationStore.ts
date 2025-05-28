import Configuration from "@/assets/configuration/app.configuration";
import { FileStore } from "@/assets/scripts/Browser";
import { defineStore } from "pinia";
import { PhantomEditor } from "./PhantomEditor";
import { BaseAppSettings } from "@/assets/scripts/Application";
import { OpenChartFinder } from "@/assets/scripts/OpenChartFinder";
import { ThemeRegistry, ThemeSourceFile } from "@OpenChart/ThemeRegistry";
import { BasicRecommender, DiagramViewEditor, EditorCommand } from "@OpenChart/DiagramEditor";
import type { AppCommand } from "@/assets/scripts/Application";
import type { DiagramObjectView } from "@OpenChart/DiagramView";
import { DateTime } from "luxon";


///////////////////////////////////////////////////////////////////////////////
//  1. Registry Configuration  ////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


// const Publisher = Configuration.publisher ?
//     new Configuration.publisher() : undefined;

// const Processor = Configuration.processor ?
//     new Configuration.processor() : undefined;

// Configure theme registry
const themeRegistry = new ThemeRegistry();
for (const theme of Configuration.themes) {
    themeRegistry.registerTheme(new ThemeSourceFile(theme));
}


///////////////////////////////////////////////////////////////////////////////
//  2. Application Store  /////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export const useApplicationStore = defineStore("applicationStore", {
    state: () => ({
        themeRegistry: themeRegistry,
        fileRecoveryBank: new FileStore("__recovery_bank_"),
        activeEditor: PhantomEditor,
        activeRecommender: new BasicRecommender(),
        activeFinder: new OpenChartFinder<DiagramViewEditor, DiagramObjectView>(),
        settings: BaseAppSettings,
        recentTimezone: DateTime.local().toFormat("ZZ")
    }),
    getters: {

        ///////////////////////////////////////////////////////////////////////
        //  1. Application Selection  /////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Tests if the active editor has a selection.
         * @returns
         *  The number of items selected.
         */
        hasSelection(): number {
            return this.getSelection.length;
        },

        /**
         * Returns the active editor's selection.
         * @returns
         *  The selected objects.
         */
        getSelection(): DiagramObjectView[] {
            return [...this.activeEditor.selection.values()];
        },


        ///////////////////////////////////////////////////////////////////////
        //  3. Application Command History  ///////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Tests if the last command on the active editor can be undone.
         * @returns
         *  True if the last command can be undone, false otherwise.
         */
        canUndo(): boolean {
            return this.activeEditor.canUndo();
        },

        /**
         * Tests if the last undone command on the active editor can be redone.
         * @returns
         *  True if the last undone command can be redone, false otherwise.
         */
        canRedo(): boolean {
            return this.activeEditor.canRedo();
        },


        ///////////////////////////////////////////////////////////////////////
        //  4. Application Page Validation  ///////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Tests if the active page represents a valid diagram per the
         * configured validator. If the application is not configured with a
         * validator, true is returned by default.
         * @param state
         *  The Vuex state.
         * @returns
         *  True if the page is valid, false otherwise.
         */
        isValid(): boolean {
            // const p = state.activeEditor;
            // Use trigger to trip the reactivity system
            // return (p.trigger.value ? p : p).isValid();
            return true;
        },

        /**
         * Returns the active page's validation errors. If the application is
         * not configured with a validator, an empty array is returned.
         * @param state
         *  The Vuex state.
         * @returns
         *  The active page's validation errors.
         */
        getValidationErrors(): any[] {
            // const p = state.activeEditor;
            // Use trigger to trip the reactivity system
            // return (p.trigger.value ? p : p).getValidationErrors();
            return [];
        },

        /**
         * Returns the active page's validation warnings. If the application is
         * not configured with a validator, an empty array is returned.
         * @param state
         *  The Vuex state.
         * @returns
         *  The active page's validation warnings.
         */
        getValidationWarnings(): any[] {
            // const p = state.activeEditor;
            // Use trigger to trip the reactivity system
            // return (p.trigger.value ? p : p).getValidationWarnings();
            return [];
        },


        ///////////////////////////////////////////////////////////////////////
        //  5. Application Search Menu  ///////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Indicates whether the find dialog is visible.
         * @param state
         *  The Vuex state.
         * @returns
         *  True if the find dialog is visible.
         */
        isShowingFindDialog(state): boolean {
            return state.settings.view.search.display;
        },


        ///////////////////////////////////////////////////////////////////////
        //  6. Application Splash Menu  ///////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////

        /**
         * Indicates whether the splash menu is visible.
         * @param state
         *  The Vuex state.
         * @returns
         *  True if the splash menu is visible.
         */
        isShowingSplash(state): boolean {
            return state.settings.view.splash_menu.display_menu;
        },

        /**
         * Get recently used timezone to pre-populate DateTime fields
         * @param state
         * the Vuex state
         * @returns
         * the UTC offset last used
         */
        stickyTimezone(state): string {
            return state.recentTimezone;
        }

    },
    actions: {

        /**
         * Executes an application command.
         * @param state
         *  The Vuex state.
         * @param command
         *  The application command.
         */
        async execute(command: AppCommand | EditorCommand) {
            if (command instanceof EditorCommand) {
                await this.activeEditor.execute(command);
            } else {
                command.execute();
            }
        },
        /**
         * Updates sticky timezone with most recently used timezone offset
         * @param utc new value to save
         */
        setStickyTimezone(utc: string) {
            this.recentTimezone = utc;
        }

    }

});

export type ApplicationStore = ReturnType<typeof useApplicationStore>;

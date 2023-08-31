import Configuration from "@/assets/configuration/builder.config";
import { Module } from "vuex"
import { PageEditor } from "@/store/PageEditor";
import { AppCommand } from "@/store/Commands/AppCommand";
import { PageCommand } from "@/store/Commands/PageCommand";
import { Finder } from "../Finder";
import { PageRecoveryBank } from "../PageRecoveryBank";
import { DiagramObjectModel } from "@/assets/scripts/BlockDiagram";
import { ValidationErrorResult, ValidationWarningResult } from "@/assets/scripts/DiagramValidator";
import { ModuleStore, ApplicationStore, BaseAppSettings } from "@/store/StoreTypes"
import { FindResult } from "@/store/Finder";

const Publisher = Configuration.publisher ? 
    new Configuration.publisher() : undefined;

const Processor = Configuration.processor ?
    new Configuration.processor() : undefined;

export default {
    namespaced: true,
    state: {
        settings: BaseAppSettings,
        clipboard: [],
        publisher: Publisher,
        processor: Processor,
        activePage: PageEditor.createDummy(),
        finder: new Finder(),
        recoveryBank: new PageRecoveryBank(),
    },
    getters: {

        
        ///////////////////////////////////////////////////////////////////////
        //  1. Application Clipboard  /////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Tests if the clipboard has contents.
         * @param state
         *  The Vuex state.
         * @returns
         *  True if the clipboard has contents, false otherwise.
         */
        hasClipboardContents(state): boolean {
            return 0 < state.clipboard.length;
        },


        ///////////////////////////////////////////////////////////////////////
        //  2. Application Selection  /////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Tests if the active page has a selection.
         * @param state
         *  The Vuex state.
         * @returns
         *  The number of items selected.
         */
        hasSelection(state): number {
            let s = [...state.activePage.page.getSubtree(o => o.isSelected())];
            // Use trigger to trip the reactivity system
            return (state.activePage.trigger.value ? s : s).length;
        },

        /**
         * Returns the active page's selection.
         * @param state
         *  The Vuex state.
         * @returns
         *  The selected objects.
         */
        getSelection(state): DiagramObjectModel[] {
            let s = [...state.activePage.page.getSubtree(o => o.isSelected())];
            // Use trigger to trip the reactivity system
            return state.activePage.trigger.value ? s : s;
        },


        ///////////////////////////////////////////////////////////////////////
        //  3. Application Command History  ///////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Tests if the last command on the active page can be undone.
         * @returns
         *  True if the last command can be undone, false otherwise.
         */
        canUndo(state): boolean {
            let p = state.activePage;
            // Use trigger to trip the reactivity system
            return (state.activePage.trigger.value ? p : p).canUndo();
        },

        /**
         * Tests if the last undone command on the active page can be redone.
         * @returns
         *  True if the last undone command can be redone, false otherwise.
         */
        canRedo(state): boolean {
            let p = state.activePage;
            // Use trigger to trip the reactivity system
            return (state.activePage.trigger.value ? p : p).canRedo();
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
        isValid(state): boolean {
            let p = state.activePage;
            // Use trigger to trip the reactivity system
            return (state.activePage.trigger.value ? p : p).isValid();
        },

        /**
         * Returns the active page's validation errors. If the application is
         * not configured with a validator, an empty array is returned.
         * @param state
         *  The Vuex state.
         * @returns
         *  The active page's validation errors.
         */
        getValidationErrors(state): ValidationErrorResult[] {
            let p = state.activePage;
            // Use trigger to trip the reactivity system
            return (state.activePage.trigger.value ? p : p).getValidationErrors(); 
        },

        /**
         * Returns the active page's validation warnings. If the application is
         * not configured with a validator, an empty array is returned.
         * @param state
         *  The Vuex state.
         * @returns
         *  The active page's validation warnings.
         */
        getValidationWarnings(state): ValidationWarningResult[] {
            let p = state.activePage;
            // Use trigger to trip the reactivity system
            return (state.activePage.trigger.value ? p : p).getValidationWarnings();
        },


        ///////////////////////////////////////////////////////////////////////
        //  5. Application Page Find  /////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Indicates whether the find dialog is visible.
         * @param state
         *  The Vuex state.
         * @returns
         *  True if the find dialog is visible.
         */
        isShowingFindDialog(state): boolean {
            return state.finder.dialogIsVisible;
        },

        /**
         * Indicates if there are any find results.
         * @param state
         *  The Vuex state.
         * @returns
         *  True if there are any find results.
         */
        hasFindResults(state): boolean {
            return state.finder.getCurrentResult() !== null;
        },

        /**
         * Returns the current item in the find results.
         * @param state
         *  The Vuex state.
         * @returns
         *  The current item in the result set.
         */
        currentFindResult(state): FindResult | null {
            return state.finder.getCurrentResult();
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
        }

    },
    mutations: {

        /**
         * Executes an application command.
         * @param state
         *  The Vuex state. 
         * @param command
         *  The application command.
         */
        execute(state, command: AppCommand | PageCommand) {
            if(command instanceof PageCommand) {
                // Ignore null page
                if(command.page === PageCommand.NullPage)
                    return;
                // Execute command
                let wasRecorded = true;
                if(state.processor) {
                    for(let cmd of state.processor.process(command)) {
                        wasRecorded &&= state.activePage.execute(cmd);
                    }
                } else {
                    wasRecorded &&= state.activePage.execute(command);
                }
                if(wasRecorded) {
                    // If any commands were recorded to the page's undo
                    // history, store all progress in the recovery bank.
                    state.recoveryBank.storeEditor(state.activePage);
                };
            } else {
                command.execute();
            }
        }

    }
} as Module<ApplicationStore, ModuleStore>

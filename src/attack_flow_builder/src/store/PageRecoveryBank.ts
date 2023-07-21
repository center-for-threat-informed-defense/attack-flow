import { PageEditor } from "./PageEditor";

export class PageRecoveryBank {

    /**
     * The recovery bank's local storage prefix.
     */
    private static PREFIX = "__recovery_bank_"


    /**
     * The recovered page list.
     */
    public pages: Map<string, { name: string, file: string }>;


    /**
     * Creates a {@link PageRecoveryBank}.
     */
    constructor() {
        this.pages = new Map();
        for(let i = 0; i < localStorage.length; i++) {
            // Look up key
            let key = localStorage.key(i)!;
            if(!key.startsWith(PageRecoveryBank.PREFIX)) {
                continue;
            }
            let value = JSON.parse(localStorage.getItem(key)!);
            let id = key.substring(PageRecoveryBank.PREFIX.length);
            this.pages.set(id, value);
        }
    }


    /**
     * Stores a page editor in the bank.
     * @param editor
     *  The page editor.
     */
    public storeEditor(editor: PageEditor) {
        let pageDate = new Date().toLocaleString();
        let pageTitle = editor.page.props.toString();
        let key = `${ PageRecoveryBank.PREFIX }${ editor.id }`;
        let value = {
            name : `${ pageTitle } (${ pageDate })`,
            file : editor.toFile()
        };
        // Store page
        this.pages.set(editor.id, value);
        // Mirror to local storage
        localStorage.setItem(key, JSON.stringify(value));
    }

    /**
     * Withdrawals an editor from the bank.
     * @param editor
     *  The id of the page editor to withdrawal.
     */
    public withdrawalEditor(id: string) {
        let key = `${ PageRecoveryBank.PREFIX }${ id }`;
        if(localStorage.getItem(key) !== null) {
            // Withdrawal page
            this.pages.delete(id);
            // Mirror to local storage
            localStorage.removeItem(key);
        }
    }

}

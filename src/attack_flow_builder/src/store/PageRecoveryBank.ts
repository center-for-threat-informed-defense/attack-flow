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
        this.sortStore();
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
        // Resort store
        this.sortStore();
    }

    /**
     * Withdraws an editor from the bank.
     * @param editor
     *  The id of the page editor to withdraw.
     */
    public withdrawEditor(id: string) {
        let key = `${ PageRecoveryBank.PREFIX }${ id }`;
        if(localStorage.getItem(key) !== null) {
            // Withdraw page
            this.pages.delete(id);
            // Mirror to local storage
            localStorage.removeItem(key);
        }
    }

    /**
     * Sorts the page editor bank in reverse chronological order.
     */
    private sortStore() {
        let date = /^(?:.|\n)*\s{1}\((.*)\)$/m;
        let pages = [...this.pages];
        pages.sort((a, b) => {
            let parse1 = date.exec(a[1].name);
            let parse2 = date.exec(b[1].name);
            if(!parse1 || !parse2) {
                return 0;
            }
            let date1 = new Date(parse1[1]);
            let date2 = new Date(parse2[1]);
            return date2.getTime() - date1.getTime();
        });
        this.pages = new Map(pages);
    }

}

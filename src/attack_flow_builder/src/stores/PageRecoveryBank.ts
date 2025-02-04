import { PageEditor } from "./PageEditor";

export class PageRecoveryBank {

    /**
     * The recovery bank's local storage prefix.
     */
    private static PREFIX = "__recovery_bank_";


    /**
     * The recovered page list.
     */
    public pages: Map<string, { name: string, file: string }>;


    /**
     * Creates a {@link PageRecoveryBank}.
     */
    constructor() {
        this.pages = new Map();
        for (let i = 0; i < localStorage.length; i++) {
            // Look up key
            const key = localStorage.key(i)!;
            if (!key.startsWith(PageRecoveryBank.PREFIX)) {
                continue;
            }
            const value = JSON.parse(localStorage.getItem(key)!);
            const id = key.substring(PageRecoveryBank.PREFIX.length);
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
        const pageDate = new Date().toLocaleString();
        const pageTitle = editor.page.props.toString();
        const key = `${PageRecoveryBank.PREFIX}${editor.id}`;
        const value = {
            name : `${pageTitle} (${pageDate})`,
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
        const key = `${PageRecoveryBank.PREFIX}${id}`;
        if (localStorage.getItem(key) !== null) {
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
        const date = /^(?:.|\n)*\s{1}\((.*)\)$/m;
        const pages = [...this.pages];
        pages.sort((a, b) => {
            const parse1 = date.exec(a[1].name);
            const parse2 = date.exec(b[1].name);
            if (!parse1 || !parse2) {
                return 0;
            }
            const date1 = new Date(parse1[1]);
            const date2 = new Date(parse2[1]);
            return date2.getTime() - date1.getTime();
        });
        this.pages = new Map(pages);
    }

}

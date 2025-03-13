export class FileStore {

    /**
     * The file store's local storage prefix.
     */
    public readonly prefix: string;

    /**
     * The file store's list of files.
     */
    public files: Map<string, { name: string, date: Date, contents: string }>;


    /**
     * Creates a {@link FileStore}.
     * @param prefix
     *  The file store's local storage prefix.
     */
    constructor(prefix: string) {
        this.prefix = prefix;
        this.files = new Map();
        for (let i = 0; i < localStorage.length; i++) {
            // Look up key
            const key = localStorage.key(i)!;
            if (!key.startsWith(this.prefix)) {
                continue;
            }
            // Parse id
            const id = key.substring(this.prefix.length);
            const value = JSON.parse(localStorage.getItem(key)!);
            // Parse value
            value.date = new Date(value.date);
            this.files.set(id, value);
        }
        this.sortStore();
    }


    /**
     * Saves a file to the store.
     * @remarks
     *  If `id` matches an existing file in the store, that file will be
     *  replaced by the provided file.
     * @param id
     *  The file's id.
     * @param name
     *  The file's name.
     * @param contents
     *  The file's contents.
     */
    public saveFile(id: string, name: string, contents: string) {
        const key = `${this.prefix}${id}`;
        const value = {
            name     : name,
            date     : new Date(),
            contents : contents
        };
        // Store file
        this.files.set(id, value);
        // Mirror to local storage
        localStorage.setItem(key, JSON.stringify(value));
        // Resort store
        this.sortStore();
    }

    /**
     * Deletes a file from the store.
     * @param id
     *  The id of the file to delete.
     */
    public deleteFile(id: string) {
        const key = `${this.prefix}${id}`;
        if (localStorage.getItem(key) !== null) {
            // Withdraw file
            this.files.delete(id);
            // Mirror to local storage
            localStorage.removeItem(key);
        }
    }

    /**
     * Sorts the files in reverse chronological order.
     */
    private sortStore() {
        this.files = new Map(
            [...this.files].sort(
                (a, b) => b[1].date.getTime() - a[1].date.getTime()
            )
        );
    }

}

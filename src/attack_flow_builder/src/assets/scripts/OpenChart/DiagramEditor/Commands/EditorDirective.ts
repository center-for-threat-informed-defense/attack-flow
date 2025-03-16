export enum EditorDirective {

    /**
     * Specify if nothing should happen.
     */
    None             = 0b0000,

    /**
     * Specify if the command should be recorded to the undo history.
     */
    Record           = 0b0001,

    /**
     * Specify if the command should trigger an autosave.
     */
    Autosave         = 0b0010,

    /**
     * Specify if the editor should reindex the file's content.
     */
    ReindexContent   = 0b0100,

    /**
     * Specify if the editor should reindex the file's selection.
     */
    ReindexSelection = 0b1000

}

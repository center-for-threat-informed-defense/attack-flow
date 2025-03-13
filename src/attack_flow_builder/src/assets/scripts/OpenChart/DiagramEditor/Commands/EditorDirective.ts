export enum EditorDirective {

    /**
     * Specify if nothing should happen.
     */
    None     = 0b000,

    /**
     * Specify if the command should be recorded to the undo history.
     */
    Record   = 0b001,

    /**
     * Specify if the command should trigger an autosave.
     */
    Autosave = 0b010,

    /**
     * Specify if the editor should reindex its file after the command has run.
     */
    Reindex  = 0b100

}

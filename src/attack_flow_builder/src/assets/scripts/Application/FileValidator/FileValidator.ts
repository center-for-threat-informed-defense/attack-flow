import type { DiagramModelFile } from "@OpenChart/DiagramModel";
import type { ValidationErrorResult } from "./ValidationErrorResult";
import type { ValidationWarningResult } from "./ValidationWarningResult";

export class FileValidator {

    /**
     * The validator's error list.
     */
    private _errors: ValidationErrorResult[];

    /**
     * The validator's warning list.
     */
    private _warnings: ValidationWarningResult[];


    /**
     * Creates a new {@link FileValidator}.
     */
    constructor() {
        this._errors = [];
        this._warnings = [];
    }


    /**
     * Resets and runs the validator.
     * @param file
     *  The file object to validate.
     */
    public run(file: DiagramModelFile) {
        this.reset();
        this.validate(file);
    }

    /**
     * Validates a {@link DiagramModelFile}.
     * @param file
     *  The file to validate.
     */
    protected validate(_file: DiagramModelFile) {
        /**
         * We must keep `file` in this method header, otherwise `run()`
         * can't pass the object to `validate()` which will likely be
         * overridden by one or more child classes.
         */
    }

    /**
     * Returns the validator's current set of warnings.
     * @returns
     *  The validator's current set of warnings.
     */
    public getWarnings(): ValidationWarningResult[] {
        return this._warnings;
    }

    /**
     * Returns the validator's current set of errors.
     * @returns
     *  The validator's current set of errors.
     */
    public getErrors(): ValidationErrorResult[] {
        return this._errors;
    }

    /**
     * Adds a warning to the validator.
     * @param object
     *  The id of the object that failed to validate.
     * @param reason
     *  The reason the object failed to validate.
     */
    protected addWarning(object: string, reason: string) {
        this._warnings.push({ object, reason });
    }

    /**
     * Adds an error to the validator.
     * @param object
     *  The id of the object that failed to validate.
     * @param reason
     *  The reason the object failed to validate.
     */
    protected addError(object: string, reason: string) {
        this._errors.push({ object, reason });
    }

    /**
     * Tests if the validator is in a valid state.
     * @returns
     *  True if the validator is in a valid state, false otherwise.
     */
    public inValidState(): boolean {
        return this._errors.length === 0;
    }

    /**
     * Resets the validator's state.
     */
    public reset() {
        this._errors = [];
        this._warnings = [];
    }

}

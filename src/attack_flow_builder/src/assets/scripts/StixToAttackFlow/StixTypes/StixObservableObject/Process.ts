import type { Dictionary } from "../StixCommonDataTypes";
import type { StixObservableObjectBase } from "./StixObservableObjectBase";

/**
 * STIX 2.1 Process.
 * @remarks
 *  A Process object MUST contain at least one property (other than `type`) from
 *  this object (or one of its extensions).
 */
export interface Process extends StixObservableObjectBase<"process"> {

    /**
     * Specifies whether the process is hidden.
     */
    is_hidden?: boolean;

    /**
     * Specifies the Process ID, or PID, of the process.
     */
    pid?: number;

    /**
     * Specifies the date/time at which the process was created.
     */
    created_time?: string;

    /**
     * Specifies the current working directory of the process.
     */
    cwd?: string;

    /**
     * Specifies the full command line used in executing the process, including
     * the process name (which may be specified individually via the
     * image_ref.name property) and any arguments.
     */
    command_line?: string;

    /**
     * Specifies the list of environment variables associated with the process
     * as a dictionary. Each key in the dictionary MUST be a case preserved
     * version of the name of the environment variable, and each corresponding
     * value MUST be the environment variable value as a string.
     */
    environment_variables?: Dictionary;

    /**
     * Specifies the list of network connections opened by the process, as a
     * reference to one or more Network Traffic objects.
     *
     * The objects referenced in this list MUST be of type network-traffic.
     */
    opened_connection_refs?: string[];

    /**
     * Specifies the user that created the process, as a reference to a User
     * Account object.
     *
     * The object referenced in this property MUST be of type user-account.
     */
    creator_user_ref?: string;

    /**
     * Specifies the executable binary that was executed as the process image,
     * as a reference to a File object.
     *
     * The object referenced in this property MUST be of type file.
     */
    image_ref?: string;

    /**
     * Specifies the other process that spawned (i.e. is the parent of) this
     * one, as a reference to a Process object.
     *
     * The object referenced in this property MUST be of type process.
     */
    parent_ref?: string;

    /**
     * Specifies the other processes that were spawned by (i.e. children of)
     * this process, as a reference to one or more other Process objects.
     *
     * The objects referenced in this list MUST be of type process.
     */
    child_refs?: string[];

}

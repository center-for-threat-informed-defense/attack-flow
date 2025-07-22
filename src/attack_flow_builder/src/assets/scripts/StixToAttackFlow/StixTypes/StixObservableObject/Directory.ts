import type { StixObservableObjectBase } from "./StixObservableObjectBase";

/**
 * STIX 2.1 Directory.
 */
export interface Directory extends StixObservableObjectBase<"directory"> {

    /**
     * Specifies the path, as originally observed, to the directory on the file
     * system.
     */
    path: string;

    /**
     * Specifies the observed encoding for the path. The value MUST be specified
     * if the path is stored in a non-Unicode encoding. This value MUST be
     * specified using the corresponding name from the 2013-12-20 revision of
     * the IANA character set registry [Character Sets]. If the preferred MIME
     * name for a character set is defined, this value MUST be used; if it is
     * not defined, then the Name value from the registry MUST be used instead.
     */
    path_enc?: string;

    /**
     * Specifies the date/time the directory was created.
     */
    ctime?: string;

    /**
     * Specifies the date/time the directory was last written to/modified.
     */
    mtime?: string;

    /**
     * Specifies the date/time the directory was last accessed.
     */
    atime?: string;

    /**
     * Specifies a list of references to other File and/or Directory objects
     * contained within the directory.
     *
     * The objects referenced in this list MUST be of type file or directory.
     */
    contains_refs?: string[];

}

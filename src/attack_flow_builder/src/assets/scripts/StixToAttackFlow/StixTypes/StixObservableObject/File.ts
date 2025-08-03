import type { Hashes } from "../StixCommonDataTypes";
import type { StixObservableObjectBase } from "./StixObservableObjectBase";

/**
 * STIX 2.1 File.
 * @remarks
 *  A File object MUST contain at least one of `hashes` or `name`.
 */
export interface File extends StixObservableObjectBase<"file"> {

    /**
     * Specifies a dictionary of hashes for the file.
     *
     * (When used with the Archive File Extension, this refers to the hash of
     * the entire archive file, not its contents.)
     *
     * Dictionary keys MUST come from the hash-algorithm-ov open vocabulary.
     */
    hashes?: Hashes;

    /**
     * Specifies the size of the file, in bytes. The value of this property MUST
     * NOT be negative.
     */
    size?: number;

    /**
     * Specifies the name of the file.
     */
    name?: string;

    /**
     * Specifies the observed encoding for the name of the file. This value MUST
     * be specified using the corresponding name from the 2013-12-20 revision of
     * the IANA character set registry [Character Sets]. If the value from the
     * Preferred MIME Name column for a character set is defined, this value
     * MUST be used; if it is not defined, then the value from the Name column
     * in the registry MUST be used instead.
     *
     * This property allows for the capture of the original text encoding for
     * the file name, which may be forensically relevant; for example, a file on
     * an NTFS volume whose name was created using the windows-1251 encoding,
     * commonly used for languages based on Cyrillic script.
     */
    name_enc?: string;

    /**
     * Specifies the hexadecimal constant ("magic number") associated with a
     * specific file format that corresponds to the file, if applicable.
     */
    magic_number_hex?: string;

    /**
     * Specifies the MIME type name specified for the file, e.g.,
     * application/msword.
     *
     * Whenever feasible, this value SHOULD be one of the values defined in the
     * Template column in the IANA media type registry [Media Types].
     *
     * Maintaining a comprehensive universal catalog of all extant file types is
     * obviously not possible. When specifying a MIME Type not included in the
     * IANA registry, implementers should use their best judgement so as to
     * facilitate interoperability.
     */
    mime_type?: string;

    /**
     * Specifies the date/time the file was created.
     */
    ctime?: string;

    /**
     * Specifies the date/time the file was last written to/modified.
     */
    mtime?: string;

    /**
     * Specifies the date/time the file was last accessed.
     */
    atime?: string;

    /**
     * Specifies the parent directory of the file, as a reference to a Directory
     * object.
     *
     * The object referenced in this property MUST be of type directory.
     */
    parent_directory_ref?: string;

    /**
     * Specifies a list of references to other Cyber-observable Objects
     * contained within the file, such as another file that is appended to the
     * end of the file, or an IP address that is contained somewhere in the
     * file.
     *
     * This is intended for use cases other than those targeted by the Archive
     * extension.
     */
    contains_refs?: string[];

    /**
     * Specifies the content of the file, represented as an Artifact object.
     *
     * The object referenced in this property MUST be of type artifact.
     */
    content_ref?: string;

}

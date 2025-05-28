import type { AnchorView } from "../../Views";

export type BranchDescriptor = {

    /**
     * The branch's anchor id.
     */
    id: string;

    /**
     * The branch's name.
     */
    name: string;

    /**
     * The branch's anchor.
     */
    anchor: AnchorView;

};

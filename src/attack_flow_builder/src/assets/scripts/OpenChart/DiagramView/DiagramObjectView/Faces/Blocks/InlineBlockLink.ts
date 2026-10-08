import type { BlockView } from "../../Views";

/** A link rendered immediately after a named block property. */
export type InlineBlockLink = {
    afterField: string;
    text: string;
    url: string;
    color?: string;
};

/** Supplies contextual inline links for a block without coupling the renderer to a domain. */
export type InlineBlockLinkResolver = (view: BlockView) => Iterable<InlineBlockLink>;

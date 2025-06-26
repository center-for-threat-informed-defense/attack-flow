export * from "./DirectiveArguments";
export * from "./DirectiveIssuer";
export * from "./EditorDirective";

import { EditorDirective } from "./EditorDirective";
import type { DirectiveArguments } from "./DirectiveArguments";
import type { DirectiveIssuer } from "./DirectiveIssuer";

/**
 * Creates a new set of {@link DirectiveArguments}.
 * @returns
 *  A new set of {@link DirectiveArguments} and a function which can issue
 *  updates to the arguments.
 */
export function newDirectiveArguments(): {
    args: DirectiveArguments;
    issuer: DirectiveIssuer;
} {
    // Create directive arguments
    const args: DirectiveArguments = {
        directives: EditorDirective.None,
        index: new Set()
    };
    // Create directive issuer
    const issuer = (dirs: EditorDirective, obj?: string) => {
        // Update directives
        args.directives = args.directives | dirs;
        // Update items to reindex
        if (dirs & EditorDirective.ReindexContent && obj) {
            args.index.add(obj);
        }
    };
    return { args, issuer };
}

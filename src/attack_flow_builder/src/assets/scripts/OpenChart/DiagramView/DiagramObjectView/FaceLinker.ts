import type { DiagramFace } from "./Faces";
import type { DiagramObjectView } from "./Views";

/**
 * Safely links a {@link DiagramFace} to a {@link DiagramObjectView}.
 * @remarks
 *  Ideally, objects that share mutual references should configure them on
 *  their own and in such a way that they're always stable. Unfortunately, this
 *  is a non-trivial process when implemented within the context of each class
 *  and generally requires 2 functions to be mirrored across each class.
 *
 *  To cut down on the redundancy and complexity this would impose on
 *  {@link DiagramObjectView} classes. This linking logic has been exported to
 *  this function so it can be shared amongst the view classes.
 *
 *  Unfortunately, because TypeScript lacks an `internal` modifier (à la C#),
 *  we must forcibly cast `face` and `view` to access their hidden fields.
 * @param face
 *  The {@link DiagramFace}.
 * @param view
 *  The {@link DiagramObjectView}.
 */
export function linkFaceToView(face: DiagramFace, view: DiagramObjectView) {
    type FaceInternal = { view: ViewInternal | null };
    type ViewInternal = { _face: FaceInternal | null };
    // Cast face and view
    const faceInternal = face as unknown as FaceInternal;
    const viewInternal = view as unknown as ViewInternal;
    // Remove existing links
    if (faceInternal.view) {
        faceInternal.view._face = null;
    }
    if (viewInternal._face) {
        viewInternal._face.view = null;
    }
    // Update links
    faceInternal.view = viewInternal;
    viewInternal._face = faceInternal;
}

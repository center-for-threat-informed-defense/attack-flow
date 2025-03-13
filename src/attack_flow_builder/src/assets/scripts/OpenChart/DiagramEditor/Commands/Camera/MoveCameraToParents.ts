export class MoveCameraToParents extends GroupCommand {

    /**
     * Interprets an object's selected children as a graph and focuses the
     * camera on their (graph-wise) parents.
     * @param context
     *  The application context.
     * @param object
     *  The object.
     */
    constructor(context: ApplicationStore, object: DiagramObjectModel) {
        super();
        const objects = object.children.filter(c => c.isSelected());
        if (!objects.length) {
            return;
        }
        // Get (graph-wise) parents
        const parents = new Set<DiagramObjectModel>();
        for (const obj of objects) {
            for (const n of this.getPrevBlocks(obj)) {
                parents.add(n);
            }
        }
        // Unselect objects
        this.add(new UnselectDescendants(object));
        // Select parents
        for (const child of parents) {
            this.add(new SelectObject(child));
        }
        // Move camera to parents
        if (parents.size) {
            this.add(new MoveCameraToObjects(context, [...parents]));
        }
    }

    /**
     * Resolve prev graph-wise blocks.
     * @param obj
     *  The source object.
     */
    private getPrevBlocks(obj: DiagramObjectModel): Set<DiagramObjectModel> {
        let set = new Set<DiagramObjectModel>();
        const prev = SemanticAnalyzer.getPrevGraphLinks(obj);
        for (const p of prev) {
            if (p instanceof DiagramLineModel) {
                set = new Set([...set, ...this.getPrevBlocks(p)]);
            } else {
                set.add(p);
            }
        }
        return set;
    }

}

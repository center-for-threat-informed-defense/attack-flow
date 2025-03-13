export class UnselectDescendants extends GroupCommand {

    /**
     * Unselects an object's descendants.
     * @param object
     *  The object.
     */
    constructor(object: DiagramObjectModel) {
        super();
        for (const obj of object.getSubtree(o => o.isSelected())) {
            this.add(new UnselectObject(obj));
        }
    }

}


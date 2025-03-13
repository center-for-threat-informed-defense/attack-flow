export class SelectChildren extends GroupCommand {

    /**
     * Selects an object's children.
     * @param object
     *  The object.
     */
    constructor(object: DiagramObjectModel) {
        super();
        for (const obj of object.children) {
            this.add(new SelectObject(obj));
        }
    }

}

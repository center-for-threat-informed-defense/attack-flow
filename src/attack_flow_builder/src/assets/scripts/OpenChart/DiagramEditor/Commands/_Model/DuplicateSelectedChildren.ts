export class DuplicateSelectedChildren extends GroupCommand {

    /**
     * Duplicates an object's selected children.
     * @param context
     *  The application context.
     * @param object
     *  The object.
     */
    constructor(context: ApplicationStore, object: DiagramObjectModel) {
        super();
        // Unselect children
        const objects = object.children.filter(c => c.isSelected());
        for (const obj of objects) {
            this.add(new UnselectObject(obj));
        }
        // Duplicate selection
        const o = context.settings.edit.clone_offset;
        const clones = object.factory.cloneObjects(...objects);
        // Add clones to object and select them
        for (const obj of clones) {
            obj.moveBy(o[0], o[1]);
            obj.setSelect(Select.True);
            this.add(new AddObject(obj, object));
        }
    }

}

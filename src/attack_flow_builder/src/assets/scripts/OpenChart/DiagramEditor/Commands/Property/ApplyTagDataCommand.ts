import { SynchronousEditorCommand } from "../SynchronousEditorCommand";
import { setStringProperty, setColorProperty } from "./index";
import type {
    ListProperty,
    DictionaryProperty,
    StringProperty,
    ColorProperty
} from "@OpenChart/DiagramModel";

/**
 * A private helper command to populate the last added tag in a list.
 */
export class ApplyTagDataCommand extends SynchronousEditorCommand {
    constructor(
        private parentList: ListProperty,
        private data: { text: string, color: string }
    ) {
        super();
    }

    execute(): void {
        // 1. Get the most recently added item (the one just created by createSubproperty)
        const entries = Array.from(this.parentList.value.values());
        const newTag = entries[entries.length - 1] as DictionaryProperty;

        if (newTag && newTag.value) {
            const nameProp = newTag.value.get("name") as StringProperty;
            const colorProp = newTag.value.get("color") as ColorProperty;

            // 2. We call the helper function to get the command instance,
            // then call .execute() manually to mutate the model.
            if (nameProp) {
                setStringProperty(nameProp, this.data.text).execute();
            }
            if (colorProp) {
                setColorProperty(colorProp, this.data.color).execute();
            }
        }
    }

    undo(): void {
        // Leave empty: handled by the GroupCommand's undo sequence
        // (CreateSubproperty.undo will remove the whole tag).
    }
}

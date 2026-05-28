import { GroupCommand } from "../GroupCommand";
import { DiagramViewEditor } from "../../DiagramViewEditor";
import { SelectionAnimation } from "./Animations";
import {
    DictionaryProperty,
    ListProperty,
    MultiSelectProperty,
    SemanticAnalyzer,
    StringProperty,
    traverse
} from "@OpenChart/DiagramModel";
import {
    MoveCameraToObjects,
    SpawnObject
} from "../ViewFile/index.commands";
import {
    RemoveSelectedChildren,
    RunAnimation,
    SelectObjects,
    StopContinuousAnimation
} from "../View/index.commands";
import type { SynchronousEditorCommand } from "../SynchronousEditorCommand";
import type { BlockView, DiagramObjectView } from "@OpenChart/DiagramView";
import { useTagStore } from "@/stores/TagStore";

import { createSubproperty, ApplyTagDataCommand, setMultiSelectProperty } from "../Property";
import { EditorDirective } from "../../EditorDirectives";
import { SynchronousEditorCommand as BaseSynchronousEditorCommand } from "../SynchronousEditorCommand";
import type { DirectiveIssuer } from "../../EditorDirectives";

class SelectLastCreatedTagCommand extends BaseSynchronousEditorCommand {

    /**
     * The selected object's tag property.
     */
    private readonly property: MultiSelectProperty;

    /**
     * The canvas-level tag registry.
     */
    private readonly tagRegistry: ListProperty;

    /**
     * The property's previous selected tag ids.
     */
    private readonly prevValues: string[];

    /**
     * Creates a command that selects the most recently created shared tag.
     * @param property
     *  The selected object's tag property.
     * @param tagRegistry
     *  The canvas-level tag registry.
     */
    constructor(property: MultiSelectProperty, tagRegistry: ListProperty) {
        super();
        this.property = property;
        this.tagRegistry = tagRegistry;
        this.prevValues = [...property.values];
    }

    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public execute(issueDirective: DirectiveIssuer = () => {}): void {
        const createdTagId = this.getLastCreatedTagId();
        if (!createdTagId) {
            return;
        }

        this.property.setSelections([...this.prevValues, createdTagId]);
        issueDirective(EditorDirective.Record | EditorDirective.Autosave);
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public undo(issueDirective: DirectiveIssuer = () => {}): void {
        this.property.setSelections(this.prevValues);
        issueDirective(EditorDirective.Autosave);
    }

    /**
     * Returns the id of the last created tag in the shared registry.
     * @returns
     *  The tag id, or undefined if it cannot be resolved.
     */
    private getLastCreatedTagId(): string | undefined {
        const entries = Array.from(this.tagRegistry.value.values());
        const tag = entries[entries.length - 1];
        if (!(tag instanceof DictionaryProperty)) {
            return undefined;
        }

        const idProperty = tag.value.get("id");
        if (!(idProperty instanceof StringProperty)) {
            return tag.id;
        }

        return idProperty.value ?? tag.id;
    }

}


///////////////////////////////////////////////////////////////////////////////
//  1. Selection  /////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Selects all objects within an editor.
 * @param editor
 *  The editor.
 * @returns
 *  A command that represents the action.
 */
export function selectAllObjects(
    editor: DiagramViewEditor
): SynchronousEditorCommand {
    const canvas = editor.file.canvas;
    const cmd = new GroupCommand();
    cmd.do(new SelectObjects([...canvas.objects], true));
    cmd.do(new RunAnimation(editor.interface, SelectionAnimation));
    return cmd;
}

/**
 * Unselects all objects within an editor.
 * @param editor
 *  The editor.
 * @returns
 *  A command that represents the action.
 */
export function unselectAllObjects(
    editor: DiagramViewEditor
): SynchronousEditorCommand {
    const canvas = editor.file.canvas;
    const cmd = new GroupCommand();

    // Reset the tag highlight state whenever we unselect everything
    const tagStore = useTagStore();
    tagStore.setActiveTag(null, null);

    cmd.do(new SelectObjects([...traverse<DiagramObjectView>(canvas)], false));
    cmd.do(new StopContinuousAnimation(editor.interface, SelectionAnimation));
    return cmd;
}

/**
 * Selects an object.
 * @param editor
 *  The editor.
 * @returns
 *  A command that represents the action.
 */
export function selectObject(
    editor: DiagramViewEditor, object: DiagramObjectView
): SynchronousEditorCommand {
    const cmd = new GroupCommand();
    cmd.do(new SelectObjects(object, true));
    cmd.do(new RunAnimation(editor.interface, SelectionAnimation));
    return cmd;
}

/**
 * Selects an object.
 * @param editor
 *  The editor.
 * @returns
 *  A command that represents the action.
 */
export function unselectObject(
    editor: DiagramViewEditor, object: DiagramObjectView
): SynchronousEditorCommand {
    if (editor.selection.size === 1) {
        const cmd = new GroupCommand();
        cmd.do(new SelectObjects(object, false));
        cmd.do(new StopContinuousAnimation(editor.interface, SelectionAnimation));
        return cmd;
    } else {
        return new SelectObjects(object, false);
    }
}


///////////////////////////////////////////////////////////////////////////////
//  2. Create Objects  ////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Spawns an object in a diagram editor.
 * @param editor
 *  The editor.
 * @param id
 *  The object's id.
 * @param x
 *  The object's x-coordinate.
 * @param y
 *  The object's y-coordinate.
 * @param fromCorner
 *  Whether to position the object from its top-left corner or its center.
 *  (Default: `false`)
 * @returns
 *  A command that represents the action.
 */
export function spawnObject(
    editor: DiagramViewEditor, id: string, x: number, y: number, fromCorner: boolean = false
): GroupCommand {
    // Create spawn command
    const spawn = new SpawnObject(editor.file, id, x, y, fromCorner);
    // Format command with selection
    const cmd = new GroupCommand();
    cmd.do(spawn);
    cmd.do(selectObject(editor, spawn.object));
    return cmd;
}

/**
 * Spawns an object in an editor at the interface's center.
 * @param editor
 *  The editor.
 * @param id
 *  The object's id.
 * @returns
 *  A command that represents the action.
 */
export function spawnObjectAtInterfaceCenter(
    editor: DiagramViewEditor, id: string
): GroupCommand {
    const { x, y } = editor.file.camera;
    return spawnObject(editor, id, x, y);
}

/**
 * Spawns an object in an editor at the pointer's position.
 * @param editor
 *  The editor.
 * @param id
 *  The object's id.
 * @returns
 *  A command that represents the action.
 */
export function spawnObjectAtPointer(
    editor: DiagramViewEditor, id: string
): GroupCommand {
    return spawnObject(editor, id, ...editor.pointer, true);
}


///////////////////////////////////////////////////////////////////////////////
//  3. Manage Selection  //////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Removes all selected objects inside an editor.
 * @param editor
 *  The editor.
 * @returns
 *  A command that represents the action.
 */
export function removeSelectedChildren(
    editor: DiagramViewEditor
): SynchronousEditorCommand {
    const cmd = new GroupCommand();
    cmd.do(new RemoveSelectedChildren(editor.file.canvas));
    cmd.do(new StopContinuousAnimation(editor.interface, SelectionAnimation));
    return cmd;
}


///////////////////////////////////////////////////////////////////////////////
//  4. Camera Controls  ///////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Moves the camera to a collection of objects within an editor.
 * @param editor
 *  The editor.
 * @param objects
 *  The objects.
 * @returns
 *  A command that represents the action.
 */
export function moveCameraToObjects(
    editor: DiagramViewEditor, objects: DiagramObjectView[]
): MoveCameraToObjects {
    return new MoveCameraToObjects(editor.interface, objects);
}

/**
 * Moves the camera to the selected objects within an editor.
 * @param editor
 *  The editor.
 * @returns
 *  A command that represents the action.
 */
export function moveCameraToSelection(
    editor: DiagramViewEditor
): MoveCameraToObjects {
    const objs = [...traverse(editor.file.canvas, o => o.focused)];
    return new MoveCameraToObjects(editor.interface, objs);
}


/**
 * Moves the camera to the selected objects' parent.
 * @param editor
 *  The editor.
 * @returns
 *  A command that represents the action.
 */
export function moveCameraToParents(
    editor: DiagramViewEditor
) {
    const cmd = new GroupCommand();
    // Get (graph-wise) parents
    const canvas = editor.file.canvas;
    const objs = [...traverse<DiagramObjectView>(canvas, o => o.focused)];
    const parents = new Map<string, DiagramObjectView>();
    for (const obj of objs) {
        const getParents = SemanticAnalyzer.getParentBlocks;
        for (const n of getParents<DiagramObjectView, BlockView>(obj)) {
            parents.set(n.instance, n);
        }
    }
    // Unselect objects
    cmd.do(unselectAllObjects(editor));
    // Select parents
    for (const child of parents.values()) {
        cmd.do(selectObject(editor, child));
    }
    // Move camera to parents
    if (parents.size) {
        const ui = editor.interface;
        cmd.do(new MoveCameraToObjects(ui, [...parents.values()]));
    }
    return cmd;
}

/**
 * Moves the camera to the selected objects' children.
 * @param editor
 *  The editor.
 * @returns
 *  A command that represents the action.
 */
export function moveCameraToChildren(
    editor: DiagramViewEditor
) {
    const cmd = new GroupCommand();
    // Get (graph-wise) children
    const canvas = editor.file.canvas;
    const objs = [...traverse<DiagramObjectView>(canvas, o => o.focused)];
    const children = new Map<string, DiagramObjectView>();
    for (const obj of objs) {
        const getChildren = SemanticAnalyzer.getChildBlocks;
        for (const n of getChildren<DiagramObjectView, BlockView>(obj)) {
            children.set(n.instance, n);
        }
    }
    // Unselect objects
    cmd.do(unselectAllObjects(editor));
    // Select children
    for (const child of children.values()) {
        cmd.do(selectObject(editor, child));
    }
    // Move camera to children
    if (children.size) {
        const ui = editor.interface;
        cmd.do(new MoveCameraToObjects(ui, [...children.values()]));
    }
    return cmd;
}

/**
 * Selects all objects that have a specific tag and moves the camera to them.
 * @param editor The editor instance.
 * @param tagId The id of the tag to search for.
 */
export function moveCameraToObjectsWithTags(
    editor: DiagramViewEditor,
    tagId: string
): SynchronousEditorCommand {
    const cmd = new GroupCommand();
    const canvas = editor.file.canvas;

    // 1. Find all objects that contain the specified tag
    const matchingObjects = [...traverse<DiagramObjectView>(canvas, (obj) => {
        const tagsProperty = obj.properties.value.get("tags");
        return tagsProperty instanceof MultiSelectProperty && tagsProperty.values.has(tagId);
    })];

    if (matchingObjects.length > 0) {
        // 2. Clear current selection
        cmd.do(unselectAllObjects(editor));

        // 3. Select all matching objects
        for (const obj of matchingObjects) {
            cmd.do(selectObject(editor, obj));
        }

        // 4. Move camera to encapsulate all matching objects
        cmd.do(new MoveCameraToObjects(editor.interface, matchingObjects));
    }

    return cmd;
}

/**
 * Applies an existing shared tag to every selected taggable object.
 * @param editor
 *  The editor whose selection should be updated.
 * @param tagId
 *  The shared tag id to add.
 * @returns
 *  A command that represents the action.
 */
export function applyExistingTagToSelection(
    editor: DiagramViewEditor,
    tagId: string
): SynchronousEditorCommand {
    const cmd = new GroupCommand();

    for (const object of editor.selection.values()) {
        const tagsProperty = object.properties.value.get("tags");
        if (!(tagsProperty instanceof MultiSelectProperty) || tagsProperty.values.has(tagId)) {
            continue;
        }

        cmd.do(setMultiSelectProperty(tagsProperty, [...tagsProperty.values, tagId]));
    }

    return cmd;
}

/**
 * Creates a new tag sub-property and populates it with existing data.
 * @param property The list property (tags) to add to.
 * @param tag The tag data (text and color) to apply.
 */
export function addExistingTag(
    property: ListProperty,
    tag: { text: string, color: string }
): SynchronousEditorCommand {
    const cmd = new GroupCommand();

    // 1. Schedule the creation of the empty DictionaryProperty
    cmd.do(createSubproperty(property));

    // 2. Schedule the population of that dictionary
    // This will run immediately AFTER the property is created in the Editor queue
    cmd.do(new ApplyTagDataCommand(property, tag));

    return cmd;
}

/**
 * Creates a new shared tag and assigns it to the selected object.
 * @param tagRegistry
 *  The canvas-level tag registry.
 * @param property
 *  The selected object's tag property.
 * @param tag
 *  The initial tag data to apply.
 * @returns
 *  A command that represents the action.
 */
export function createAndAssignTag(
    tagRegistry: ListProperty,
    property: MultiSelectProperty,
    tag: { text: string, color: string }
): SynchronousEditorCommand {
    const cmd = new GroupCommand();
    cmd.do(createSubproperty(tagRegistry));
    cmd.do(new ApplyTagDataCommand(tagRegistry, tag));
    cmd.do(new SelectLastCreatedTagCommand(property, tagRegistry));
    return cmd;
}

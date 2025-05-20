import { 
    SetStringProperty,
    SetEnumProperty,
    SetDateProperty,
    CreateSubproperty,
    DeleteSubproperty,
    SetNumberProperty
} from "./index.commands";
import type { 
    DateProperty,
    EnumProperty,
    FloatProperty,
    IntProperty,
    ListProperty,
    StringProperty
} from "@OpenChart/DiagramModel";


/**
 * Sets the value of a {@link StringProperty}.
 * @param property
 *  The {@link StringProperty}.
 * @param value
 *  The {@link StringProperty}'s new value.
 * @returns
 *  A command that represents the action.
 */
export function setStringProperty(
    property: StringProperty, value: string | null
): SetStringProperty {
    return new SetStringProperty(property, value); 
}

/**
 * Sets the value of a {@link EnumProperty}.
 * @param property
 *  The {@link EnumProperty}.
 * @param value
 *  The {@link EnumProperty}'s new value.
 * @returns
 *  A command that represents the action.
 */
export function setEnumProperty(
    property: EnumProperty, value: string | null
): SetEnumProperty {
    return new SetEnumProperty(property, value); 
}

/**
 * Sets the value of a {@link DateProperty}.
 * @param property
 *  The {@link DateProperty}.
 * @param value
 *  The {@link DateProperty}'s new value.
 * @returns
 *  A command that represents the action.
 */
export function setDateProperty(
    property: DateProperty, value: Date | null
): SetDateProperty {
    return new SetDateProperty(property, value); 
}

/**
 * Sets the value of a {@link IntProperty} or {@link FloatProperty}.
 * @param property
 *  The {@link IntProperty} or {@link FloatProperty}.
 * @param value
 *  The new value.
 * @returns
 *  A command that represents the action.
 */
export function setNumberProperty(
    property: IntProperty | FloatProperty, value: number | null
): SetNumberProperty {
    return new SetNumberProperty(property, value); 
}

/**
 * Creates a new subproperty and adds it to a {@link ListProperty}.
 * @param property
 *  The {@link ListProperty}.
 * @returns
 *  A command that represents the action.
 */
export function createSubproperty(
    property: ListProperty
): CreateSubproperty {
    return new CreateSubproperty(property); 
}

/**
 * Deletes a subproperty from a {@link ListProperty}.
 * @param property
 *  The {@link ListProperty}.
 * @param id
 *  The subproperty's id.
 * @returns
 *  A command that represents the action.
 */
export function deleteSubproperty(
    property: ListProperty, id: string
): DeleteSubproperty {
    return new DeleteSubproperty(property, id); 
}

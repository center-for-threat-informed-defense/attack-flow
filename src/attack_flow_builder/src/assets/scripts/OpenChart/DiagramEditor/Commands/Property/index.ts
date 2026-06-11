import {
    SetStringProperty,
    SetColorProperty,
    SetEnumProperty,
    CreateSubproperty,
    DeleteSubproperty,
    SetNumberProperty,
    SetDatePropertyTime,
    SetDatePropertyTimezone,
    SetTupleSubproperty,
    SetMultiSelectProperty,
    ApplyTagDataCommand
} from "./index.commands";
import type { DateTime } from "luxon";
import type {
    DateProperty,
    EnumProperty,
    FloatProperty,
    IntProperty,
    ListProperty,
    StringProperty,
    ColorProperty,
    TupleProperty,
    MultiSelectProperty
} from "@OpenChart/DiagramModel";
import type { SynchronousEditorCommand } from "../SynchronousEditorCommand";


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
 * Sets the value of a {@link ColorProperty}.
 * @param property
 *  The {@link ColorProperty}.
 * @param value
 *  The {@link ColorProperty}'s new value.
 * @returns
 *  A command that represents the action.
 */
export function setColorProperty(
    property: ColorProperty, value: string | null
): SetColorProperty {
    return new SetColorProperty(property, value);
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
 * Sets the time value of a {@link DateProperty}.
 * @param property
 *  The {@link DateProperty}.
 * @param value
 *  The {@link DateProperty}'s new time value.
 * @returns
 *  A command that represents the action.
 */
export function setDatePropertyTime(
    property: DateProperty, value: DateTime | Date | null
): SetDatePropertyTime {
    return new SetDatePropertyTime(property, value);
}

/**
 * Sets the timezone value of a {@link DateProperty}.
 * @param property
 *  The {@link DateProperty}.
 * @param value
 *  The {@link DateProperty}'s new timezone value.
 * @returns
 *  A command that represents the action.
 */
export function setDatePropertyTimezone(
    property: DateProperty, value: string | null
): SetDatePropertyTimezone {
    return new SetDatePropertyTimezone(property, value);
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
 * Sets the value of a {@link TupleProperty}'s subproperty.
 * @param property
 *  The {@link TupleProperty}.
 * @param value
 *  The {@link SynchronousEditorCommand} that sets the subproperty.
 * @returns
 *  A command that represents the action.
 */
export function setTupleSubproperty(
    property: TupleProperty, value: SynchronousEditorCommand
): SetTupleSubproperty {
    return new SetTupleSubproperty(property, value);
}

/**
 * Sets the selection of a {@link MultiSelectProperty}.
 * @param property
 *  The {@link MultiSelectProperty}.
 * @param values
 *  The new selected ids.
 * @returns
 *  A command that represents the action.
 */
export function setMultiSelectProperty(
    property: MultiSelectProperty, values: string[]
): SetMultiSelectProperty {
    return new SetMultiSelectProperty(property, values);
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

export { ApplyTagDataCommand };

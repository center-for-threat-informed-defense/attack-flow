import { SetStringProperty } from "./index.commands";
import type { StringProperty } from "@OpenChart/DiagramModel";

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

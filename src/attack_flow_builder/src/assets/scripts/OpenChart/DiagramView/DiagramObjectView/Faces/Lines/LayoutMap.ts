import type { LineView } from "../../Views"
import type { GenericLineInternalState } from "./GenericLineInternalState"

export type LayoutStrategyMap = {
    [key: number]: { [key: number]: (view: LineView, face: GenericLineInternalState) => void; }
}

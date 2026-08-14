import * as EditorCommands from "@OpenChart/DiagramEditor/Commands";
import { SetStringProperty, SetTupleSubproperty } from "@OpenChart/DiagramEditor/Commands/index.commands";
import { SynchronousEditorCommand } from "@OpenChart/DiagramEditor";
import { RootProperty, StringProperty, TTPTupleProperty } from "@OpenChart/DiagramModel";
import type { SynchronousCommandProcessor } from "@OpenChart/DiagramEditor";
import { getTacticNameFromLabel, getTechniqueNameFromLabel } from "../AttackFlowTemplates/TTPFrameworkConstants";

export class AttackFlowCommandProcessor implements SynchronousCommandProcessor {

    /**
     * Processes a {@link SynchronousEditorCommand}.
     * @param cmd
     *  The command about to be executed.
     * @returns
     *  The command to execute in its place.
     */
    public process(cmd: SynchronousEditorCommand): SynchronousEditorCommand | undefined {
        if (this.isSettingTTP(cmd)) {
            return this.processTTPEdits(cmd);
        }

        if (this.isSettingCountermeasureID(cmd)) {
            return this.processCountermeasureIDEdits(cmd);
        }

        return undefined;
    }

    /**
     * Creates a set name command.
     * @param cmd
     *  The existing {@link SetTupleSubproperty}.
     * @param prop
     *  The name property.
     * @param value
     *  The name property's new value.
     */
    public setNameCmd(cmd: SetTupleSubproperty, prop: StringProperty, value: string | null) {
        const bundle = EditorCommands.newGroupCommand();
        bundle.do(cmd);
        bundle.do(EditorCommands.setStringProperty(prop, value));
        return bundle;
    }

    /**
     * Gets the name of selected tactic.
     * @param prop
     *  The tactic's {@link TTPTupleProperty}.
     * @param value
     *  The tactic's next value.
     * @returns
     *  The name of the selected tactic.
     */
    public getTacticName(prop: TTPTupleProperty, value?: string | null): string | null {
        const tact = prop.get("tactic", StringProperty);
        if (!tact) {
            return null;
        }
        if (value === undefined) {
            value = tact.value;
        }
        if (value === null) {
            return null;
        }
        const tactText = tact?.options?.value.get(value)?.toString();
        if (tactText === undefined) {
            return null;
        }
        return getTacticNameFromLabel(tactText);
    }

    /**
     * Gets the name of selected technique.
     * @param prop
     *  The technique's {@link TTPTupleProperty}.
     * @param value
     *  The technique's next value.
     * @returns
     *  The name of the selected technique.
     */
    public getTechniqueName(prop: TTPTupleProperty, value?: string | null): string | null {
        const tech = prop.get("technique", StringProperty);
        if (!tech) {
            return null;
        }
        if (value === undefined) {
            value = tech.value;
        }
        if (value === null) {
            return null;
        }
        const techText = tech?.options?.value.get(value)?.toString();
        if (techText === undefined) {
            return null;
        }
        return getTechniqueNameFromLabel(techText);
    }

    /**
     * Tests if a command is setting a TTP.
     * @param cmd
     *  The command.
     * @returns
     *  True if the command is setting a TTP, false otherwise.
     */
    private isSettingTTP(cmd: SynchronousEditorCommand): cmd is SetTupleSubproperty {
        return cmd instanceof SetTupleSubproperty
            && cmd.property.id === "ttp";
    }

    /**
     * Tests if a command is setting a tactic property.
     * @param cmd
     *  The command.
     * @returns
     *  True if the command is setting a tactic, false otherwise.
     */
    private isSettingTactic(cmd: SynchronousEditorCommand): cmd is SetStringProperty {
        return cmd instanceof SetStringProperty
            && cmd.property.id === "tactic";
    }

    /**
     * Tests if a command is setting a technique property.
     * @param cmd
     *  The command.
     * @returns
     *  True if the command is setting a technique, false otherwise.
     */
    private isSettingTechnique(cmd: SynchronousEditorCommand): cmd is SetStringProperty {
        return cmd instanceof SetStringProperty
            && cmd.property.id === "technique";
    }

    /**
     * In addition to setting the TTP property, set the name property as well.
     * @param cmd
     * The existing {@link SetTupleSubproperty}.
     * @returns
     * The command to execute in its place.
     */
    private processTTPEdits(cmd: SetTupleSubproperty): SynchronousEditorCommand | undefined {
        // Get root property
        const properties = cmd.property.parent;
        if (!(properties instanceof RootProperty)) {
            return undefined;
        }
        // Get name property
        const name = properties.get("name", StringProperty);
        if (name === undefined) {
            return undefined;
        }
        const value = name.toString();
        // Set name
        let tact: string | null = null,
            tech: string | null = null,
            prev: string | null = null;
        if (this.isSettingTactic(cmd.nextValue)) {
            tact = this.getTacticName(cmd.property, cmd.nextValue.nextValue);
            prev = this.getTacticName(cmd.property);
            tech = this.getTechniqueName(cmd.property);
            if (value === tact || value === prev) {
                return this.setNameCmd(cmd, name, tact);
            }

        } else if (this.isSettingTechnique(cmd.nextValue)) {
            tact = this.getTacticName(cmd.property);
            prev = this.getTechniqueName(cmd.property);
            tech = this.getTechniqueName(cmd.property, cmd.nextValue.nextValue);
            if (value === tact || value === prev) {
                return this.setNameCmd(cmd, name, tech);
            }
        }
        if (!name.isDefined() && (tech || tact)) {
            return this.setNameCmd(cmd, name, tech ?? tact);
        }
    }

    /**
     * Check whether a command is setting a countermeasure id.
     * @param cmd
     * The command about to be executed.
     * @returns
     * True if the command is setting a countermeasure id, false otherwise.
     */
    private isSettingCountermeasureID(cmd: SynchronousEditorCommand): cmd is SetStringProperty {
        return cmd instanceof SetStringProperty && cmd.property.id === "countermeasure_id";
    }

    /**
     * In addition to setting the countermeasure id property, set the name property as well.
     * @param cmd
     * The existing {@link SetStringProperty}.
     * @returns
     * The command to execute in its place.
     */
    private processCountermeasureIDEdits(cmd: SetStringProperty): SynchronousEditorCommand | undefined {
        // Get root property
        const properties = cmd.property.parent;
        if (!(properties instanceof RootProperty)) {
            return undefined;
        }
        // Get name property
        const name = properties.get("name", StringProperty);
        if (name === undefined) {
            return undefined; // return if property does not exist
        }
        const countermeasureId = properties.get("countermeasure_id", StringProperty);
        if (countermeasureId === undefined) {
            return undefined;
        }

        const currentName = name.value;

        const oldTechniqueName = countermeasureId.value ? getTechniqueNameFromLabel(
            countermeasureId.options?.value.get(countermeasureId.value)?.toString() || ""
        ) : "";

        const newTechniqueName = cmd.nextValue ? getTechniqueNameFromLabel(
            countermeasureId.options?.value.get(cmd.nextValue)?.toString() || ""
        ) : "";

        // The name shall only be set if it is currently undefined or if the value matches the
        // previously selected countermeasure.
        if (currentName && currentName != oldTechniqueName) { return undefined; }

        // Create new group command which additionally sets the name.
        const bundle = EditorCommands.newGroupCommand();
        bundle.do(cmd);
        bundle.do(EditorCommands.setStringProperty(name, newTechniqueName));
        return bundle;
    }
}

export default AttackFlowCommandProcessor;

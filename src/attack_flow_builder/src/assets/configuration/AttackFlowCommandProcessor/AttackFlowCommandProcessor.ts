import * as EditorCommands from "@OpenChart/DiagramEditor/Commands";
import { SetStringProperty, SetTupleSubproperty } from "@OpenChart/DiagramEditor/Commands/index.commands";
import { SynchronousEditorCommand } from "@OpenChart/DiagramEditor";
import { RootProperty, StringProperty, TupleProperty } from "@OpenChart/DiagramModel";
import type { SynchronousCommandProcessor } from "@OpenChart/DiagramEditor";

export class AttackFlowCommandProcessor implements SynchronousCommandProcessor {

    /**
     * Processes a {@link SynchronousEditorCommand}.
     * @param cmd
     *  The command about to be executed.
     * @returns
     *  The command to execute in its place.
     */
    public process(cmd: SynchronousEditorCommand): SynchronousEditorCommand | undefined {
        if (!this.isSettingTtp(cmd)) {
            return undefined;
        }
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
     *  The tactic's {@link TupleProperty}.
     * @param value
     *  The tactic's next value.
     * @returns
     *  The name of the selected tactic.
     */
    public getTacticName(prop: TupleProperty, value?: string | null): string | null {
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
        return tactText.split(/TA\d+/)[1].trim();
    }

    /**
     * Gets the name of selected technique.
     * @param prop
     *  The technique's {@link TupleProperty}.
     * @param value
     *  The technique's next value.
     * @returns
     *  The name of the selected technique.
     */
    public getTechniqueName(prop: TupleProperty, value?: string | null): string | null {
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
        return techText.split(/T\d+(?:\.\d+)?/)[1].trim();
    }

    /**
     * Tests if a command is setting a TTP.
     * @param cmd
     *  The command.
     * @returns
     *  True if the command is setting a TTP, false otherwise.
     */
    private isSettingTtp(cmd: SynchronousEditorCommand): cmd is SetTupleSubproperty {
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

}

export default AttackFlowCommandProcessor;

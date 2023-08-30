import intel from "./builder.config.intel";
import { PageCommand } from "@/store/Commands/PageCommand";
import { StringProperty } from "../scripts/BlockDiagram";
import { DiagramProcessor } from "../scripts/DiagramProcessor/DiagramProcessor";
import { GroupCommand, SetStringProperty } from "@/store/Commands/PageCommands";


///////////////////////////////////////////////////////////////////////////////
//  Attack Flow Processor  ////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


class AttackFlowProcessor extends DiagramProcessor {

    /**
     * The application's tactic recommendations.
     */
    private static TacticRecs = new Set<string>(intel.tactic_recs);

    /**
     * The application's tactic names.
     */
    private static TacticNames = new Set<string>(intel.tactics.map(o => o.name));

    /**
     * The application's techniques recommendations.
     */
    private static TechniqueRecs = new Set<string>(intel.technique_recs);

    /**
     * The application's technique names.
     */
    private static TechniqueNames = new Set<string>(intel.technique.map(o => o.name));


    /**
     * Creates a new {@link AttackFlowProcessor}.
     */
    constructor() {
        super();
    }


    /**
     * Processes a page command from the application.
     * 
     * @remarks
     * This function is invoked any time the interface attempts to issue a
     * command to a Page. This function allows commands to be intercepted and
     * modified according to the needs of the application. 
     * 
     * For example:
     *  - To ignore a command, return an empty array.
     *  - To execute a command, return an array consisting of the command.
     *  - To replace a command with an alternate set of commands, return an
     *    array consisting of those alternate commands instead. 
     *  - To execute the command along with a series of others, return an array
     *    consisting of all the commands.
     *  - etc.
     * 
     * Commands are executed in the order listed.
     * 
     * @param command
     *  The incoming command.
     * @returns
     *  The processed set of commands.
     */
    public override process(command: PageCommand): PageCommand[] {
        // Modify commands that edit tactic or technique properties
        if(command instanceof SetStringProperty) {
            switch(command.property.id) {
                case "action.tactic_id":
                    return this.autofillFromTactic(command);
                case "action.technique_id":
                    return this.autofillFromTechnique(command);
                default:
                    break;
            }
        }
        // Pass all other commands through
        return [command];
    }

    /**
     * Autofills auxillary properties using a tactic property's value.
     * @param command
     *  The "set tactic" command.
     * @returns
     *  The processed set of commands.
     */
    private autofillFromTactic(command: SetStringProperty): PageCommand[] {
        let property = command.property;
        let value = command.nextValue;
        
        // If value matches tactic recommendation exactly...
        if(value !== null && AttackFlowProcessor.TacticRecs.has(value)) {

            let cmd = new GroupCommand();

            // Resolve tactic ID
            let tacticId = /TA[0-9]{4}/i.exec(value);
            if(tacticId === null) {
                throw new Error("Tactic ID could not be resolved from text.");
            }

            // Update tactic field to tactic ID.
            cmd.add(new SetStringProperty(property, tacticId[0]));

            // Resolve tactic
            let tactic = intel.tactics.find(o => o.id === tacticId![0])!;
            if(!tactic) {
                throw new Error(`Could not resolve tactic '${ tacticId }'.`);
            }

            // Autofill
            let rootProps = property.root!.value;
            let nameProp = rootProps.get("name")! as StringProperty;
            let tacticRefProp = rootProps.get("tactic_ref")! as StringProperty;

            // Autofill name ONLY if empty or matches another autofilled tactic name
            let nameValue = nameProp.toRawValue();
            if(!nameValue || AttackFlowProcessor.TacticNames.has(nameValue)) {
                cmd.add(new SetStringProperty(nameProp, tactic.name));
            }

            // Autofill tactic reference property
            cmd.add(new SetStringProperty(tacticRefProp, tactic.stixId));

            // Return command
            return [cmd];

        }
        return [command];
    }

    /**
     * Autofills auxillary properties using a technique property's value.
     * @param command
     *  The "set technique" command.
     * @returns
     *  The processed set of commands.
     */
    private autofillFromTechnique(command: SetStringProperty) {
        let property = command.property;
        let value = command.nextValue;
        
        // If value matches technique recommendation exactly...
        if(value !== null && AttackFlowProcessor.TechniqueRecs.has(value)) {

            let cmd = new GroupCommand();

            // Resolve technique ID
            let techniqueId = /T[0-9]{4}(?:\.[0-9]{3})?/i.exec(value);
            if(techniqueId === null) {
                throw new Error("Technique ID could not be resolved from text.");
            }

            // Update technique field to tactic ID.
            cmd.add(new SetStringProperty(property, techniqueId[0]));

            // Resolve technique
            let technique = intel.technique.find(o => o.id === techniqueId![0])!;
            if(!technique) {
                throw new Error(`Could not resolve technique '${ techniqueId }'.`);
            }

            // Autofill
            let rootProps = property.root!.value;
            let nameProp = rootProps.get("name")! as StringProperty;
            let techniqueRefProp = rootProps.get("technique_ref")! as StringProperty;
            
            // Autofill name ONLY if empty or matches another tactic or technique name
            let nameValue = nameProp.toRawValue();
            if(
                !nameValue || 
                AttackFlowProcessor.TacticNames.has(nameValue) ||
                AttackFlowProcessor.TechniqueNames.has(nameValue)
            ) {
                cmd.add(new SetStringProperty(nameProp, technique.name));
            }

            // Autofill technique reference property
            cmd.add(new SetStringProperty(techniqueRefProp, technique.stixId));

            // Return command
            return [cmd];

        }
        return [command];
    }

}

export default AttackFlowProcessor;

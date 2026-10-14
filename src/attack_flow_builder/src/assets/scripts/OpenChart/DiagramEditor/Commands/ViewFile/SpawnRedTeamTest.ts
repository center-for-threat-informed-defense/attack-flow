import { SpawnObject } from "./SpawnObject";
import {
    DictionaryProperty,
    EnumProperty,
    ListProperty,
    MultiSelectProperty,
    StringProperty,
    TTPTupleProperty
} from "@OpenChart/DiagramModel";
import type { AtomicRedTeamTest } from "@/assets/configuration/AttackFlowTemplates/AtomicRedTeamTests";
import type { DiagramObjectView, DiagramViewFile } from "@OpenChart/DiagramView";

/** Spawns a Red-team Test block populated from an Atomic Red Team test. */
export class SpawnRedTeamTest extends SpawnObject {

    constructor(
        file: DiagramViewFile,
        test: AtomicRedTeamTest,
        x: number,
        y: number,
        fromCorner: boolean = false
    ) {
        super(file, "red-team-test", x, y, fromCorner);
        this.configureTest(test);
        this.object.calculateLayout();
        this.positionObject(file, x, y, fromCorner);
    }

    private configureTest(test: AtomicRedTeamTest): void {
        this.configureTTP(test.techniqueId);
        this.setString("name", test.name);
        this.setString("description", test.description);
        this.setPlatforms(test.platforms);
        this.setString("executor", test.executor);
        this.setString("command", test.command);
        this.setString("cleanup_command", test.cleanupCommand);
        this.object.properties.get("elevation_required", EnumProperty)
            ?.setValue(test.elevationRequired ? "true" : "false");
        this.setString("dependency_executor", test.dependencyExecutor);
        this.setDependencies(test.dependencies);
        this.setInputArguments(test.inputArguments);
    }

    private configureTTP(techniqueId: string): void {
        const ttp = this.object.properties.get("ttp", TTPTupleProperty);
        const technique = ttp?.get("technique", StringProperty);
        const tactic = ttp?.get("tactic", StringProperty);
        if (!ttp || !technique || !tactic || !technique.options?.value.has(techniqueId)) {
            throw new Error(`Unable to map Red-team Test to technique '${techniqueId}'.`);
        }

        technique.setValue(techniqueId);
        const tacticIds = ttp.validPropValues?.get("tactic");
        const tacticId = [...(tactic.options?.value.keys() ?? [])]
            .find(id => tacticIds?.has(id)) ?? [...(tacticIds ?? [])][0];
        if (!tacticId) {
            throw new Error(`Technique '${techniqueId}' has no associated tactic.`);
        }
        tactic.setValue(tacticId);
    }

    private setPlatforms(platforms: string[]): void {
        const property = this.object.properties.get("platforms", MultiSelectProperty);
        if (!property) {
            return;
        }
        property.setSelections(platforms.filter(platform => property.options.value.has(platform)));
    }

    private setDependencies(dependencies: AtomicRedTeamTest["dependencies"]): void {
        const property = this.object.properties.get("dependencies", ListProperty);
        if (!property) {
            return;
        }
        for (const dependency of dependencies) {
            const item = property.createListItem();
            if (!(item instanceof DictionaryProperty)) {
                continue;
            }
            this.setString("description", dependency.description, item);
            this.setString("prereq_command", dependency.prereq_command, item);
            this.setString("get_prereq_command", dependency.get_prereq_command, item);
            property.addProperty(item, item.id);
        }
    }

    private setInputArguments(inputArguments: AtomicRedTeamTest["inputArguments"]): void {
        const property = this.object.properties.get("input_arguments", ListProperty);
        if (!property) {
            return;
        }
        for (const argument of inputArguments) {
            const item = property.createListItem();
            if (!(item instanceof DictionaryProperty)) {
                continue;
            }
            this.setString("name", argument.name, item);
            this.setString("description", argument.description, item);
            this.setString("type", argument.type, item);
            this.setString("default", argument.default?.toString(), item);
            property.addProperty(item, item.id);
        }
    }

    private setString(id: string, value?: string, parent: DiagramObjectView["properties"] | DictionaryProperty = this.object.properties): void {
        if (value !== undefined) {
            parent.get(id, StringProperty)?.setValue(value);
        }
    }
}

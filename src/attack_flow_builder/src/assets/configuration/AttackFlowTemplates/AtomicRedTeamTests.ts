import { parse } from "yaml";
import { getAtomicRedTeamRawUrl } from "./AtomicRedTeamUrls";

type AtomicYaml = {
    attack_technique?: string;
    atomic_tests?: AtomicYamlTest[];
};

type AtomicYamlTest = {
    name?: string;
    description?: string;
    supported_platforms?: string[];
    executor?: {
        name?: string;
        command?: string;
        cleanup_command?: string;
        elevation_required?: boolean;
    };
    dependency_executor_name?: string;
    dependencies?: AtomicDependency[];
    input_arguments?: Record<string, AtomicInputArgument>;
};

export type AtomicDependency = {
    description?: string;
    prereq_command?: string;
    get_prereq_command?: string;
};

export type AtomicInputArgument = {
    description?: string;
    type?: string;
    default?: unknown;
};

export type AtomicRedTeamTest = {
    techniqueId: string;
    name: string;
    description: string;
    platforms: string[];
    executor: string;
    command: string;
    cleanupCommand?: string;
    elevationRequired: boolean;
    dependencyExecutor?: string;
    dependencies: AtomicDependency[];
    inputArguments: Array<AtomicInputArgument & { name: string }>;
};

const atomicTestCache = new Map<string, Promise<AtomicRedTeamTest[]>>();

/** Returns the raw Atomic Red Team YAML URL for an exact ATT&CK technique ID. */
export function getAtomicRedTeamYamlUrl(techniqueId: string): string | undefined {
    const baseUrl = getAtomicRedTeamRawUrl(techniqueId);
    return baseUrl?.concat(`/${techniqueId}.yaml`);
}

/** Gets the parsed Atomic Red Team tests for a covered technique. */
export function getAtomicRedTeamTests(techniqueId: string): Promise<AtomicRedTeamTest[]> {
    if (!atomicTestCache.has(techniqueId)) {
        atomicTestCache.set(techniqueId, fetchAtomicRedTeamTests(techniqueId));
    }
    return atomicTestCache.get(techniqueId)!;
}

/** Clears the cached Atomic test requests. Intended for tests. */
export function clearAtomicRedTeamTestCache(): void {
    atomicTestCache.clear();
}

async function fetchAtomicRedTeamTests(techniqueId: string): Promise<AtomicRedTeamTest[]> {
    const url = getAtomicRedTeamYamlUrl(techniqueId);
    if (!url) {
        return [];
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Unable to fetch Atomic Red Team tests (${response.status} ${response.statusText}).`);
    }

    const document = parse(await response.text()) as AtomicYaml;
    if (document.attack_technique !== techniqueId || !Array.isArray(document.atomic_tests)) {
        throw new Error(`Atomic Red Team YAML for '${techniqueId}' has an unexpected shape.`);
    }

    return document.atomic_tests
        .filter((test): test is AtomicYamlTest & { name: string } => typeof test.name === "string")
        .map(test => ({
            techniqueId,
            name: test.name,
            description: test.description ?? "",
            platforms: test.supported_platforms ?? [],
            executor: test.executor?.name ?? "",
            command: test.executor?.command ?? "",
            cleanupCommand: test.executor?.cleanup_command,
            elevationRequired: test.executor?.elevation_required ?? false,
            dependencyExecutor: test.dependency_executor_name,
            dependencies: test.dependencies ?? [],
            inputArguments: Object.entries(test.input_arguments ?? {}).map(([name, argument]) => ({
                name,
                ...argument
            }))
        }));
}

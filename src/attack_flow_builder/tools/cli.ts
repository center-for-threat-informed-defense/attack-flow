// TODO doc blocks everywhere

import Configuration from "../src/assets/configuration/builder.config";
import { PageEditor } from "../src/stores/PageEditor";

// Node.js imports must use require() since the Vue compiler will not understand them.
import * as fs from "fs";
import * as process from "process";

const FLAG_REGEX = new RegExp(`^-`);
const DIAGRAM_PATH_REGEX = new RegExp(`\.${Configuration.file_type_extension}$`);

/**
 * Main entry point for the CLI script.
 */
async function main() {
    if (typeof Configuration.publisher === "undefined") {
        throw new Error("There is no publisher class configured for this application.");
    }
    
    const args = parseCliArguments();

    if (args.help || args.diagramPaths.length === 0) {
        usage();
        return;
    }

    const publisher = new Configuration.publisher();
    
    for (const diagramPath of args.diagramPaths) {
        const publishPath = diagramPath.replace(DIAGRAM_PATH_REGEX, ".json");
        if (args.verbose) {
            console.log(`Publishing ${diagramPath} -> ${publishPath}`);
        }
        const file = fs.readFileSync(diagramPath, "utf8");
        const editor = await PageEditor.fromFile(file);
        const jsonData = publisher.publish(editor.page);
        fs.writeFileSync(publishPath, jsonData, {encoding: "utf8"});
    }
}    

/**
 * Displays CLI usage.
 */
function usage() {
    const script = process.argv[1].split("/").slice(-1);
    const extension = Configuration.file_type_extension;
    console.log(`Usage: node ${script} [--verbose] ${extension}_file ...`)
}

/**
 * Displays a user error (i.e. something the user can fix by changing their command line arguments).
 * @param reason
 *  An error message to display to the user
 * @param exitCode
 *  A process exit code
 */
function error(reason: string, exitCode: number = -1) {
    console.log(`[ERROR] ${reason}`);
    usage();
    process.exit(exitCode);
}

/**
 * A container for command line arguments.
 */
type CliArguments = {
    diagramPaths: Array<string>;
    verbose: boolean;
    help: boolean;
}

/**
 * Parse command line arguments.
 * @returns
 *  The parsed arguments.
 */
function parseCliArguments(): CliArguments {
    const args: CliArguments = {
        diagramPaths: [],
        verbose: false,
        help: false,
    };
        
    // The first two arguments contain the node executable and the name of this script.
    for (const arg of process.argv.slice(2)) {
        if (FLAG_REGEX.test(arg)) {
            switch (arg) {
                case "-h":
                case "--help":
                    args.help = true;
                    break;
                case "-v":
                case "--verbose":
                    args.verbose = true;
                    break;
                default:
                    error(`Unrecognized flag: ${arg}`);
            }
        } else {
            if (DIAGRAM_PATH_REGEX.test(arg)) {
                args.diagramPaths.push(arg);
            } else {
                error(`File extension not supported: ${arg}`);
            }
        }
    }

    return args;
}

main();

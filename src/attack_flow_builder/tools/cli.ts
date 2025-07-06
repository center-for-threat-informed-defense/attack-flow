import configuration from "../src/assets/configuration/app.configuration.ts";
import { DiagramViewExport } from "../src/assets/scripts/OpenChart/DiagramView/index.ts";
import { DiagramModelFile, DiagramObjectFactory } from "../src/assets/scripts/OpenChart/DiagramModel/index.ts";
import { Command } from 'commander';
import { version } from '../package.json';
import { promises as fs } from "fs";
import * as path from "path";
import * as process from "process";
import { LegacyV2PageExport } from "../src/assets/configuration/AttackFlowFilePreprocessor/FileDefinitions/LegacyV2/index.ts";
import AttackFlowFilePreprocessor from "../src/assets/configuration/AttackFlowFilePreprocessor/AttackFlowFilePreprocessor.ts";


const diagramExt = `.${configuration.file_type_extension}`;
const stixExt = `.json`;
const afb2RenameExt = `.afb-v2`;

const program = new Command();

program
  .name('Attack Flow Builder CLI')
  .description('Command line tool for working with Attack Flow Builder (.afb) files.')
  .version(version);

program
    .command("export-stix <paths...>")
    .description("Convert .afb file to STIX bundle (.json)")
    .option("-v, --verbose")
    .action(async (paths, opts) => {
        const publisher = configuration.publisher!.create();
        const schema = configuration.schema;
        const factory = new DiagramObjectFactory(schema);

        for (const diagramPath of paths) {
            if (path.extname(diagramPath) !== diagramExt) {
                console.warn(`Skipping ${diagramPath}: invalid extension (should be ${diagramExt})`);
                continue;
            }
            const publishPath = path.join(
                path.dirname(diagramPath),
                path.basename(diagramPath, diagramExt) + stixExt,
            );
            if (opts.verbose) {
                console.log(`Exporting ${diagramPath} -> ${publishPath}`);
            }
            const data = await fs.readFile(diagramPath, "utf8");
            const json = JSON.parse(data);
            if ("version" in json) {
                console.warn(`Skipping ${diagramPath}: appears to be a v2 file (expected v3)`);
                continue;
            }
            const file = new DiagramModelFile(factory, json as DiagramViewExport);
            const stix = publisher.publish(file);
            await fs.writeFile(publishPath, stix, "utf8");
        }
    });

program
    .command("upgrade-v2 <paths...>")
    .description("Convert v2 .afb file to v3 .afb format")
    .option("-v, --verbose")
    .action(async (paths, opts) => {
        for (const diagramPath of paths) {
            // Validate file extension
            const ext = path.extname(diagramPath);
            if (ext !== diagramExt && ext != afb2RenameExt) {
                console.warn(`Skipping ${diagramPath}: invalid extension (should be ${diagramExt} or ${afb2RenameExt})`);
                continue;
            }

            // Read file and validate that it's in v2 format
            const inputData = await fs.readFile(diagramPath, "utf8");
            const inputJson = JSON.parse(inputData) as LegacyV2PageExport;
            if(!("version" in inputJson)) {
                console.warn(`Skipping ${diagramPath}: this does not appear to be an Attack Flow v2 file.`);
                continue
            }

            // Rename existing .afb files to .afb-v2 so the user has a copy
            // in case something goes wrong.
            if (path.extname(diagramPath) !== afb2RenameExt) {
                const renamedPath = path.join(
                    path.dirname(diagramPath),
                    path.basename(diagramPath, diagramExt) + afb2RenameExt,
                );
                if (opts.verbose) {
                    console.log(`Renaming ${diagramPath} -> ${renamedPath}`);
                }
                await fs.rename(diagramPath, renamedPath);
            }

            const publishPath = path.join(
                path.dirname(diagramPath),
                path.basename(diagramPath, path.extname(diagramPath)) + diagramExt,
            );
            const converter = new AttackFlowFilePreprocessor();
            const outputJson = converter.fromV2(inputJson);
            const outputData = JSON.stringify(outputJson, null, 4);
            if (opts.verbose) {
                console.log(`Saving v3 file: ${publishPath}`);
            }
            await fs.writeFile(publishPath, outputData, "utf8");
        }

    });

program.parse(process.argv);

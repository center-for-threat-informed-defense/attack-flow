/**
 * Download ATT&CK STIX data.
 *
 * This is a prerequisite for building the search index.
 */
import fs from "fs";
import https from "https";
import process from "process";

const baseUrl = "https://raw.githubusercontent.com/mitre-attack/attack-stix-data/master";
const attackUrls = {
    "enterprise-attack.json": `${baseUrl}/enterprise-attack/enterprise-attack-11.1.json`,
    "ics-attack.json": `${baseUrl}/ics-attack/ics-attack-11.1.json`,
    "mobile-attack.json": `${baseUrl}/mobile-attack/mobile-attack-11.1-beta.json`,
};

/**
 * An awaitable download helper.
 *
 * @param url - The URL to download from
 * @param path - The local path to write the document to
 * @returns A promise that resolves when the download completes
 */
function download(url: string, path: string): Promise<void> {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            const stream = fs.createWriteStream(path);
            response.pipe(stream);
            response.on("end", () => {
                if (response.statusCode != 200) {
                    reject(`HTTP ${response.statusCode}`);
                }
            });
            stream.on("finish", () => {
                stream.close();
                resolve();
            });
        });
    });
}

/**
 * Main entry point.
 *
 * Note: Does not return.
 */
async function main() {
    process.stderr.write("Downloading ATT&CK STIX data…\n");
    let status = 0;

    for (const [file, url] of Object.entries(attackUrls)) {
        const basename = url.split("/").pop();
        process.stderr.write(` * ${basename} → data/${file}… `);
        try {
            await download(url, `data/${file}`);
            process.stderr.write(" done\n");
        } catch (err) {
            process.stderr.write(`Error: ${err}\n`);
            status = 1;
        }
    }

    process.stderr.write("\n");
    if (status) {
        process.stderr.write("Finished with errors.\n");
    } else {
        process.stderr.write("Finished successfully.\n");
    }
    process.exit(status);
}

main();

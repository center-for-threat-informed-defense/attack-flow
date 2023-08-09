// This Vue config is used when building the command line tool (cli.ts). It is similar to the regular Vue
// config but contains `target: "node"` so that the command line tool can call Node APIs.
//
// To use it:
//
//     $ export VUE_CLI_SERVICE_CONFIG_PATH=$(realpath vue.cli.config.js)
//     $ npx vue-cli-service build --target lib --name cli --formats commonjs --no-clean src/cli.ts
const path = require("path");
module.exports = {
    publicPath: './',
    configureWebpack: {
        resolve: {
            alias: {
                "~": path.resolve(__dirname, "./")
            }
        },
        target: "node"
    }
};

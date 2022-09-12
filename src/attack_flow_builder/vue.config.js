const path = require("path");
module.exports = {
    publicPath: './',
    configureWebpack: {
        resolve: {
            alias: {
                "~": path.resolve(__dirname, "./")
            }
        }
    }
};
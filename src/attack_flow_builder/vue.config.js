const path = require("path");
module.exports = {
    publicPath: './',
    configureWebpack: {
        resolve: {
            alias: {
                "~": path.resolve(__dirname, "./")
            }
        }
    },
    chainWebpack: config => {
        config.plugin("html").tap(args => {
            args[0].title = "Attack Flow Builder";
            return args;
        })
    }
};

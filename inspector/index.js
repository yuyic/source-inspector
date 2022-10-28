const path = require("path");
const fs = require("fs");

const RootDir = path.resolve(__dirname, "src");
const OutDir = path.resolve(__dirname, "dist");
const AssetsDir = "__open_editor_assets__";
function readTemplate(publicPath = "/") {
    const createPath = (assetsUrl) => {
        if (typeof publicPath === "function") {
            return publicPath(assetsUrl);
        } else {
            return path.join(publicPath, assetsUrl);
        }
    };
    const templatePath = path.resolve(OutDir, "index.html");
    const template = fs.readFileSync(templatePath, "utf-8");
    const result = template
        .replace(/<script[a-z1-9"'\/ =]*?src="(.*?)"/g, function (a, b) {
            return a.replace(b, createPath(b));
        })
        .replace(/<link[a-z1-9"'\/ =]*?href="(.*?)"/g, function (a, b) {
            return a.replace(b, createPath(b));
        });
    return result;
}

module.exports = {
    RootDir,
    OutDir,
    AssetsDir,
    readTemplate,
};

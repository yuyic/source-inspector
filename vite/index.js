const path = require("path");
const { reactDataset, vueDataset } = require("../ast");
const { AssetsDir, OutDir, readTemplate } = require("../inspector");
const { setObjValue } = require("./utils");

module.exports = function OpenEditorPlugin(options) {
    const CWD = process.cwd();
    const publicPath = options?.publicPath ?? "/";
    const createOptions = (filename) => ({
        ...options,
        filename,
        factory(line, column, displayName) {
            const absolute = `${filename}:${line}:${column}`;
            const relative = absolute.replace(CWD, "");
            return {
                key: options?.dataKey || "data-open-in-editor",
                value: `${absolute}|${relative}|${displayName}|${
                    /\.vue$/.test(filename) ? "vue" : "react"
                }`,
            };
        },
    });

    const assetsAbsDir = path.resolve(OutDir, AssetsDir);
    const template = readTemplate(publicPath);
    return {
        name: "open-editor",
        enforce: "pre",
        config(config) {
            setObjValue(config, "server.fs.strict", false);
            return config;
        },
        transform(code, id) {
            const opts = createOptions(id);
            if (/\.(j|t)(s|sx)$/.test(id)) {
                return reactDataset(code, opts);
            }
            if (/\.vue$/.test(id)) {
                return vueDataset(code, opts);
            }
            return code;
        },
        transformIndexHtml(html) {
            const templateContent = template.replaceAll(
                AssetsDir,
                assetsAbsDir
            );
            return html.replace(
                /(?<=<body>)([\s\S]*?)(?=<\/body>)/g,
                (a, b) => {
                    return b + templateContent;
                }
            );
        },
    };
};

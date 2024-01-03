const path = require("path");
const { reactDataset, vueDataset } = require("../ast");
const { AssetsDir, OutDir, readTemplate } = require("../inspector");
const { setObjValue } = require("./utils");
const middleware = require("../middleware");
/**
 * @param {Object} [options]
 * @param {string} [options.hotKey]
 * @param {string} [options.editor]
 */
module.exports = function OpenEditorPlugin(options) {
    const CWD = process.cwd();
    const publicPath = options?.publicPath ?? "/";
    /**
     *
     * @param {string} filename
     * @returns
     */
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
        name: "source-inspector",
        enforce: "pre",
        config(config) {
            setObjValue(config, "server.fs.strict", false);
            return config;
        },
        configureServer(server) {
            server.middlewares.use(middleware);
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
                    return (
                        b +
                        `
                    <script>
                        (function(){
                            if(typeof document !== 'undefined'){
                                window.__open_in_editor__ = ${JSON.stringify({
                                    hotKey: options?.hotKey || 18,
                                })};
                            }
                        })();
                    </script>
                    ` +
                        templateContent
                    );
                }
            );
        },
    };
};

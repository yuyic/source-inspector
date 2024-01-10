const slash = require("slash");
const path = require("path");
const { reactDataset, vueDataset } = require("../ast");
const { AssetsDir, OutDir, readTemplate } = require("../inspector");
const { setObjValue } = require("./utils");
const launch = require("../launch");
/**
 * @param {Object} [options]
 * @param {string} [options.hotKey]
 * @returns {import("vite").PluginOption}
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
    const urlPromise = launch();
    let defaultResolvePlugin;

    return {
        name: "source-inspector",
        enforce: "pre",
        config(config) {
            setObjValue(config, "server.fs.strict", false);
            return config;
        },
        configResolved(config) {
            defaultResolvePlugin = config.plugins.find(
                (i) => i.name === "vite:resolve"
            );
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
        async resolveId(id, importer, resolveOpts) {
            if (!defaultResolvePlugin?.resolveId) return null;

            if (id.startsWith(`/${AssetsDir}`)) {
                const result = await defaultResolvePlugin.resolveId.call(
                    this,
                    slash(path.join("/@fs", OutDir, id)),
                    importer,
                    resolveOpts || {}
                );

                return result;
            }
        },
        async transformIndexHtml(html) {
            const url = await urlPromise;
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
                                    url,
                                })};
                            }
                        })();
                    </script>
                    ` +
                        template
                    );
                }
            );
        },
    };
};

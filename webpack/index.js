const fs = require("fs");
const path = require("path");
const sources = require("webpack-sources");
const {
    AssetsDir,
    OutDir,
    readTemplate,
    extractInspectorCode,
} = require("../inspector");
const launch = require("../launch");
const ModuleFilenameHelpers = require("webpack/lib/ModuleFilenameHelpers");
const cwd = process.cwd();

class OpenInEditorPlugin {
    /**
     * @param {Object} [options]
     * @param {string|number} [options.hotKey]
     */
    constructor(options) {
        this.options = {
            port: 10047,
            hotKey: 18,
            dataKey: "data-open-in-editor",
            ...options,
        };
    }

    /**
     *
     * @param {import("webpack").Compiler} compiler
     * @returns
     */
    apply(compiler) {
        if (compiler.options.mode !== "development") {
            console.warn("Open editor only works in development mode");
            return;
        }

        const webpackPath = require.resolve("webpack", {
            paths: [process.cwd()],
        });
        const webpack = require(webpackPath);
        const webpackVersion = webpack.version.startsWith("4") ? 4 : 5;
        const pluginName = "source-inspector-plugin";
        const assetsAbsDir = path.resolve(OutDir, AssetsDir);
        const template = readTemplate(compiler.options?.output?.publicPath);
        const assetsFiles = fs.readdirSync(assetsAbsDir);
        const assetsSources = assetsFiles.map((assetKey) => {
            const assetPath = path.join(AssetsDir, assetKey);
            const assetSource = fs.readFileSync(
                path.resolve(assetsAbsDir, assetKey),
                "utf-8"
            );
            const source = new sources.RawSource(assetSource);
            return {
                assetPath,
                source,
            };
        });
        const emitAssets = (compilation, assets) => {
            // const htmlAssetKeys = Object.keys(assets).filter((key) =>
            //     /\.html$/.test(key)
            // );
            // htmlAssetKeys.forEach((htmlAssetKey) => {
            //     const htmlAsset = compilation.getAsset(htmlAssetKey);
            //     const source = getHtmlResource(htmlAsset);
            //     compilation.updateAsset(htmlAssetKey, source);
            // });
            assetsSources.forEach(({ assetPath, source }) => {
                if (!compilation.getAsset(assetPath)) {
                    compilation.emitAsset(assetPath, source);
                }
            });
        };

        // const getHtmlResource = (asset) => {
        //     if (/\.html$/.test(asset.name)) {
        //         const contents = asset.source.source().toString("utf-8");
        //         const newHtmlContents = contents.replace(
        //             // /<body>([\s\S]*)<\/body>/g,
        //             /(?<=<body>)([\s\S]*?)(?=<\/body>)/g,
        //             (a, b) => {
        //                 return (
        //                     b +
        //                     `<script>
        //                     window.__open_in_editor__ = ${JSON.stringify({
        //                         hotKey: this.options.hotKey,
        //                         editor: this.options.editor,
        //                     })}
        //                     </script>` +
        //                     template
        //                 );
        //             }
        //         );
        //         return new sources.RawSource(newHtmlContents);
        //     }
        // };

        compiler.options.module?.rules.push({
            test: /\.(js|mjs|jsx|ts|tsx|vue)$/,
            exclude: [/node_modules/],
            use: {
                loader: path.resolve(__dirname, "./dataset-loader.js"),
                options: {
                    dataKey: this.options.dataKey,
                },
            },
        });

        const cache = new WeakMap();
        const matchObject = ModuleFilenameHelpers.matchObject.bind(undefined, {
            include: compiler.options.bundleName
                ? compiler.options.bundleName + ".js"
                : /\.js$/,
        });
        const htmlPromise = launch().then((url) => {
            return `
            (function(){
                if(typeof document !== 'undefined'){
                    ${extractInspectorCode(template)}
                    window.__open_in_editor__ = ${JSON.stringify({
                        url,
                        hotKey: this.options.hotKey,
                    })};
                }
            })();
            `;
        });

        const emitHtml = async (compilation) => {
            const html = await htmlPromise;
            for (const chunk of compilation.chunks) {
                if (!chunk.canBeInitial()) {
                    continue;
                }
                for (const file of chunk.files) {
                    if (!matchObject(file)) {
                        continue;
                    }

                    const data = {
                        chunk,
                        filename: file,
                    };
                    const comment = compilation.getPath(html, data);

                    const asset = compilation.getAsset(file);

                    let cached = cache.get(asset);
                    if (!cached || cached.comment !== comment) {
                        const source = new sources.ConcatSource(
                            comment,
                            "\n",
                            asset.source.source().toString("utf-8")
                        );
                        cache.set(asset, { source, comment });
                    }

                    compilation.updateAsset(file, cache.get(asset).source);
                }
            }
        };

        if (webpackVersion === 4) {
            compiler.hooks.emit.tapAsync(pluginName, (compilation, cb) => {
                emitAssets(compilation, compilation.assets);
                emitHtml(compilation).then(() => cb());
            });
        } else {
            compiler.hooks.compilation.tap(pluginName, (compilation) => {
                compilation.hooks.processAssets.tapAsync(
                    {
                        name: pluginName,
                        stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
                    },
                    (assets, cb) => {
                        emitAssets(compilation, assets);
                        emitHtml(compilation).then(() => {
                            cb();
                        });
                    }
                );
            });
        }
    }
}

module.exports = OpenInEditorPlugin;

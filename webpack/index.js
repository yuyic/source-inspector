const fs = require("fs");
const path = require("path");
const sources = require("webpack-sources");
const {
    AssetsDir,
    OutDir,
    readTemplate,
    extractInspectorCode,
} = require("../inspector");
const createLaunchEditorMiddleware = require("launch-editor-middleware");

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

        const rawAfterSetup =
            compiler.options.devServer?.onAfterSetupMiddleware;
        compiler.options.devServer = Object.assign(
            {},
            compiler.options.devServer,
            {
                onAfterSetupMiddleware(devServer) {
                    if (!devServer) {
                        throw new Error("webpack-dev-server is not defined");
                    }
                    if (rawAfterSetup) {
                        rawAfterSetup(devServer);
                    }
                    devServer.app.use(
                        "/__launch__",
                        createLaunchEditorMiddleware()
                    );
                },
            }
        );

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

        if (webpackVersion === 4) {
            compiler.hooks.emit.tap(pluginName, (compilation) => {
                emitAssets(compilation, compilation.assets);
            });
        } else {
            compiler.hooks.compilation.tap(pluginName, (compilation) => {
                compilation.hooks.processAssets.tap(
                    {
                        name: pluginName,
                        stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
                        additionalAssets: true,
                    },
                    (assets) => {
                        emitAssets(compilation, assets);
                    }
                );
            });
        }
        new webpack.BannerPlugin({
            entryOnly: true,
            include: compiler.options.bundleName
                ? compiler.options.bundleName + ".js"
                : /\.js$/,
            raw: true,
            banner: `
            (function(){
                if(typeof document !== 'undefined'){
                    ${extractInspectorCode(template)}
                    window.__open_in_editor__ = ${JSON.stringify({
                        hotKey: this.options.hotKey,
                    })};
                }
            })();
            `,
        }).apply(compiler);
    }
}

module.exports = OpenInEditorPlugin;

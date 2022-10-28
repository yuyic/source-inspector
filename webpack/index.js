const fs = require("fs");
const path = require("path");
const sources = require("webpack-sources");
const { AssetsDir, OutDir, readTemplate } = require("../inspector");

class OpenInEditorPlugin {
    constructor(options) {
        this.options = {
            port: 10047,
            hotKey: 18,
            dataKey: "data-open-in-editor",
            editor: "vscode",
            ...options,
        };
    }

    apply(compiler) {
        if (compiler.options.mode !== "development") {
            console.warn("Open editor only works in development mode");
            return;
        }

        const webpackPath = require.resolve("webpack", {
            paths: [process.cwd()],
        });
        const webpack = require(webpackPath).version.startsWith("4") ? 4 : 5;
        const pluginName = "open-in-editor-plugin";
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
            const htmlAssetKeys = Object.keys(assets).filter((key) =>
                /\.html$/.test(key)
            );
            htmlAssetKeys.forEach((htmlAssetKey) => {
                const htmlAsset = compilation.getAsset(htmlAssetKey);
                const source = getHtmlResource(htmlAsset);
                compilation.updateAsset(htmlAssetKey, source);
            });
            assetsSources.forEach(({ assetPath, source }) => {
                if (!compilation.getAsset(assetPath)) {
                    compilation.emitAsset(assetPath, source);
                }
            });
        };

        const getHtmlResource = (asset) => {
            if (/\.html$/.test(asset.name)) {
                const contents = asset.source.source().toString("utf-8");
                const newHtmlContents = contents.replace(
                    // /<body>([\s\S]*)<\/body>/g,
                    /(?<=<body>)([\s\S]*?)(?=<\/body>)/g,
                    (a, b) => {
                        return b + template;
                    }
                );
                return new sources.RawSource(newHtmlContents);
            }
        };

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

        if (webpack === 4) {
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
    }
}

module.exports = OpenInEditorPlugin;

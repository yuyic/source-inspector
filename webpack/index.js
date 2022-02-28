const fs = require("fs");
const path = require("path");
const { sources } = require("webpack");
const { AssetsDir, OutDir } = require("../inspector");

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
        const pluginName = "open-in-editor-plugin";
        const htmlTemplate = path.resolve(OutDir, "index.html");
        const assetsAbsDir = path.resolve(OutDir, AssetsDir);
        const template = fs.readFileSync(htmlTemplate);
        const assetsFiles = fs.readdirSync(assetsAbsDir);

        const assetsSources = assetsFiles.map((assetKey) => {
            const assetPath = path.join(AssetsDir, assetKey);
            const assetSource = fs.readFileSync(
                path.join(assetsAbsDir, assetKey),
                "utf-8"
            );
            const source = new sources.RawSource(assetSource);
            return {
                assetPath,
                source,
            };
        });

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

        compiler.hooks.compilation.tap(pluginName, (compilation) => {
            compilation.hooks.processAssets.tap(
                {
                    name: pluginName,
                    stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
                    additionalAssets: true,
                },
                (assets) => {
                    const htmlAssetKeys = Object.keys(assets).filter((key) =>
                        /\.html$/.test(key)
                    );

                    htmlAssetKeys.forEach((htmlAssetKey) => {
                        const htmlAsset = compilation.getAsset(htmlAssetKey);
                        const contents = htmlAsset.source.source();
                        const newHtmlContents = contents.replace(
                            /<body>([\s\S]*)<\/body>/g,
                            (a, b) => {
                                return b + template;
                            }
                        );
                        compilation.updateAsset(
                            htmlAssetKey,
                            new sources.RawSource(newHtmlContents)
                        );
                    });

                    assetsSources.forEach(({ assetPath, source }) => {
                        if (!compilation.getAsset(assetPath)) {
                            compilation.emitAsset(assetPath, source);
                        }
                    });
                }
            );
        });
    }
}

module.exports = OpenInEditorPlugin;

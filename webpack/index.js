const path = require("path");
const { sources } = require("webpack");
const run = require("../inspector");

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
        const htmlTemplate =
            `<script>window.__open_in_editor__ = ${JSON.stringify(
                this.options
            )}</script>\n` +
            `<div id="__open-in-editor__"></div>\n` +
            `<script type="module" src="//localhost:${this.options.port}/entry.jsx"></script>`;

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
                                return b + htmlTemplate;
                            }
                        );

                        compilation.updateAsset(
                            htmlAssetKey,
                            new sources.RawSource(newHtmlContents)
                        );
                    });
                }
            );
        });

        compiler.hooks.environment.tap(pluginName, () => {
            run(this.options);
        });
    }
}

module.exports = OpenInEditorPlugin;

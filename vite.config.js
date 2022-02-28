const { defineConfig } = require("vite");
const reactRefresh = require("@vitejs/plugin-react-refresh");
const { RootDir, AssetsDir, OutDir } = require("./inspector");

module.exports = defineConfig({
    plugins: [reactRefresh()],
    root: RootDir,
    esbuild: {
        jsxInject: `import React from 'react';`,
    },
    css: {
        preprocessorOptions: {
            less: {
                javascriptEnabled: true,
            },
        },
        modules: {
            generateScopedName: "[name]-[local]-[hash:base64:5]",
            hashPrefix: "prefix",
        },
    },
    build: {
        outDir: OutDir,
        assetsDir: AssetsDir,
    },
});

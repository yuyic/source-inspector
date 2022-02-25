const { defineConfig } = require("vite");
const reactRefresh = require("@vitejs/plugin-react-refresh");
const path = require("path");
// https://vitejs.dev/config/
module.exports = defineConfig({
    plugins: [reactRefresh()],
    root: path.resolve(__dirname, "inspector/src"),
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
});

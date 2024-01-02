const path = require("path");

const BUNDLE_FILENAME = "main";

/**
 * @param {number} port
 * @returns {string}
 */
function getIndexHTML(port) {
    return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Sandbox React App</title>
  </head>
  <body>
    <div id="app"></div>
    <script src="http://localhost:${port}/${BUNDLE_FILENAME}.js"></script>
  </body>
</html>
`;
}

/**
 * @param {number} port
 * @returns {string}
 */
function getViteEntry(port) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Sandbox React App</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/index.jsx"></script>
</body>
</html>
`;
}

/**
 * @param {boolean} esModule
 * @returns {string}
 */
function getPackageJson(esModule = false) {
    return `
{
  "type": "${esModule ? "module" : "commonjs"}"
}
`;
}

/**
 * @param {string} srcDir
 * @returns {string}
 */
function getWDSConfig(srcDir) {
    return `
const { DefinePlugin, ProgressPlugin } = require('webpack');
const { webpack:SourceInspectorPlugin } = require("source-inspector");


module.exports = {
  mode: 'development',
  context: '${srcDir}',
  devtool: false,
  entry: {
    '${BUNDLE_FILENAME}': [
      './index.js',
    ],
  },
  module: {
    rules: [
      {
        test: /\\.(js|jsx)$/,
        use: [
          {
            loader: '${require
                .resolve("babel-loader")
                .normalize()
                .replace(/\\/g, "\\\\")}',
            options: {
              babelrc: false,
              presets: ["@babel/preset-react"],
            }
          }
        ],
      },
    ],
  },
  output: {
    hashFunction: ${WEBPACK_VERSION === 4 ? "'sha1'" : "'xxhash64'"},
  },
  plugins: [
    // new DefinePlugin({ __react_refresh_test__: true }),
    new ProgressPlugin((percentage) => {
      if (percentage === 1) {
        console.log("Webpack compilation complete.");
      }
    }),
    new SourceInspectorPlugin(),
  ],
  resolve: {
    alias: ${JSON.stringify(
        {
            ...(WEBPACK_VERSION === 4 && { webpack: "webpack.legacy" }),
            ...(WDS_VERSION === 3 && {
                "webpack-dev-server": "webpack-dev-server.legacy",
            }),
        },
        null,
        2
    )},
    extensions: ['.js', '.jsx'],
  },
};
`;
}

/**
 * @param {string} srcDir
 * @returns {string}
 */
function getViteConfig(srcDir, OutDir) {
    return `
    const { vite:SourceInspectorPlugin } = require("source-inspector");
    const { defineConfig } = require("vite");

    module.exports = defineConfig({
      plugins: [SourceInspectorPlugin()],
      root: "${srcDir}"
    });

  `;
}

module.exports = {
    getIndexHTML,
    getPackageJson,
    getWDSConfig,
    getViteConfig,
    getViteEntry,
};

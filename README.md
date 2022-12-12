# source-inspector

* Inspect html elements' source code in IDE

![](./20220225_151400.gif)

## Webpack（version 4，5）

```
const SourceInspectorWebpackPlugin = require('source-inspector/webpack')

module.exports = {
  entry: 'index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'index_bundle.js'
  },
  plugins: [
    new SourceInspectorWebpackPlugin({
        editor: "vscode", // eg: sublime，textmate，emacs，macvim，phpstorm，webstorm，idea，atom，vscode，默认vscode
        hotKey: "Alt" // trigger inspector
    })
  ]
}
```
## Vite
```
import SourceInspectorPlugin from "source-inspector/vite";

export default defineConfig({
  plugins: [SourceInspectorPlugin()]
});

```

### `Support react and vue`


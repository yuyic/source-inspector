# source-inspector

* Inspect html elements' source code in IDE

![](./20220225_151400.gif)

```bash
npm install source-inspector --save-dev # or yarn add source-inspector --save-dev
```

## Webpack（version 4 or 5）

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
        hotKey: "Alt" // trigger inspector
    })
  ]
}
```
> **Note**
> You should use source-inspect's middleware in customized devServer
```
require('source-inspector').middleware;
```
## Vite
```
import SourceInspectorPlugin from "source-inspector/vite";

export default defineConfig({
  plugins: [SourceInspectorPlugin()]
});

```

### `Support react and vue`


# open-editor

* 在IDE中打开前端元素对应的源码

![](./20220225_151400.gif)

## Webpack

```
const OpenEditorWebpackPlugin = require('open-editor/webpack')

module.exports = {
  entry: 'index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'index_bundle.js'
  },
  plugins: [
    new OpenEditorWebpackPlugin({
        editor: "vscode", // 编辑器，支持sublime，textmate，emacs，macvim，phpstorm，webstorm，idea，atom，vscode，默认vscode
        hotKey: "Alt" // 开启元素抓取的热键， 默认Alt
    })
  ]
}
```
### `暂时只支持react，有需要再支持vue`

### `不支持通过antd直接创建的元素，比如没有定义content的Modal.confirm`

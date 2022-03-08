const { parse, transform } = require("@vue/compiler-dom");
const MagicString = require("magic-string");

module.exports = function vueDataset(source, options) {
    const ast = parse(source);
    const magic = new MagicString(source);
    const templateAst = ast.children.find((item) => item.tag === "template");

    if (templateAst) {
        transform(templateAst, {
            nodeTransforms: [
                (node) => {
                    if (
                        node.type === 1 &&
                        node.tagType === 0 &&
                        node.tag !== "template"
                    ) {
                        const { start } = node.loc;
                        const { key, value } = options.factory(
                            start.line,
                            start.column,
                            node.tag
                        );
                        const attribute = ` ${key}="${value}" `;
                        const insertIdx = start.offset + node.tag.length + 1;
                        magic.appendLeft(insertIdx + 1, attribute);
                    }
                },
            ],
        });
    }

    return magic.toString();
};

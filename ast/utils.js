const { parse } = require("@babel/parser");
const generate = require("@babel/generator").default;

exports.parseModule = function (source) {
    return parse(source, {
        sourceType: "unambiguous",
        allowUndeclaredExports: true,
        allowImportExportEverywhere: true,
        plugins: [
            "typescript",
            "jsx",
            ["decorators", { decoratorsBeforeExport: true }],
            "logicalAssignment",
        ],
    });
};
exports.generateCode = function (ast) {
    const { code } = generate(ast, {
        decoratorsBeforeExport: true,
    });
    return code + "\n";
};

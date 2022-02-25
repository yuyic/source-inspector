const t = require("@babel/types");
const traverse = require("@babel/traverse").default;
const fs = require("fs");
const path = require("path");
const { parseModule, generateCode } = require("./utils.js");

function isUndefinedIdentifier(identifier) {
    return (
        t.isIdentifier(identifier) &&
        identifier.name === "undefined" &&
        identifier.loc.identifierName === "undefined"
    );
}

function isCreateElementExpression(node) {
    const callee = node.callee;
    return (
        node.type === "CallExpression" &&
        callee.type === "MemberExpression" &&
        callee.object.type === "Identifier" &&
        callee.object.name === "React" &&
        callee.property.type === "Identifier" &&
        callee.property.name === "createElement"
    );
}

function parseNodeInfo(node) {
    const { name, loc } = node;
    return {
        name: name?.name || "unknown",
        line: loc.start?.line || 0,
        column: loc.start?.column || 0,
    };
}

const DEBUG = false;

module.exports = function reactDataset(source, options) {
    const ast = parseModule(source);

    let reactLocalName;
    let fragmentLocalName;

    traverse(ast, {
        ImportDefaultSpecifier: {
            enter(path) {
                if (path.parent?.source?.value === "react") {
                    reactLocalName = path.node.local?.name;
                }
            },
        },
        ImportSpecifier: {
            enter(path) {
                if (
                    path.parent?.source?.value === "react" &&
                    path.node.imported.name === "Fragment"
                ) {
                    fragmentLocalName = path.node.local?.name;
                }
            },
        },
        CallExpression: {
            enter(path) {
                if (isCreateElementExpression(path.node)) {
                    const { line, column, name } = parseNodeInfo(path.node);
                    const { key, value } = options.factory(line, column, name);
                    const property = t.objectProperty(
                        t.stringLiteral(key),
                        t.stringLiteral(value)
                    );
                    const args = path.node.arguments;
                    if (
                        !args[1] ||
                        t.isNullLiteral(args[1]) ||
                        isUndefinedIdentifier(args[1])
                    ) {
                        args[1] = t.objectExpression([]);
                    }
                    args[1].properties.push(property);
                }
            },
        },
        JSXOpeningElement: {
            enter(path, state) {
                if (fragmentLocalName || reactLocalName) {
                    const nodeName = path.node?.name;
                    if (nodeName?.name === fragmentLocalName) {
                        return;
                    } else if (t.isJSXMemberExpression(nodeName)) {
                        if (
                            nodeName.object.name === reactLocalName &&
                            nodeName.property.name === "Fragment"
                        ) {
                            return;
                        }
                    }
                }
                const { line, column, name } = parseNodeInfo(path.node);
                const { key, value } = options.factory(line, column, name);
                const attr = t.jsxAttribute(
                    t.jsxIdentifier(key),
                    t.stringLiteral(value)
                );
                path.node.attributes.push(attr);
            },
        },

        ObjectExpression: {
            enter(path) {
                if (
                    path.node.innerComments?.some(
                        (comment) =>
                            String.prototype.trim.call(comment.value) ===
                            "__open_editor__"
                    )
                ) {
                    const { line, column, name } = parseNodeInfo(path.node);
                    const { key, value } = options.factory(line, column, name);
                    const property = t.objectProperty(
                        t.stringLiteral(key),
                        t.stringLiteral(value)
                    );
                    path.node.properties.push(property);
                }
            },
        },
    });

    const code = generateCode(ast);

    if (DEBUG) {
        const tempFile = path.resolve(
            __dirname,
            "debug",
            path.basename(options.filename)
        );
        fs.writeFileSync(tempFile + ".json", JSON.stringify(ast));
        fs.writeFileSync(tempFile + ".tsx", code);
    }
    return code;
};

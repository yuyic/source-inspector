const { reactDataset, vueDataset } = require("../ast");
const { getOptions } = require("loader-utils");
const { validate } = require("schema-utils");

const CWD = process.cwd();

const schema = {
    title: "dataset-loader",
    additionalProperties: false,
    properties: {
        dataKey: {
            type: "string",
        },
    },
};
/**
 * @param {string} [source]
 * @returns
 */
module.exports = function loader(source) {
    const filename = this.resourcePath;
    if (!filename || filename.match(/node_modules/g)) {
        return source;
    }

    const isVue = /\.vue$/.test(filename);
    const rawOptions = getOptions(this);
    validate(schema, rawOptions, {
        name: "dataset-loader",
        baseDataPath: "options",
    });

    const options = {
        ...rawOptions,
        filename,
        factory(line, column, displayName) {
            const absolute = `${filename}:${line}:${column}`;
            const relative = absolute.replace(CWD, "");
            return {
                key: rawOptions.dataKey || "data-open-in-editor",
                value: `${absolute}|${relative}|${displayName}|${
                    isVue ? "vue" : "react"
                }`,
            };
        },
    };

    // TODO vue
    try {
        if (isVue) {
            return vueDataset(source, options);
        } else {
            return reactDataset(source, options);
        }
    } catch (e) {
        console.log("[source-inspector] %s %s", options.filename, e.message);
        return source;
    }
};

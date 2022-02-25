const { reactDataset } = require("../ast");
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

module.exports = function loader(source) {
    const filename = this.resourcePath;

    if (!filename || filename.match(/node_modules/g)) {
        return source;
    }

    const rawOptions = this.getOptions(schema);

    const options = {
        ...rawOptions,
        filename,
        factory(line, column, displayName) {
            const absolute = `${filename}:${line}:${column}`;
            const relative = absolute.replace(CWD, "");
            return {
                key: rawOptions.dataKey || "data-open-in-editor",
                value: `${absolute}|${relative}|${displayName}|react`,
            };
        },
    };

    // TODO vue
    if (/\.vue$/.test(filename)) {
        return source;
    } else {
        return reactDataset(source, options);
    }
};

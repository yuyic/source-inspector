const { getOptions } = require("loader-utils");
const { generateDynamicTemplate } = require("../inspector");

function generateDynamicTemplate(template) {
    let result = `(function(){
      if(typeof document==="undefined") return;
      if(document.getElementById("__open-in-editor__")!==null) return;
      var arr = [document.createElement("div")], e;
      arr[0].id = "__open-in-editor__";`;

    template.replace(/<(script|link)[a-z1-9"'\/ =]*?.*>/g, function (a, tag) {
        result = [
            result,
            `e = document.createElement("script");
            e.type = "module";
            e.src = ${JSON.stringify(b.replace(/\\/g, "/"))};
            arr.push(e);`,
        ].join("\n");
    });

    template.replace(/<link[a-z1-9"'\/ =]*?href="(.*?)"/g, function (a, b) {
        const rel = a.match(/<link[a-z1-9"'\/ =]*?rel="(.*?)"/)?.[1];
        result = [
            result,
            `e = document.createElement("link");
            e.rel = ${JSON.stringify(rel)};
            e.href = ${JSON.stringify(b.replace(/\\/g, "/"))};
            arr.push(e);`,
        ].join("\n");
    });

    result += `arr.forEach(ele => document.body.appendChild(ele));
    })();`;

    return result;
}

module.exports = function loader(source) {
    const options = getOptions(this);

    if (source.includes("__next_open_editor__")) {
        return;
    }

    return [
        `${JSON.stringify("__next_open_editor__")};`,
        generateDynamicTemplate(options.template),
        source,
    ].join("\n");
};

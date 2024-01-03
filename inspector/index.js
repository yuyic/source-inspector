const path = require("path");
const fs = require("fs");
const RootDir = path.resolve(__dirname, "src");
const OutDir = path.resolve(__dirname, "dist");
const AssetsDir = "__open_editor_assets__";
function readTemplate(publicPath = "/") {
    const createPath = (assetsUrl) => {
        if (typeof publicPath === "function") {
            return publicPath(assetsUrl);
        } else {
            return path.join(publicPath, assetsUrl);
        }
    };
    const templatePath = path.resolve(OutDir, "index.html");
    const template = fs.readFileSync(templatePath, "utf-8");
    const result = template
        .replace(/<script[a-z1-9"'\/ =]*?src="(.*?)"/g, function (a, b) {
            return a.replace(b, createPath(b));
        })
        .replace(/<link[a-z1-9"'\/ =]*?href="(.*?)"/g, function (a, b) {
            return a.replace(b, createPath(b));
        });
    return result;
}

const createAppendTagStr = (tag, attrs) => {
    return `(function(){
        var tag = document.createElement('${tag}');
        ${Object.entries(attrs)
            .map(
                ([key, value]) =>
                    `tag.${key} = ${JSON.stringify(value).replace(
                        /\\\\/g,
                        "/"
                    )}`
            )
            .join("\n")}
        document.body.appendChild(tag);
    })();`;
};

function extractTag(str, regex) {
    const result = [];
    let match = null;
    while ((match = regex.exec(str))) {
        result.push(match[0]);
    }
    return result;
}

function extractInspectorCode(template) {
    const scriptTags = extractTag(
        template,
        /<(script)\s+((?!type=('|")text\/ng-template\3).)*?>.*?<\/\1>/gis
    )
        .map((script) => {
            const src = /.*\ssrc=('|")?([^>'"\s]+)/.exec(script)?.[2];
            return createAppendTagStr("script", {
                src,
                type: "module",
                crossorigin: "anonymous",
            });
        })
        .join("\n");

    const linkTags = extractTag(template, /<(link)\s+.*?>/gis)
        .map((link) => {
            const href = /.*\shref=('|")?([^>'"\s]+)/.exec(link)?.[2];
            const rel = /\srel=('|")?(modulepreload|stylesheet)\1/.exec(
                link
            )?.[2];
            return createAppendTagStr("link", { href, rel });
        })
        .join("\n");

    const wrapper = createAppendTagStr("div", {
        id: "__open-in-editor__",
    });

    return [scriptTags, linkTags, wrapper].join("\n");
}

module.exports = {
    RootDir,
    OutDir,
    AssetsDir,
    readTemplate,
    extractInspectorCode,
};

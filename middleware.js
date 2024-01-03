const url = require("url");
const path = require("path");
const launch = require("launch-editor");

module.exports = function middleware(req, res, next) {
    const obj = url.parse(req.originalUrl, true);
    if (obj.pathname === "/__launch__") {
        const { file } = obj.query || {};
        if (!file) {
            res.statusCode = 500;
            res.end(
                `launch-editor-middleware: required query param "file" is missing.`
            );
        } else {
            launch(path.resolve(file));
            res.end("<script>window.close();</script>");
        }
    } else {
        next();
    }
};

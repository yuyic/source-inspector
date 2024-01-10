const url = require("url");
const path = require("path");
const launch = require("launch-editor");
const express = require("express");
const getPort = require("get-port");

function middleware(req, res, next) {
    const obj = url.parse(req.originalUrl, true);
    const { file } = obj.query || {};
    if (!file) {
        res.statusCode = 500;
        res.end(`required query param "file" is missing.`);
    } else {
        launch(path.resolve(file));
        res.end("<script>window.close();</script>");
    }
}

module.exports = async function start() {
    const app = express();
    const port = await getPort();
    app.use(middleware);
    app.listen(port);
    return `http://localhost:${port}`;
};

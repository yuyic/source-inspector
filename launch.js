const url = require("url");
const path = require("path");
const launch = require("launch-editor");
const getPort = require("get-port");
const http = require("http");

/**
 *
 * @param {number} port
 * @returns {Promise<http.Server>}
 */
const createServer = (port) => {
    return new Promise((resolve, reject) => {
        const server = http.createServer((req, res) => {
            const obj = url.parse(req.url, true);
            const { file } = obj.query || {};
            if (!file) {
                res.statusCode = 500;
                res.end(`required query param "file" is missing.`);
            } else {
                launch(path.resolve(file));
                res.end("<script>window.close();</script>");
            }
        });
        server.listen(port, () => {
            resolve(server);
        });
        server.on("error", (error) => {
            reject(error);
        });
    });
};

/**
 *
 * @returns {string}
 */

module.exports = async function start() {
    const port = await getPort();
    const server = await createServer(port);
    return `http://localhost:${server.address().port}`;
};

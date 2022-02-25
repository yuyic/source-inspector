const util = require("util");
const path = require("path");
const exec = util.promisify(require("child_process").exec);
const root = path.resolve(__dirname, "..");
async function run(options) {
    try {
        await exec(
            `cd ${root} && yarn inspect --cors --port=${options.port} --strictPort`
        );
    } catch (e) {
        console.warn(`Run port ${options.port} failed`);
    }
}

module.exports = run;

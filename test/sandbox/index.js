const path = require("path");
const fse = require("fs-extra");
const getPort = require("get-port");
const { nanoid } = require("nanoid");
const {
    getIndexHTML,
    getPackageJson,
    getWDSConfig,
    getViteConfig,
    getViteEntry,
} = require("./configs");
const { killTestProcess, spawnWebpackServe, spawnVite } = require("./spawn");

// Extends the timeout for tests using the sandbox
jest.setTimeout(1000 * 60);

// Setup a global "queue" of cleanup handlers to allow auto-teardown of tests,
// even when they did not run the cleanup function.
/** @type {Map<string, function(): Promise<void>>} */
const cleanupHandlers = new Map();
afterEach(async () => {
    for (const [, callback] of cleanupHandlers) {
        await callback();
    }
});

/**
 * Logs output to the console (only in debug mode).
 * @param {...*} args
 * @returns {void}
 */
const log = (...args) => {
    if (__DEBUG__) {
        console.log(...args);
    }
};

/**
 * Pause current asynchronous execution for provided milliseconds.
 * @param {number} ms
 * @returns {Promise<void>}
 */
const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

/**
 * @typedef {Object} SandboxSession
 * @property {boolean} didFullRefresh
 * @property {*[]} errors
 * @property {*[]} logs
 * @property {function():Promise<import("puppeteer").Target[]>} pages
 * @property {function(): void} resetState
 * @property {function(string, string): Promise<void>} write
 * @property {function(string, string): Promise<void>} patch
 * @property {function(string): Promise<void>} remove
 * @property {function(*, ...*=): Promise<*>} evaluate
 * @property {function(): Promise<void>} reload
 * @property {function(string): Promise<void>} inspect
 */

const rootSandboxDir = path.join(__dirname, "..", "__tmp__");

/**
 *
 * @param {string} str
 * @returns
 */
const posixPath = (str) => str.split(path.sep).join(path.posix.sep);

/**
 *
 * @param {*} fn
 * @returns {Function}
 */
function runnable(fn) {
    return new Function("arguments", `return ${fn.toString()}(arguments)`);
}

/**
 * Creates a Webpack and Puppeteer backed sandbox to execute HMR operations on.
 * @param {Object} [options]
 * @param {boolean} [options.esModule]
 * @param {string} [options.id]
 * @param {Map<string, string>} [options.initialFiles]
 * @param {string} [options.compiler]
 * @returns {Promise<[SandboxSession, function(): Promise<void>]>}
 */
async function getSandbox({
    esModule = false,
    id = nanoid(),
    initialFiles = new Map(),
    compiler = "webpack",
} = {}) {
    const port = await getPort();

    // Get sandbox directory paths
    const sandboxDir = path.join(rootSandboxDir, id);
    const srcDir = path.join(sandboxDir, "src");
    const publicDir = path.join(sandboxDir, "public");

    // In case of an ID clash, remove the existing sandbox directory
    await fse.remove(sandboxDir);
    // Create the sandbox source directory
    await fse.mkdirp(srcDir);

    // Write necessary files to sandbox
    if (compiler === "webpack") {
        // Create the sandbox public directory
        await fse.mkdirp(publicDir);

        await fse.writeFile(
            path.join(sandboxDir, "webpack.config.js"),
            getWDSConfig(srcDir.normalize().replace(/\\/g, "\\\\"))
        );

        await fse.writeFile(
            path.join(publicDir, "index.html"),
            getIndexHTML(port)
        );
    } else if (compiler === "vite") {
        await fse.writeFile(
            path.join(srcDir, "index.html"),
            getViteEntry(port)
        );
        await fse.writeFile(
            path.join(sandboxDir, "vite.config.js"),
            getViteConfig(srcDir.normalize().replace(/\\/g, "\\\\"))
        );
    } else {
        throw new Error(`Unknown compiler ${compiler}`);
    }

    await fse.writeFile(
        path.join(srcDir, "package.json"),
        getPackageJson(esModule)
    );

    await fse.writeFile(
        path.join(srcDir, "index.js"),
        esModule
            ? `export default function Sandbox() { return 'new sandbox'; }`
            : "module.exports = function Sandbox() { return 'new sandbox'; };"
    );

    // Write initial files to sandbox
    for (const [filePath, fileContent] of initialFiles.entries()) {
        await fse.writeFile(path.join(srcDir, filePath), fileContent);
    }

    // TODO: Add handling for webpack-hot-middleware and webpack-plugin-serve
    const app =
        compiler === "webpack"
            ? await spawnWebpackServe(port, {
                  public: publicDir,
                  root: sandboxDir,
                  src: srcDir,
              })
            : await spawnVite(port, {
                  public: publicDir,
                  root: sandboxDir,
                  src: srcDir,
              });

    /** @type {import('puppeteer').Page} */
    const page = await browser.newPage();

    await page.goto(`http://localhost:${port}/`);

    let didFullRefresh = false;
    /** @type {string[]} */
    let errors = [];
    /** @type {string[]} */
    let logs = [];

    // Expose logging and hot callbacks to the page
    await Promise.all([
        page.exposeFunction("log", (...args) => {
            logs.push(args.join(" "));
        }),
        page.exposeFunction("onHotAcceptError", (errorMessage) => {
            errors.push(errorMessage);
        }),
    ]);

    // Reset testing logs and errors on any navigation.
    // This is done for the main frame only,
    // because child frames (e.g. iframes) might attach to the document,
    // which will cause this event to fire.
    page.on("framenavigated", (frame) => {
        if (frame === page.mainFrame()) {
            resetState();
        }
    });

    /** @returns {void} */
    function resetState() {
        errors = [];
        logs = [];
    }

    async function cleanupSandbox() {
        try {
            await page.close();
            await killTestProcess(app);

            if (!__DEBUG__) {
                await fse.remove(sandboxDir);
            }

            // Remove current cleanup handler from the global queue since it has been called
            cleanupHandlers.delete(id);
        } catch (e) {
            // Do nothing
        }
    }

    // Cache the cleanup handler for global cleanup
    // This is done in case tests fail and async handlers are kept alive
    cleanupHandlers.set(id, cleanupSandbox);

    return [
        {
            /** @type {boolean} */
            get didFullRefresh() {
                return didFullRefresh;
            },
            /** @type {*[]} */
            get errors() {
                return errors;
            },
            /** @type {*[]} */
            get logs() {
                return logs;
            },

            /** @returns {void} */
            resetState,

            /** @returns {Promise<import("puppeteer").Target[]>} */
            async pages() {
                return await browser.targets();
            },
            /**
             * @param {string} fileName
             * @param {string} content
             * @returns {Promise<void>}
             */
            async write(fileName, content) {
                // Update the file on filesystem
                const fullFileName = path.join(srcDir, fileName);
                const directory = path.dirname(fullFileName);
                await fse.mkdirp(directory);
                await fse.writeFile(fullFileName, content);
            },
            /**
             * @param {string} fileName
             * @returns {Promise<void>}
             */
            async remove(fileName) {
                const fullFileName = path.join(srcDir, fileName);
                await fse.remove(fullFileName);
            },
            /**
             * @param {*} fn
             * @param {...*} restArgs
             * @returns {Promise<*>}
             */
            async evaluate(fn, ...restArgs) {
                if (typeof fn === "function") {
                    return await page.evaluate(fn, ...restArgs);
                } else {
                    throw new Error(
                        "You must pass a function to be evaluated in the browser!"
                    );
                }
            },
            /** @returns {Promise<void>} */
            async reload() {
                await page.reload({ waitUntil: "networkidle2" });
                didFullRefresh = false;
            },

            /**
             * @param {import("puppeteer").KeyInput} key
             * @param {Object} [options]
             * @param {string} [options.text]
             * @param {string[]} [options.commands]
             */
            async down(key, options) {
                await page.keyboard.down(key, options);
            },

            /**
             * @param {import("puppeteer").KeyInput} key
             */
            async up(key) {
                await page.keyboard.up(key);
            },
            /**
             * @param {string} key
             */
            async inspect(selector) {
                const handler = await page.waitForSelector(selector);
                await page.keyboard.down("Alt");
                await page.evaluate(() => {
                    const originWindowOpen = window.open;
                    window.open = function (...args) {
                        window.log(args[0]);
                        originWindowOpen.apply(null, args);
                    };
                });
                await page.evaluate((element) => element.click(), handler);
                await page.keyboard.up("Alt");
                await handler.dispose();
            },
        },
        cleanupSandbox,
    ];
}

module.exports = getSandbox;

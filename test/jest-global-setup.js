const puppeteer = require("puppeteer");
const yn = require("yn");

async function setup() {
    const browser = await puppeteer.launch({
        devtools: yn(process.env.DEBUG, { default: false }),
        headless: yn(process.env.HEADLESS, { default: true }),
        args: [`--no-sandbox --disable-setuid-sandbox`],
        slowMo: 50,
    });

    global.__BROWSER_INSTANCE__ = browser;

    process.env.PUPPETEER_WS_ENDPOINT = browser.wsEndpoint();
}

module.exports = setup;

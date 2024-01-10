const getSandbox = require("../sandbox");

it("vite re-runs accepted modules", async () => {
    const [session] = await getSandbox({
        esModule: true,
        compiler: "vite",
    });

    await session.write("index.jsx", `window.log("init")`);
    await session.reload();
    expect(session.errors).toEqual([]);
    expect(session.logs).toStrictEqual(["init"]);

    const config = await session.evaluate(() => window.__open_in_editor__);
    expect(config).toEqual(
        expect.objectContaining({
            hotKey: expect.any(Number),
            url: expect.any(String),
        })
    );
});

it("vite element click", async () => {
    const [session] = await getSandbox({
        esModule: true,
        compiler: "vite",
    });
    const url = await session.evaluate(() => window.__open_in_editor__?.url);
    await session.write(
        "index.jsx",
        `import React from "react";
        import ReactDOM from "react-dom";
        const App = () => <div id="click">Click</div>
        ReactDOM.render(<App />, document.getElementById("app"));`
    );
    await session.reload();
    await session.inspect("#click");
    expect(session.logs[0]).toMatch(new RegExp(`^${url}?`));
});

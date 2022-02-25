const reactDataset = require("./react-dataset");

const options = {
    factory() {
        return {
            key: "data-test",
            value: "test",
        };
    },
};

describe("reactDataset", () => {
    it("can convert jsxElement", () => {
        const code = `
        const App = () => <div>test</div>
        `;
        expect(reactDataset(code, options)).toMatchSnapshot();
    });

    it("can convert closet jsxElement", () => {
        const code = `
        const App = () => <div />
        `;
        expect(reactDataset(code, options)).toMatchSnapshot();
    });

    it("will not converte jsxfragment", () => {
        const code = `
        const App = () => <></>
        `;
        expect(reactDataset(code, options)).toMatchSnapshot();
    });

    it("will not converte react fragment", () => {
        const code = `
        import React from "react";
        const App = () => <React.Fragment />;
        `;
        expect(reactDataset(code, options)).toMatchSnapshot();
    });

    it("will not converte react fragment alias", () => {
        const code = `
        import { Fragment as Frag } from "react";
        const App = () => <Frag />;
        `;
        expect(reactDataset(code, options)).toMatchSnapshot();
    });

    it("will not converte react fragment raw", () => {
        const code = `
        import { Fragment } from "react";
        const App = () => <Fragment />;
        `;
        expect(reactDataset(code, options)).toMatchSnapshot();
    });

    it("will not converte react fragment raw and alias", () => {
        const code = `
        import React, { Fragment as frag2 } from "react";
        const App = () => <React.Fragment />;
        const App2 = () => <frag2 />;
        `;
        expect(reactDataset(code, options)).toMatchSnapshot();
    });

    it("can convert createElement", () => {
        const code = `
        React.createElement("div")
        `;
        expect(reactDataset(code, options)).toMatchSnapshot();
    });

    it("can convert createElement with null props", () => {
        const code = `
        React.createElement("div", null, "text")
        `;
        expect(reactDataset(code, options)).toMatchSnapshot();
    });

    it("can convert createElement with undefined props", () => {
        const code = `
        React.createElement("div", undefined, "text")
        `;
        expect(reactDataset(code, options)).toMatchSnapshot();
    });

    it("can convert createElement with props", () => {
        const code = `
        React.createElement("div", {}, "text")
        `;
        expect(reactDataset(code, options)).toMatchSnapshot();
    });
});

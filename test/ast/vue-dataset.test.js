const vueDataset = require("../../ast/vue-dataset");

const options = {
    factory() {
        return {
            key: "data-test",
            value: "test",
        };
    },
};
describe("vue-dataset", () => {
    it("can converte template", () => {
        const code = `<template><div></div><input /></template>`;
        expect(vueDataset(code, options)).toMatchSnapshot();
    });
});

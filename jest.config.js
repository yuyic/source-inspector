module.exports = {
    globalSetup: "<rootDir>/jest-global-setup.js",
    globalTeardown: "<rootDir>/jest-global-teardown.js",
    rootDir: "test",
    testEnvironment: "<rootDir>/jest-environment.js",
    testMatch: ["<rootDir>/**/*.test.js"],
};

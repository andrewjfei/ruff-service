import type { Config } from "jest";

const config: Config = {
    // Inidcates whether each test should be reported
    verbose: true,

    // The root directory that Jest should scan for tests
    rootDir: "src",

    // The file extensions Jest should load in your tests
    moduleFileExtensions: ["ts", "js", "json"],

    // Pattern Jest uses to detect test files (i.e. ending with .spec.ts)
    testRegex: ".*\\.spec\\.ts$",

    // The transformer to use for your test files, as Jest runs your code in JavaScript
    transform: {
        "^.+\\.ts$": "ts-jest",
    },

    // Pattern Jest uses to collect coverage information from
    collectCoverageFrom: ["**/*.ts"],

    // The directory where Jest should output coverage reports
    coverageDirectory: "../coverage",

    // The environment that Jest should uses for testing
    testEnvironment: "node",

    // The timeout in milliseconds for a single test
    testTimeout: 5000,

    // The mapping of module names when running your tests
    moduleNameMapper: {
        "^src/(.*)$": "<rootDir>/$1",
    },
};

export default config;

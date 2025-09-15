import type { Config } from "jest";

const config: Config = {
    verbose: true,
    rootDir: "src",
    moduleFileExtensions: ["ts", "js", "json"],
    testRegex: ".*\\integration.spec\\.ts$",
    transform: {
        "^.+\\.ts$": "ts-jest",
    },
    testEnvironment: "node",
    testTimeout: 10000,
    setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
    maxWorkers: 1,
    moduleNameMapper: {
        "^prisma/(.*)$": "<rootDir>/../prisma/$1",
    },
};

export default config;

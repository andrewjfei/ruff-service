import { registerAs } from "@nestjs/config";

export const appConfig = registerAs("app", () => ({
    name: process.env.APP_NAME || "ruff-service",
    port: process.env.PORT || 3000,
    env: process.env.ENV || "production",
}));

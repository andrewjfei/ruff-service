import {
    PostgreSqlContainer,
    StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { execSync } from "child_process";

let postgresContainer: StartedPostgreSqlContainer;

beforeAll(async () => {
    // Set up test database container
    postgresContainer = await new PostgreSqlContainer("postgres:17-alpine")
        .withDatabase("test_db")
        .withUsername("test")
        .withPassword("test")
        .withExposedPorts(5432)
        .start();

    // Set up test database URL
    const connectionString = postgresContainer.getConnectionUri();
    process.env.DATABASE_URL = connectionString;

    // Run Prisma migrations on the test database
    execSync("pnpm prisma migrate deploy", {
        // Add current process environment variables to the new process (i.e. pnpm)
        env: { ...process.env, DATABASE_URL: connectionString },
        stdio: "pipe",
    });
}, 60000); // 60 second timeout for container startup

afterAll(async () => {
    // Stop and remove the container
    if (postgresContainer) {
        await postgresContainer.stop();
    }
}, 30000); // 30 second timeout for container cleanup

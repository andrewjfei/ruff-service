import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { agent as request } from "supertest";
import { HealthModule } from "../health.module";
import { Server } from "http";
import { Health } from "src/types";

describe("Health Endpoint Intergration Tests", () => {
    let app: INestApplication;

    function getHttpServer(): Server {
        return app.getHttpServer() as Server;
    }

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [HealthModule],
        }).compile();

        app = module.createNestApplication<INestApplication>();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe("GET /health", () => {
        it("should return healthy", async () => {
            const response = await request(getHttpServer())
                .get("/health")
                .expect(200);

            const responseData = response.body as Health;

            expect(responseData).toBeDefined();
            expect(responseData.status).toBe("HEALTHY");
        });
    });
});

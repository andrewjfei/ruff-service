import { Test, TestingModule } from "@nestjs/testing";
import { HttpException, INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthModule } from "../auth.module";
import { PrismaModule } from "../../prisma/prisma.module";
import { PrismaService } from "../../prisma/prisma.service";
import { cleanDatabase } from "../../utils";
import { Response, agent as request } from "supertest";
import { User } from "../../types";
import { Server } from "http";
import { UserBuilder } from "../../test/builders";
import { UserModule } from "../../user/user.module";
import { LoginResponseDto } from "../dto";

describe("Auth Endpoint Integration Tests", () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let userBuilder: UserBuilder;

    function getHttpServer(): Server {
        return app.getHttpServer() as Server;
    }

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AuthModule, UserModule, PrismaModule],
        })
            .overrideProvider(ConfigService)
            .useValue({
                get: jest.fn((key: string) => {
                    if (key === "app.jwtSecret") {
                        return "test-secret-key";
                    }
                    return undefined;
                }),
            })
            .compile();

        app = module.createNestApplication<INestApplication>();
        await app.init();

        prismaService = module.get<PrismaService>(PrismaService);

        // Set up builders
        userBuilder = new UserBuilder(app);
    });

    beforeEach(async () => {
        await cleanDatabase(prismaService);
    });

    afterAll(async () => {
        await prismaService.$disconnect();
        await app.close();
    });

    describe("POST /auth/login", () => {
        it("should login a user successfully", async () => {
            const user: User = await userBuilder.createUser();

            const loginData = {
                email: user.email,
                password: "password",
            };

            const response: Response = await request(getHttpServer())
                .post("/auth/login")
                .send(loginData)
                .expect(200);

            const responseData = response.body as LoginResponseDto;

            expect(responseData).toBeDefined();
            expect(responseData.user.id).toBe(user.id);
            expect(responseData.user.email).toBe(user.email);
            expect(responseData.user.firstName).toBe(user.firstName);
            expect(responseData.user.lastName).toBe(user.lastName);
            expect(responseData.accessToken).toBeDefined();
        });

        it("should return 401 for invalid credentials", async () => {
            const loginData = {
                email: "invalid@ruff.com",
                password: "password",
            };

            const response: Response = await request(getHttpServer())
                .post("/auth/login")
                .send(loginData)
                .expect(401);

            const responseData = response.body as HttpException;

            expect(responseData).toBeDefined();
            expect(responseData.message).toBe("Invalid Credentials");
        });
    });
});

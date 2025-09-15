import { Test, TestingModule } from "@nestjs/testing";
import { HttpException, INestApplication } from "@nestjs/common";
import { UserModule } from "../user.module";
import { PrismaModule } from "../../prisma/prisma.module";
import { PrismaService } from "../../prisma/prisma.service";
import { cleanDatabase } from "../../utils";
import { Response, agent as request } from "supertest";
import { User } from "../../types";
import { Server } from "http";
import { UserBuilder } from "../../test/builders";

describe("User Endpoint Integration Tests", () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let userBuilder: UserBuilder;

    function getHttpServer(): Server {
        return app.getHttpServer() as Server;
    }

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [UserModule, PrismaModule],
        }).compile();

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

    describe("POST /user", () => {
        it("should create a user successfully", async () => {
            const userData = {
                email: "john.doe@ruff.com",
                firstName: "John",
                lastName: "Doe",
            };

            const response: Response = await request(getHttpServer())
                .post("/user")
                .send(userData)
                .expect(201);

            const responseData = response.body as User;

            expect(responseData).toBeDefined();
            expect(responseData.id).toBeDefined();
            expect(responseData.firstName).toBe(userData.firstName);
            expect(responseData.lastName).toBe(userData.lastName);
            expect(responseData.email).toBe(userData.email);
            expect(responseData.homes).toBeDefined();
        });

        it("should return 400 for duplicate email", async () => {
            const user: User = await userBuilder.createUser();

            const response: Response = await request(getHttpServer())
                .post("/user")
                .send({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                })
                .expect(400);

            const responseData = response.body as HttpException;

            expect(responseData.message).toContain(
                `Email ${user.email} is already in use`,
            );
        });
    });

    describe("GET /user/:id", () => {
        it("should retrieve a user by id", async () => {
            const user: User = await userBuilder.createUser();

            const response: Response = await request(getHttpServer())
                .get(`/user/${user.id}`)
                .expect(200);

            const responseData = response.body as User;

            expect(responseData).toBeDefined();
            expect(responseData.id).toBe(user.id);
            expect(responseData.email).toBe(user.email);
            expect(responseData.firstName).toBe(user.firstName);
            expect(responseData.lastName).toBe(user.lastName);
        });

        it("should return 404 for non-existent user", async () => {
            const nonExistentId = "non-existent-id";

            const response: Response = await request(getHttpServer())
                .get(`/user/${nonExistentId}`)
                .expect(404);

            const responseData = response.body as HttpException;

            expect(responseData.message).toContain(
                `User with id ${nonExistentId} does not exist`,
            );
        });
    });

    describe("GET /user", () => {
        it("should retrieve all users", async () => {
            const users: User[] = await Promise.all([
                userBuilder.createUser(),
                userBuilder.createUser(),
            ]);

            const response: Response = await request(getHttpServer())
                .get("/user")
                .expect(200);

            const responseData = response.body as User[];

            expect(responseData).toBeDefined();
            expect(responseData.length).toBe(users.length);
            expect(responseData.map((user: User) => user.id)).toEqual(
                expect.arrayContaining(users.map((user) => user.id)),
            );
        });

        it("should return empty array when no users exist", async () => {
            const response: Response = await request(getHttpServer())
                .get("/user")
                .expect(200);

            const responseData = response.body as User[];

            expect(responseData).toEqual([]);
        });
    });

    describe("PUT /user/:id", () => {
        it("should update a user successfully", async () => {
            const user: User = await userBuilder.createUser();

            const updateUserData = {
                email: "jane.smith@ruff.com",
                firstName: "Jane",
                lastName: "Smith",
            };

            const response: Response = await request(getHttpServer())
                .put(`/user/${user.id}`)
                .send(updateUserData)
                .expect(200);

            const responseData = response.body as User;

            expect(responseData).toBeDefined();
            expect(responseData.id).toBe(user.id);
            expect(responseData.firstName).toBe(updateUserData.firstName);
            expect(responseData.lastName).toBe(updateUserData.lastName);
            expect(responseData.email).toBe(updateUserData.email);
        });
    });

    describe("DELETE /user/:id", () => {
        it("should delete a user successfully", async () => {
            const user: User = await userBuilder.createUser();

            const response: Response = await request(getHttpServer())
                .delete(`/user/${user.id}`)
                .expect(200);

            const responseData = response.body as User;

            expect(responseData).toBeDefined();
            expect(responseData.id).toBe(user.id);
            expect(responseData.firstName).toBe(user.firstName);
            expect(responseData.lastName).toBe(user.lastName);
            expect(responseData.email).toBe(user.email);

            // Verify user is deleted
            const dbUser = await prismaService.user.findUnique({
                where: { id: user.id },
            });

            expect(dbUser).toBeNull();
        });
    });
});

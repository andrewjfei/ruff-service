import { Test, TestingModule } from "@nestjs/testing";
import { HttpException, INestApplication } from "@nestjs/common";
import { HomeModule } from "../home.module";
import { PrismaModule } from "../../prisma/prisma.module";
import { PrismaService } from "../../prisma/prisma.service";
import { cleanDatabase } from "../../utils";
import { Response, agent as request } from "supertest";
import { Home, User } from "../../types";
import { Server } from "http";
import { HomeBuilder, UserBuilder } from "../../test/builders";
import { UserModule } from "../../user/user.module";
import { assertDefined } from "../../utils";
import { HomeService } from "../home.service";

describe("Home Endpoint Integration Tests", () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let homeService: HomeService;
    let userBuilder: UserBuilder;
    let homeBuilder: HomeBuilder;

    function getHttpServer(): Server {
        return app.getHttpServer() as Server;
    }

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [HomeModule, UserModule, PrismaModule],
        }).compile();

        app = module.createNestApplication<INestApplication>();
        await app.init();

        prismaService = module.get<PrismaService>(PrismaService);
        homeService = module.get<HomeService>(HomeService);

        // Set up builders
        userBuilder = new UserBuilder(app);
        homeBuilder = new HomeBuilder(app);
    });

    beforeEach(async () => {
        await cleanDatabase(prismaService);
    });

    afterAll(async () => {
        await prismaService.$disconnect();
        await app.close();
    });

    describe("POST /homes", () => {
        it("should create a home successfully", async () => {
            const user: User = await userBuilder.createUser();

            const homeData = {
                name: `${user.firstName}'s Home`,
                ownerId: user.id,
            };

            const response: Response = await request(getHttpServer())
                .post("/homes")
                .send(homeData)
                .expect(201);

            const responseData = response.body as Home;

            expect(responseData).toBeDefined();
            expect(responseData.id).toBeDefined();
            expect(responseData.name).toBe(homeData.name);
            expect(responseData.ownerId).toBe(user.id);
            expect(responseData.pets).toBeDefined();

            // Verify join record is created
            const dbHome = await prismaService.userHome.findUnique({
                where: {
                    userId_homeId: { userId: user.id, homeId: responseData.id },
                },
            });

            expect(dbHome).toBeDefined();
        });
    });

    describe("GET /homes/:id", () => {
        it("should retrieve a home by id", async () => {
            const user: User = await userBuilder.createUser();
            const home: Home = await homeBuilder.createHome({
                ownerId: user.id,
            });

            const response: Response = await request(getHttpServer())
                .get(`/homes/${home.id}`)
                .expect(200);

            const responseData = response.body as Home;

            expect(responseData).toBeDefined();
            expect(responseData.id).toBe(home.id);
            expect(responseData.name).toBe(home.name);
            expect(responseData.ownerId).toBe(user.id);
            expect(responseData.pets).toBeDefined();
        });

        it("should return 404 for non-existent home", async () => {
            const nonExistentId = "non-existent-id";

            const response: Response = await request(getHttpServer())
                .get(`/homes/${nonExistentId}`)
                .expect(404);

            const responseData = response.body as HttpException;

            expect(responseData.message).toContain(
                `Home with id ${nonExistentId} does not exist`,
            );
        });
    });

    describe("GET /homes", () => {
        it("should retrieve all homes", async () => {
            const user: User = await userBuilder.createUser();

            const homes: Home[] = await Promise.all([
                homeBuilder.createHome({ ownerId: user.id }),
                homeBuilder.createHome({ ownerId: user.id }),
            ]);

            const response: Response = await request(getHttpServer())
                .get("/homes")
                .expect(200);

            const responseData = response.body as Home[];

            expect(responseData).toBeDefined();
            expect(responseData.length).toBe(homes.length);
            expect(responseData.map((home: Home) => home.id)).toEqual(
                expect.arrayContaining(homes.map((home) => home.id)),
            );
        });

        it("should retrieve all homes for a user", async () => {
            const user: User = await userBuilder.createUser();
            const otherUser: User = await userBuilder.createUser();
            const ownedHome: Home = await homeBuilder.createHome({
                ownerId: user.id,
            });
            const nonOwnedHome: Home = await homeBuilder.createHome({
                ownerId: otherUser.id,
            });
            const homes: Home[] = [ownedHome, nonOwnedHome];

            await homeService.addUserToHome(nonOwnedHome.id, user.id);

            const response: Response = await request(getHttpServer())
                .get(`/homes?userId=${user.id}`)
                .expect(200);

            const responseData = response.body as Home[];

            expect(responseData).toBeDefined();
            expect(responseData.length).toBe(homes.length);
            expect(responseData.map((home: Home) => home.id)).toEqual(
                expect.arrayContaining(homes.map((home) => home.id)),
            );
        });

        it("should return empty array when no homes exist", async () => {
            const response: Response = await request(getHttpServer())
                .get("/homes")
                .expect(200);

            const responseData = response.body as Home[];

            expect(responseData).toEqual([]);
        });
    });

    describe("PATCH /homes/:id", () => {
        it("should update a home successfully", async () => {
            const user: User = await userBuilder.createUser();
            const home: Home = await homeBuilder.createHome({
                ownerId: user.id,
            });

            const updateHomeData = {
                name: `${user.firstName}'s Updated Home`,
                ownerId: user.id,
            };

            const response: Response = await request(getHttpServer())
                .patch(`/homes/${home.id}`)
                .send(updateHomeData)
                .expect(200);

            const responseData = response.body as Home;

            expect(responseData).toBeDefined();
            expect(responseData.id).toBe(home.id);
            expect(responseData.name).toBe(updateHomeData.name);
            expect(responseData.ownerId).toBe(user.id);
            expect(responseData.pets).toBeDefined();
        });
    });

    describe("DELETE /homes/:id", () => {
        it("should delete a home successfully", async () => {
            const user: User = await userBuilder.createUser();
            const home: Home = await homeBuilder.createHome({
                ownerId: user.id,
            });

            const response: Response = await request(getHttpServer())
                .delete(`/homes/${home.id}`)
                .expect(200);

            const responseData = response.body as Home;

            expect(responseData).toBeDefined();
            expect(responseData.id).toBe(home.id);
            expect(responseData.name).toBe(home.name);
            expect(responseData.ownerId).toBe(user.id);
            expect(responseData.pets).toBeDefined();

            // Verify home is deleted
            const dbHome = await prismaService.home.findUnique({
                where: { id: home.id },
            });

            expect(dbHome).toBeNull();
        });
    });

    describe("POST /homes/:id/users", () => {
        it("should add a user to a home successfully", async () => {
            const user: User = await userBuilder.createUser();
            const otherUser: User = await userBuilder.createUser();
            const users: User[] = [user, otherUser];
            const home: Home = await homeBuilder.createHome({
                ownerId: otherUser.id,
            });

            // Verify home currently only has the owner as a user
            const dbHomeBeforeAddingUser = assertDefined(
                await prismaService.home.findUnique({
                    where: {
                        id: home.id,
                    },
                    include: {
                        users: true,
                    },
                }),
            );

            expect(dbHomeBeforeAddingUser).toBeDefined();
            expect(dbHomeBeforeAddingUser.users.length).toBe(1);
            expect(dbHomeBeforeAddingUser.users[0].userId).toBe(otherUser.id);

            const response: Response = await request(getHttpServer())
                .post(`/homes/${home.id}/users`)
                .send({ userId: user.id })
                .expect(201);

            expect(response.body).toBeDefined();
            expect(response.body).toEqual({});

            // Verify user is successfully added to home
            const dbHome = assertDefined(
                await prismaService.home.findUnique({
                    where: { id: home.id },
                    include: {
                        users: true,
                    },
                }),
            );

            expect(dbHome).toBeDefined();
            expect(dbHome.users.length).toBe(2);
            expect(dbHome.users.map((user) => user.userId)).toEqual(
                expect.arrayContaining(users.map((user) => user.id)),
            );
        });

        it("should return 400 for adding a user that is already a member of the home", async () => {
            const user: User = await userBuilder.createUser();
            const home: Home = await homeBuilder.createHome({
                ownerId: user.id,
            });

            const response: Response = await request(getHttpServer())
                .post(`/homes/${home.id}/users`)
                .send({ userId: user.id })
                .expect(400);

            const responseData = response.body as HttpException;

            expect(responseData.message).toContain(
                `User ${user.id} is already a member of home ${home.id}`,
            );
        });

        it("should return 400 for non-existent user", async () => {
            const nonExistentUserId = "non-existent-user-id";
            const user: User = await userBuilder.createUser();
            const home: Home = await homeBuilder.createHome({
                ownerId: user.id,
            });

            const response: Response = await request(getHttpServer())
                .post(`/homes/${home.id}/users`)
                .send({ userId: nonExistentUserId })
                .expect(400);

            const responseData = response.body as HttpException;

            expect(responseData.message).toContain(
                `User ${nonExistentUserId} or home ${home.id} does not exist`,
            );
        });

        it("should return 400 for non-existent home", async () => {
            const nonExistentHomeId = "non-existent-home-id";
            const user: User = await userBuilder.createUser();

            const response: Response = await request(getHttpServer())
                .post(`/homes/${nonExistentHomeId}/users`)
                .send({ userId: user.id })
                .expect(400);

            const responseData = response.body as HttpException;

            expect(responseData.message).toContain(
                `User ${user.id} or home ${nonExistentHomeId} does not exist`,
            );
        });
    });
});

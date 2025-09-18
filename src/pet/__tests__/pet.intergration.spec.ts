import { Test, TestingModule } from "@nestjs/testing";
import { HttpException, INestApplication } from "@nestjs/common";
import { PetModule } from "../pet.module";
import { PrismaModule } from "../../prisma/prisma.module";
import { PrismaService } from "../../prisma/prisma.service";
import { cleanDatabase } from "../../utils";
import { Response, agent as request } from "supertest";
import { Home, Pet, User } from "../../types";
import { Server } from "http";
import { HomeBuilder, PetBuilder, UserBuilder } from "../../test/builders";
import { UserModule } from "../../user/user.module";
import { HomeModule } from "../../home/home.module";
import {
    CatBreed,
    DogBreed,
    PetGender,
    PetLogType,
    PetType,
} from "../../constants";
import { HomeService } from "../../home/home.service";
import { PetLog } from "../../../prisma/generated/prisma";
import { PetService } from "../pet.service";

describe("Pet Endpoint Integration Tests", () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let homeService: HomeService;
    let petService: PetService;
    let userBuilder: UserBuilder;
    let homeBuilder: HomeBuilder;
    let petBuilder: PetBuilder;

    function getHttpServer(): Server {
        return app.getHttpServer() as Server;
    }

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [PetModule, HomeModule, UserModule, PrismaModule],
        }).compile();

        app = module.createNestApplication<INestApplication>();
        await app.init();

        prismaService = module.get<PrismaService>(PrismaService);
        homeService = module.get<HomeService>(HomeService);
        petService = module.get<PetService>(PetService);

        // Set up builders
        userBuilder = new UserBuilder(app);
        homeBuilder = new HomeBuilder(app);
        petBuilder = new PetBuilder(app);
    });

    beforeEach(async () => {
        await cleanDatabase(prismaService);
    });

    afterAll(async () => {
        await prismaService.$disconnect();
        await app.close();
    });

    describe("GET /pets/types", () => {
        it("should retrieve all pet types", async () => {
            const response: Response = await request(getHttpServer())
                .get("/pets/types")
                .expect(200);

            const responseData = response.body as string[];

            expect(responseData).toBeDefined();
            expect(responseData.length).toBe(Object.values(PetType).length);
            expect(responseData).toEqual(
                expect.arrayContaining(Object.values(PetType)),
            );
        });
    });

    describe("GET /pets/genders", () => {
        it("should retrieve all pet genders", async () => {
            const response: Response = await request(getHttpServer())
                .get("/pets/genders")
                .expect(200);

            const responseData = response.body as string[];

            expect(responseData).toBeDefined();
            expect(responseData.length).toBe(Object.values(PetGender).length);
            expect(responseData).toEqual(
                expect.arrayContaining(Object.values(PetGender)),
            );
        });
    });

    describe("GET /pets/breeds", () => {
        it("should retrieve all pet breeds", async () => {
            const response: Response = await request(getHttpServer())
                .get("/pets/breeds")
                .expect(200);

            const responseData = response.body as string[];

            expect(responseData).toBeDefined();
            expect(responseData.length).toBe(Object.values(DogBreed).length);
            expect(responseData).toEqual(
                expect.arrayContaining(Object.values(DogBreed)),
            );
        });

        it("should retrieve all pet breeds for a given type", async () => {
            const response: Response = await request(getHttpServer())
                .get("/pets/breeds")
                .query({ type: "cat" })
                .expect(200);

            const responseData = response.body as string[];

            expect(responseData).toBeDefined();
            expect(responseData.length).toBe(Object.values(CatBreed).length);
            expect(responseData).toEqual(
                expect.arrayContaining(Object.values(CatBreed)),
            );
        });
    });

    describe("GET /pets/logs/types", () => {
        it("should retrieve all pet log types", async () => {
            const response: Response = await request(getHttpServer())
                .get("/pets/logs/types")
                .expect(200);

            const responseData = response.body as string[];

            expect(responseData).toBeDefined();
            expect(responseData.length).toBe(Object.values(PetLogType).length);
            expect(responseData).toEqual(
                expect.arrayContaining(Object.values(PetLogType)),
            );
        });
    });

    describe("POST /pets/:id/logs", () => {
        it("should create a pet log successfully", async () => {
            const user: User = await userBuilder.createUser();
            const home: Home = await homeBuilder.createHome({
                ownerId: user.id,
            });
            const pet: Pet = await petBuilder.createPet({ homeId: home.id });

            const petLogData = {
                type: PetLogType.WALK,
                title: "Morning Walk",
                description: "Walk around Victoria Park",
                occurredAt: new Date().toISOString(),
            };

            const response: Response = await request(getHttpServer())
                .post(`/pets/${pet.id}/logs`)
                .send(petLogData)
                .expect(201);

            const responseData = response.body as PetLog;

            expect(responseData).toBeDefined();
            expect(responseData.id).toBeDefined();
            expect(responseData.type).toBe(petLogData.type);
            expect(responseData.title).toBe(petLogData.title);
            expect(responseData.description).toBe(petLogData.description);
            expect(responseData.occurredAt).toBe(petLogData.occurredAt);
            expect(responseData.petId).toBe(pet.id);
        });

        it("should return 404 for non-existent pet", async () => {
            const nonExistentId = "non-existent-id";

            const petLogData = {
                type: PetLogType.WALK,
                title: "Morning Walk",
                description: "Walk around Victoria Park",
                occurredAt: new Date().toISOString(),
            };

            const response: Response = await request(getHttpServer())
                .post(`/pets/${nonExistentId}/logs`)
                .send(petLogData)
                .expect(404);

            const responseData = response.body as HttpException;

            expect(responseData.message).toContain(
                `Pet with id ${nonExistentId} does not exist`,
            );
        });
    });

    describe("GET /pets/:id/logs", () => {
        it("should retrieve all pet logs for a pet", async () => {
            const date = new Date();
            const user: User = await userBuilder.createUser();
            const home: Home = await homeBuilder.createHome({
                ownerId: user.id,
            });
            const pet: Pet = await petBuilder.createPet({ homeId: home.id });

            const petLogWalk: PetLog = await petService.createPetLog(pet.id, {
                type: PetLogType.WALK,
                title: "Morning Walk",
                description: "Walk around Victoria Park",
                occurredAt: date,
            });

            const petLogFood: PetLog = await petService.createPetLog(pet.id, {
                type: PetLogType.FOOD,
                title: "Breakfast",
                occurredAt: new Date(date.setMinutes(date.getMinutes() - 30)),
            });

            const response: Response = await request(getHttpServer())
                .get(`/pets/${pet.id}/logs`)
                .expect(200);

            const responseData = response.body as PetLog[];

            expect(responseData).toBeDefined();
            expect(responseData.length).toBe(2);

            // Validate that the order of the logs is correct, should be in descending order of when the log occurred
            expect(responseData.map((petLog: PetLog) => petLog.id)).toEqual([
                petLogWalk.id,
                petLogFood.id,
            ]);
        });
    });

    describe("GET /pets/logs", () => {
        it("should retrieve all pet logs for a user", async () => {
            const date = new Date();

            const user: User = await userBuilder.createUser();
            const otherUser: User = await userBuilder.createUser();

            const home: Home = await homeBuilder.createHome({
                ownerId: user.id,
            });
            const otherHome: Home = await homeBuilder.createHome({
                ownerId: otherUser.id,
            });

            const pet: Pet = await petBuilder.createPet({ homeId: home.id });
            const otherPet: Pet = await petBuilder.createPet({
                homeId: otherHome.id,
            });

            const petLogWalk: PetLog = await petService.createPetLog(pet.id, {
                type: PetLogType.WALK,
                title: "Morning Walk",
                description: "Walk around Victoria Park",
                occurredAt: date,
            });
            const petLogFood: PetLog = await petService.createPetLog(pet.id, {
                type: PetLogType.FOOD,
                title: "Breakfast",
                occurredAt: new Date(date.setMinutes(date.getMinutes() - 30)),
            });
            const petLogMedication: PetLog = await petService.createPetLog(
                pet.id,
                {
                    type: PetLogType.MEDICATION,
                    title: "Medication",
                    description: "Give medication to pet",
                    occurredAt: new Date(
                        date.setMinutes(date.getMinutes() - 60),
                    ),
                },
            );
            const petLogs: PetLog[] = [
                petLogWalk,
                petLogFood,
                petLogMedication,
            ];

            const otherPetLogWalk: PetLog = await petService.createPetLog(
                otherPet.id,
                {
                    type: PetLogType.WALK,
                    title: "Morning Walk",
                    description: "Walk around Victoria Park",
                    occurredAt: date,
                },
            );
            const otherPetLogFood: PetLog = await petService.createPetLog(
                otherPet.id,
                {
                    type: PetLogType.FOOD,
                    title: "Breakfast",
                    occurredAt: new Date(
                        date.setMinutes(date.getMinutes() - 30),
                    ),
                },
            );
            const otherPetLogs: PetLog[] = [otherPetLogWalk, otherPetLogFood];
            const allPetLogs: PetLog[] = [...petLogs, ...otherPetLogs];

            homeService.addUserToHome(otherHome.id, user.id);

            const response: Response = await request(getHttpServer())
                .get("/pets/logs")
                .query({ userId: user.id })
                .expect(200);

            const responseData = response.body as PetLog[];

            expect(responseData).toBeDefined();
            expect(responseData.length).toBe(allPetLogs.length);
            expect(responseData.map((petLog: PetLog) => petLog.id)).toEqual(
                expect.arrayContaining(allPetLogs.map((petLog) => petLog.id)),
            );

            const otherResponse: Response = await request(getHttpServer())
                .get("/pets/logs")
                .query({ userId: otherUser.id })
                .expect(200);

            const otherResponseData = otherResponse.body as PetLog[];

            expect(otherResponseData).toBeDefined();
            expect(otherResponseData.length).toBe(otherPetLogs.length);
            expect(
                otherResponseData.map((petLog: PetLog) => petLog.id),
            ).toEqual(
                expect.arrayContaining(otherPetLogs.map((petLog) => petLog.id)),
            );
        });
    });

    describe("POST /pets", () => {
        it("should create a pet successfully", async () => {
            const user: User = await userBuilder.createUser();
            const home: Home = await homeBuilder.createHome({
                ownerId: user.id,
            });

            const petData = {
                name: "Rusty",
                type: "Dog",
                gender: "Male",
                dob: new Date().toISOString(),
                breed: "Labrador",
                homeId: home.id,
            };

            const response: Response = await request(getHttpServer())
                .post("/pets")
                .send(petData)
                .expect(201);

            const responseData = response.body as Pet;

            expect(responseData).toBeDefined();
            expect(responseData.id).toBeDefined();
            expect(responseData.name).toBe(petData.name);
            expect(responseData.type).toBe(petData.type);
            expect(responseData.gender).toBe(petData.gender);
            expect(responseData.dob).toBe(petData.dob);
            expect(responseData.breed).toBe(petData.breed);
            expect(responseData.homeId).toBe(home.id);
        });
    });

    describe("GET /pets/:id", () => {
        it("should retrieve a pet by id", async () => {
            const user: User = await userBuilder.createUser();
            const home: Home = await homeBuilder.createHome({
                ownerId: user.id,
            });
            const pet: Pet = await petBuilder.createPet({ homeId: home.id });

            const response: Response = await request(getHttpServer())
                .get(`/pets/${pet.id}`)
                .expect(200);

            const responseData = response.body as Pet;

            expect(responseData).toBeDefined();
            expect(responseData.id).toBe(pet.id);
            expect(responseData.name).toBe(pet.name);
            expect(responseData.type).toBe(pet.type);
            expect(responseData.gender).toBe(pet.gender);
            expect(responseData.dob).toBe(pet.dob.toISOString());
            expect(responseData.breed).toBe(pet.breed);
            expect(responseData.homeId).toBe(home.id);
        });

        it("should return 404 for non-existent pet", async () => {
            const nonExistentId = "non-existent-id";

            const response: Response = await request(getHttpServer())
                .get(`/pets/${nonExistentId}`)
                .expect(404);

            const responseData = response.body as HttpException;

            expect(responseData.message).toContain(
                `Pet with id ${nonExistentId} does not exist`,
            );
        });
    });

    describe("GET /pets", () => {
        it("should retrieve all pets", async () => {
            const user: User = await userBuilder.createUser();
            const home: Home = await homeBuilder.createHome({
                ownerId: user.id,
            });

            const pets: Pet[] = await Promise.all([
                petBuilder.createPet({ homeId: home.id }),
                petBuilder.createPet({ homeId: home.id }),
            ]);

            const response: Response = await request(getHttpServer())
                .get("/pets")
                .expect(200);

            const responseData = response.body as Pet[];

            expect(responseData).toBeDefined();
            expect(responseData.length).toBe(pets.length);
            expect(responseData.map((pet: Pet) => pet.id)).toEqual(
                expect.arrayContaining(pets.map((pet) => pet.id)),
            );
        });

        it("should retrieve all pets for a user", async () => {
            const user: User = await userBuilder.createUser();
            const otherUser: User = await userBuilder.createUser();
            const ownedHome: Home = await homeBuilder.createHome({
                ownerId: user.id,
            });
            const nonOwnedHome: Home = await homeBuilder.createHome({
                ownerId: otherUser.id,
            });
            const pets: Pet[] = await Promise.all([
                petBuilder.createPet({ homeId: ownedHome.id }),
                petBuilder.createPet({ homeId: nonOwnedHome.id }),
            ]);

            await homeService.addUserToHome(nonOwnedHome.id, user.id);

            const response: Response = await request(getHttpServer())
                .get(`/pets?userId=${user.id}`)
                .expect(200);

            const responseData = response.body as Pet[];

            expect(responseData).toBeDefined();
            expect(responseData.length).toBe(pets.length);
            expect(responseData.map((pet: Pet) => pet.id)).toEqual(
                expect.arrayContaining(pets.map((pet) => pet.id)),
            );
        });

        it("should return empty array when no pets exist", async () => {
            const response: Response = await request(getHttpServer())
                .get("/pets")
                .expect(200);

            const responseData = response.body as Pet[];

            expect(responseData).toEqual([]);
        });
    });

    describe("PATCH /pets/:id", () => {
        it("should update a pet successfully", async () => {
            const user: User = await userBuilder.createUser();
            const home: Home = await homeBuilder.createHome({
                ownerId: user.id,
            });
            const pet: Pet = await petBuilder.createPet({ homeId: home.id });

            const updatePetData = {
                name: "Blue",
                type: "Dog",
                gender: "Female",
                dob: new Date().toISOString(),
                breed: "Maltese",
            };

            const response: Response = await request(getHttpServer())
                .patch(`/pets/${pet.id}`)
                .send(updatePetData)
                .expect(200);

            const responseData = response.body as Pet;

            expect(responseData).toBeDefined();
            expect(responseData.id).toBe(pet.id);
            expect(responseData.name).toBe(updatePetData.name);
            expect(responseData.type).toBe(updatePetData.type);
            expect(responseData.gender).toBe(updatePetData.gender);
            expect(responseData.dob).toBe(updatePetData.dob);
            expect(responseData.breed).toBe(updatePetData.breed);
            expect(responseData.homeId).toBe(home.id);
        });
    });

    describe("DELETE /pets/:id", () => {
        it("should delete a pet successfully", async () => {
            const user: User = await userBuilder.createUser();
            const home: Home = await homeBuilder.createHome({
                ownerId: user.id,
            });
            const pet: Pet = await petBuilder.createPet({ homeId: home.id });

            const response: Response = await request(getHttpServer())
                .delete(`/pets/${pet.id}`)
                .expect(200);

            const responseData = response.body as Pet;

            expect(responseData).toBeDefined();
            expect(responseData.id).toBe(pet.id);
            expect(responseData.name).toBe(pet.name);
            expect(responseData.type).toBe(pet.type);
            expect(responseData.gender).toBe(pet.gender);
            expect(responseData.dob).toBe(pet.dob.toISOString());
            expect(responseData.breed).toBe(pet.breed);
            expect(responseData.homeId).toBe(home.id);

            // Verify pet is deleted
            const dbPet = await prismaService.pet.findUnique({
                where: { id: pet.id },
            });

            expect(dbPet).toBeNull();
        });
    });
});

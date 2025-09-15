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
import { CatBreed, DogBreed, PetGender, PetType } from "../../constants";

describe("Pet Endpoint Integration Tests", () => {
    let app: INestApplication;
    let prismaService: PrismaService;
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

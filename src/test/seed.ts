import { Home, Pet, PrismaClient, User } from "../../prisma/generated/prisma";
import { faker } from "@faker-js/faker";
import { DogBreed, PetGender, PetType } from "../constants";

const prisma = new PrismaClient();

async function clearData() {
    await prisma.pet.deleteMany();
    await prisma.home.deleteMany();
    await prisma.user.deleteMany();

    console.log("All data cleared successfully");
}

async function createUsers() {
    const users: User[] = await Promise.all(
        Array.from({ length: 3 }).map(async () => {
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@ruff.com`;

            return prisma.user.create({
                data: {
                    firstName,
                    lastName,
                    email,
                },
            });
        }),
    );

    console.log("Users created successfully");
    return users;
}

async function createHomes(users: User[]) {
    const homes: Home[] = await Promise.all(
        users.map(async (user: User) => {
            const name = faker.location.street();

            return prisma.home.create({
                data: {
                    name,
                    ownerId: user.id,
                },
            });
        }),
    );

    console.log("Homes created successfully");
    return homes;
}

async function createPets(homes: Home[]) {
    const pets: Pet[] = await Promise.all(
        homes.map(async (home: Home) => {
            const name = faker.person.firstName();
            const type = faker.helpers.arrayElement(Object.values(PetType));
            const gender = faker.helpers.arrayElement(Object.values(PetGender));
            const dob = faker.date.past();
            const breed = faker.helpers.arrayElement(Object.values(DogBreed));

            return prisma.pet.create({
                data: {
                    name,
                    type,
                    gender,
                    dob,
                    breed,
                    homeId: home.id,
                },
            });
        }),
    );

    console.log("Pets created successfully");
    return pets;
}

async function main() {
    // Delete all table records
    await clearData();

    // Create seed data for each table
    const users: User[] = await createUsers();
    const homes: Home[] = await createHomes(users);
    await createPets(homes);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (error) => {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    });

import { Home, Pet, PrismaClient, User } from "../../prisma/generated/prisma";
import { faker } from "@faker-js/faker";
import { DogBreed, PetGender, PetLogType, PetType } from "../constants";

const petLogTitles = [
    "Morning Walk",
    "Breakfast",
    "Lunch",
    "Dinner",
    "Evening Walk",
    "Grooming",
    "Vaccination",
    "Medication",
    "Training",
    "Greenie",
    "Chicken Stick",
    "Dog Park",
    "Other",
];

const prisma = new PrismaClient();

const clearData = async (): Promise<void> => {
    await prisma.pet.deleteMany();
    await prisma.home.deleteMany();
    await prisma.user.deleteMany();

    console.log("All data cleared successfully");
};

const createUsers = async (): Promise<User[]> => {
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
};

const createHomes = async (users: User[]): Promise<Home[]> => {
    const homes: Home[] = await Promise.all(
        users.map(async (user: User) => {
            const name = faker.location.street();

            return await prisma.$transaction(async (tx) => {
                const home = await tx.home.create({
                    data: {
                        name,
                        ownerId: user.id,
                    },
                });

                await tx.userHome.create({
                    data: {
                        userId: user.id,
                        homeId: home.id,
                    },
                });

                return home;
            });
        }),
    );

    console.log("Homes created successfully");
    return homes;
};

const createPets = async (homes: Home[]): Promise<Pet[]> => {
    const pets: Pet[] = await Promise.all(
        homes.map(async (home: Home) => {
            const name = faker.person.firstName();
            const type = faker.helpers.arrayElement(Object.values(PetType));
            const gender = faker.helpers.arrayElement(Object.values(PetGender));
            const dob = faker.date.past();
            const breed = faker.helpers.arrayElement(Object.values(DogBreed));

            return prisma.$transaction(async (tx) => {
                const pet = await tx.pet.create({
                    data: {
                        name,
                        type,
                        gender,
                        dob,
                        breed,
                        homeId: home.id,
                    },
                });

                await Promise.all(
                    Array.from({ length: 5 }).map(async () => {
                        await tx.petLog.create({
                            data: {
                                petId: pet.id,
                                type: faker.helpers.arrayElement(
                                    Object.values(PetLogType),
                                ),
                                title: faker.helpers.arrayElement(petLogTitles),
                                occurredAt: faker.date.past(),
                            },
                        });
                    }),
                );

                return pet;
            });
        }),
    );

    console.log("Pets created successfully");
    return pets;
};

const addUserToHomes = async (user: User, homes: Home[]): Promise<void> => {
    await Promise.all(
        homes.map(async (home: Home) => {
            await prisma.userHome.create({
                data: { userId: user.id, homeId: home.id },
            });
        }),
    );
};

async function main() {
    // Delete all table records
    await clearData();

    // Create seed data for each table
    const users: User[] = await createUsers();
    const homes: Home[] = await createHomes(users);
    await createPets(homes);

    // Add first user to all other homes
    await addUserToHomes(users[0], homes.slice(1));
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

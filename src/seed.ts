import { Home, PrismaClient, User } from "prisma/generated/prisma";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

const userData = [
    {
        id: uuidv4(),
        email: "alice.smith@ruff.com",
        firstName: "Alice",
        lastName: "Smith",
    },
    {
        id: uuidv4(),
        email: "bob.johnson@ruff.com",
        firstName: "Bob",
        lastName: "Johnson",
    },
    {
        id: uuidv4(),
        email: "charlie.brown@ruff.com",
        firstName: "Charlie",
        lastName: "Brown",
    },
];

const homeData = [
    {
        id: uuidv4(),
        name: "Sunshine Villa",
    },
    {
        id: uuidv4(),
        name: "Moonlight Manor",
    },
    {
        id: uuidv4(),
        name: "Golden Acres",
    },
];

async function clearData() {
    await prisma.pet.deleteMany();
    await prisma.home.deleteMany();
    await prisma.user.deleteMany();

    console.log("All data cleared successfully");
}

async function createUsers() {
    const users: User[] = await Promise.all(
        userData.map(async (user) => {
            return prisma.user.create({
                data: user,
            });
        }),
    );

    console.log("Users created successfully");
    return users;
}

async function createHomes() {
    const homes: Home[] = await Promise.all(
        homeData.map(async (home, index) => {
            return prisma.home.create({
                data: {
                    ...home,
                    ownerId: userData[index].id,
                },
            });
        }),
    );

    console.log("Homes created successfully");
    return homes;
}

async function main() {
    // delete all table records
    await clearData();

    // create seed data for each table
    await createUsers();
    await createHomes();
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

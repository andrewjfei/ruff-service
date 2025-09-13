import { PrismaService } from "src/prisma/prisma.service";

export async function cleanDatabase(prisma: PrismaService) {
    await prisma.pet.deleteMany();
    await prisma.home.deleteMany();
    await prisma.user.deleteMany();
}

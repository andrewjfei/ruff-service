import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Home, Prisma } from "src/../prisma/generated/prisma";

@Injectable()
export class HomeService {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: Prisma.HomeCreateInput): Promise<Home> {
        return this.prisma.home.create({
            data,
        });
    }

    async retrieve(id: string): Promise<Home | null> {
        return this.prisma.home.findUnique({
            where: { id },
        });
    }

    async retrieveAll(): Promise<Home[]> {
        return this.prisma.home.findMany();
    }

    async update(id: string, data: Prisma.HomeUpdateInput): Promise<Home> {
        return this.prisma.home.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<Home> {
        return this.prisma.home.delete({
            where: { id },
        });
    }

    async addPet(
        id: Prisma.HomeWhereUniqueInput,
        petId: Prisma.PetWhereUniqueInput,
    ): Promise<Home> {
        return this.prisma.home.update({
            where: id,
            data: {
                pets: { connect: { id: petId.id } },
            },
        });
    }
}

import { Injectable } from "@nestjs/common";
import { Pet, Prisma } from "src/../prisma/generated/prisma";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class PetService {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: Prisma.PetCreateInput): Promise<Pet> {
        return this.prisma.pet.create({
            data,
        });
    }

    async retrieve(id: Prisma.PetWhereUniqueInput): Promise<Pet | null> {
        return this.prisma.pet.findUnique({
            where: id,
        });
    }

    async retrieveAll(): Promise<Pet[]> {
        return this.prisma.pet.findMany();
    }

    async update(
        id: Prisma.PetWhereUniqueInput,
        data: Prisma.PetUpdateInput,
    ): Promise<Pet> {
        return this.prisma.pet.update({
            where: id,
            data,
        });
    }

    async delete(id: Prisma.PetWhereUniqueInput): Promise<Pet> {
        return this.prisma.pet.delete({
            where: id,
        });
    }
}

import { Injectable } from "@nestjs/common";
import { Prisma, User } from "generated/prisma";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    async retrieveUser(id: Prisma.UserWhereUniqueInput): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: id,
        });
    }

    async retrieveAllUsers(): Promise<User[]> {
        return this.prisma.user.findMany();
    }

    async createUser(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({
            data,
        });
    }

    async updateUser(
        id: Prisma.UserWhereUniqueInput,
        data: Prisma.UserUpdateInput,
    ): Promise<User> {
        return this.prisma.user.update({
            where: id,
            data,
        });
    }

    async deleteUser(id: Prisma.UserWhereUniqueInput): Promise<User> {
        return this.prisma.user.delete({
            where: id,
        });
    }
}

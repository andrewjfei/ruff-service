import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import { Prisma, User } from "src/../prisma/generated/prisma";
import { PrismaErrorCode } from "src/constants";
import { PrismaService } from "src/prisma/prisma.service";
import { HomeCreateData } from "src/types";
import { assertDefined } from "src/utils";

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(private readonly prisma: PrismaService) {}

    /**
     * Create a new user.
     * @param data - The data to create the user with.
     * @returns The created user.
     */
    async create(data: Prisma.UserCreateInput): Promise<User> {
        try {
            return await this.prisma.user.create({
                data,
                include: {
                    homes: true,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (
                    error.code === PrismaErrorCode.UNIQUE_CONSTRAINT_VIOLATION
                ) {
                    throw new BadRequestException(
                        `Email ${data.email} is already in use`,
                    );
                }
            }

            if (error instanceof Error) {
                throw new InternalServerErrorException(
                    `Failed to create user: ${error.message}`,
                );
            }

            throw new InternalServerErrorException(error);
        }
    }

    /**
     * Retrieve a user by their id.
     * @param id - The id of the user to retrieve.
     * @returns The retrieved user.
     */
    async retrieve(id: string): Promise<User> {
        try {
            const user = assertDefined(
                await this.prisma.user.findUnique({
                    where: { id },
                    include: {
                        homes: true,
                    },
                }),
            );

            return user;
        } catch {
            throw new NotFoundException(`User with id ${id} does not exist`);
        }
    }

    /**
     * Retrieve all users.
     * @returns All users.
     */
    async retrieveAll(): Promise<User[]> {
        return this.prisma.user.findMany({
            orderBy: {
                firstName: "asc",
            },
            include: {
                homes: true,
            },
        });
    }

    /**
     * Update a user by their id.
     * @param id - The id of the user to update.
     * @param data - The data to update the user with.
     * @returns The updated user.
     */
    async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        return this.prisma.user.update({
            where: { id },
            data,
            include: {
                homes: true,
            },
        });
    }

    /**
     * Delete a user by their id.
     * @param id - The id of the user to delete.
     * @returns The deleted user.
     */
    async delete(id: string): Promise<User> {
        return this.prisma.user.delete({
            where: { id },
        });
    }

    /**
     * Add a home for a user by their id.
     * @param id - The id of the user to add the home to.
     * @param data - The data to add the home with.
     * @returns The user with the added home.
     */
    async addHome(id: string, data: HomeCreateData): Promise<User> {
        return await this.prisma.user.update({
            where: { id },
            data: {
                homes: { create: data },
            },
            include: {
                homes: true,
            },
        });
    }
}

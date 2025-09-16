import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "../../prisma/generated/prisma";
import { assertDefined } from "../utils";
import { Home } from "../types";
import { CreateHomeDto, GetHomesDto, UpdateHomeDto } from "./dto";
import { PrismaErrorCode } from "../constants";

@Injectable()
export class HomeService {
    private readonly logger = new Logger(HomeService.name);

    constructor(private readonly prisma: PrismaService) {}

    /**
     * Create a new home.
     * @param data - The data to create the home with.
     * @returns The created home.
     */
    async create(data: CreateHomeDto): Promise<Home> {
        try {
            return await this.prisma.$transaction(async (tx) => {
                const home = await tx.home.create({
                    data,
                    include: {
                        pets: true,
                    },
                });

                // Also create the UserHome join table entry
                await tx.userHome.create({
                    data: {
                        userId: data.ownerId,
                        homeId: home.id,
                    },
                });

                return home;
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (
                    error.code ===
                    PrismaErrorCode.FOREIGN_KEY_CONSTRAINT_VIOLATION
                ) {
                    throw new BadRequestException(
                        `Owner id ${data.ownerId} does not exist`,
                    );
                }
            }

            if (error instanceof Error) {
                throw new InternalServerErrorException(
                    `Failed to create home: ${error.message}`,
                );
            }

            throw new InternalServerErrorException(error);
        }
    }

    /**
     * Retrieve a home by their id.
     * @param id - The id of the home to retrieve.
     * @returns The retrieved home.
     */
    async retrieve(id: string): Promise<Home> {
        try {
            const home = assertDefined(
                await this.prisma.home.findUnique({
                    where: { id },
                    include: {
                        pets: true,
                    },
                }),
            );

            return home;
        } catch {
            throw new NotFoundException(`Home with id ${id} does not exist`);
        }
    }

    /**
     * Retrieve all homes.
     * @returns The retrieved homes.
     */
    async retrieveAll(data: GetHomesDto): Promise<Home[]> {
        const where = data.userId
            ? {
                  users: {
                      some: {
                          userId: data.userId,
                      },
                  },
              }
            : {};

        return this.prisma.home.findMany({
            where,
            include: {
                pets: true,
            },
        });
    }

    /**
     * Add a user to a home.
     * @param homeId - The id of the home.
     * @param userId - The id of the user to add.
     */
    async addUserToHome(homeId: string, userId: string): Promise<void> {
        try {
            await this.prisma.userHome.create({
                data: {
                    userId,
                    homeId,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (
                    error.code === PrismaErrorCode.UNIQUE_CONSTRAINT_VIOLATION
                ) {
                    throw new BadRequestException(
                        `User ${userId} is already a member of home ${homeId}`,
                    );
                }
                if (
                    error.code ===
                    PrismaErrorCode.FOREIGN_KEY_CONSTRAINT_VIOLATION
                ) {
                    throw new BadRequestException(
                        `User ${userId} or home ${homeId} does not exist`,
                    );
                }
            }

            if (error instanceof Error) {
                throw new InternalServerErrorException(
                    `Failed to add user to home: ${error.message}`,
                );
            }

            throw new InternalServerErrorException(error);
        }
    }

    /**
     * Update a home by their id.
     * @param id - The id of the home to update.
     * @param data - The data to update the home with.
     * @returns The updated home.
     */
    async update(id: string, data: UpdateHomeDto): Promise<Home> {
        return this.prisma.home.update({
            where: { id },
            data,
            include: {
                pets: true,
            },
        });
    }

    /**
     * Delete a home by their id.
     * @param id - The id of the home to delete.
     * @returns The deleted home.
     */
    async delete(id: string): Promise<Home> {
        return this.prisma.home.delete({
            where: { id },
            include: {
                pets: true,
            },
        });
    }
}

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
import { CreateHomeDto, UpdateHomeDto } from "./dto";
import { PrismaErrorCode } from "../constants";

@Injectable()
export class HomeService {
    private readonly logger = new Logger(HomeService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Create a new home.
     * @param data - The data to create the home with.
     * @returns The created home.
     */
    async create(data: CreateHomeDto): Promise<Home> {
        try {
            return await this.prisma.home.create({
                data,
                include: {
                    pets: true,
                },
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
    async retrieveAll(): Promise<Home[]> {
        return this.prisma.home.findMany({
            include: {
                pets: true,
            },
        });
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

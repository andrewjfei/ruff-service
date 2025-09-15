import {
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import { Pet, Prisma } from "prisma/generated/prisma";
import { PrismaService } from "../prisma/prisma.service";
import { assertDefined } from "../utils";

@Injectable()
export class PetService {
    private readonly logger = new Logger(PetService.name);

    constructor(private readonly prisma: PrismaService) {}

    /**
     * Create a new pet.
     * @param data - The data to create the pet with.
     * @returns The created pet.
     */
    async create(data: Prisma.PetCreateInput): Promise<Pet> {
        try {
            return await this.prisma.pet.create({
                data,
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new InternalServerErrorException(
                    `Failed to create pet: ${error.message}`,
                );
            }

            throw new InternalServerErrorException(error);
        }
    }

    /**
     * Retrieve a pet by their id.
     * @param id - The id of the pet to retrieve.
     * @returns The retrieved pet.
     */
    async retrieve(id: string): Promise<Pet> {
        try {
            const pet = assertDefined(
                await this.prisma.pet.findUnique({
                    where: { id },
                }),
            );

            return pet;
        } catch {
            throw new NotFoundException(`Pet with id ${id} does not exist`);
        }
    }

    /**
     * Retrieve all pets.
     * @returns The retrieved pets.
     */
    async retrieveAll(): Promise<Pet[]> {
        return this.prisma.pet.findMany();
    }

    /**
     * Update a pet by their id.
     * @param id - The id of the pet to update.
     * @param data - The data to update the pet with.
     * @returns The updated pet.
     */
    async update(id: string, data: Prisma.PetUpdateInput): Promise<Pet> {
        return this.prisma.pet.update({
            where: { id },
            data,
        });
    }

    /**
     * Delete a pet by their id.
     * @param id - The id of the pet to delete.
     * @returns The deleted pet.
     */
    async delete(id: string): Promise<Pet> {
        return this.prisma.pet.delete({
            where: { id },
        });
    }
}

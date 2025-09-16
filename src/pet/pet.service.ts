import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import { Pet, Prisma } from "../../prisma/generated/prisma";
import { PrismaService } from "../prisma/prisma.service";
import { assertDefined } from "../utils";
import { CreatePetDto, GetPetsDto, UpdatePetDto } from "./dto";
import {
    CatBreed,
    DogBreed,
    PetGender,
    PetType,
    PrismaErrorCode,
} from "../constants";

@Injectable()
export class PetService {
    private readonly logger = new Logger(PetService.name);

    constructor(private readonly prisma: PrismaService) {}

    /**
     * Create a new pet.
     * @param data - The data to create the pet with.
     * @returns The created pet.
     */
    async create(data: CreatePetDto): Promise<Pet> {
        try {
            return await this.prisma.pet.create({
                data,
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (
                    error.code ===
                    PrismaErrorCode.FOREIGN_KEY_CONSTRAINT_VIOLATION
                ) {
                    throw new BadRequestException(
                        `Home id ${data.homeId} does not exist`,
                    );
                }
            }

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
     * @param data - Filtering options.
     * @returns The retrieved pets.
     */
    async retrieveAll(data: GetPetsDto): Promise<Pet[]> {
        const where = data.userId
            ? {
                  home: {
                      users: {
                          some: {
                              userId: data.userId,
                          },
                      },
                  },
              }
            : {};

        return this.prisma.pet.findMany({ where });
    }

    /**
     * Update a pet by their id.
     * @param id - The id of the pet to update.
     * @param data - The data to update the pet with.
     * @returns The updated pet.
     */
    async update(id: string, data: UpdatePetDto): Promise<Pet> {
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

    /**
     * Retrieve all pet types.
     * @returns The retrieved pet types.
     */
    retrievePetTypes(): string[] {
        return Object.values(PetType);
    }

    /**
     * Retrieve all pet genders.
     * @returns The retrieved pet genders.
     */
    retrievePetGenders(): string[] {
        return Object.values(PetGender);
    }

    /**
     * Retrieve all pet breeds given the type.
     * @param type - The type of pet to retrieve breeds for.
     * @returns The retrieved pet breeds.
     */
    retrievePetBreeds(type: string = PetType.DOG): string[] {
        switch (type.toLocaleLowerCase()) {
            case PetType.CAT.toLocaleLowerCase():
                return Object.values(CatBreed);
            default:
                return Object.values(DogBreed);
        }
    }
}

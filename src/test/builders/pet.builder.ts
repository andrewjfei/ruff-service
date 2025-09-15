import { Prisma } from "prisma/generated/prisma";
import { Pet } from "../../types";
import { BaseBuilder } from "./base.builder";
import { faker } from "@faker-js/faker";
import { PetService } from "../../pet/pet.service";

/**
 * Home builder class for integration tests.
 * Set up once in beforeAll, then use createHome method in tests.
 */
export class PetBuilder extends BaseBuilder {
    private get petService(): PetService {
        return this.getService<PetService>(PetService);
    }

    /**
     * Creates a home in the database allowing partial overrides.
     * @param overrides - Partial home data to override defaults.
     * @returns The created home.
     */
    async createPet(
        overrides: Partial<Omit<Prisma.PetCreateInput, "home">> & {
            homeId: string;
        },
    ): Promise<Pet> {
        const name = faker.person.firstName();
        const type = "Dog";
        const gender = faker.person.gender();
        const dob = faker.date.past();
        const breed = faker.animal.dog();
        const homeId = overrides.homeId;

        const petData: Prisma.PetCreateInput = {
            name,
            type,
            gender,
            dob,
            breed,
            home: {
                connect: {
                    id: homeId,
                },
            },
        };

        return await this.petService.create(petData);
    }
}

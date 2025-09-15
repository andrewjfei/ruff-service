import { Pet } from "../../types";
import { BaseBuilder } from "./base.builder";
import { faker } from "@faker-js/faker";
import { PetService } from "../../pet/pet.service";
import { CreatePetDto } from "../../pet/dto";
import { CatBreed, DogBreed, PetGender, PetType } from "../../constants";

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
        overrides: Partial<Omit<CreatePetDto, "homeId">> & {
            homeId: string;
        },
    ): Promise<Pet> {
        const name = faker.person.firstName();
        const type = faker.helpers.arrayElement(Object.values(PetType));
        const gender = faker.helpers.arrayElement(Object.values(PetGender));
        const dob = faker.date.past();
        const breed = () => {
            switch (type) {
                case PetType.CAT:
                    return faker.helpers.arrayElement(Object.values(CatBreed));
                default:
                    return faker.helpers.arrayElement(Object.values(DogBreed));
            }
        };

        const petData: CreatePetDto = {
            name,
            type,
            gender,
            dob,
            breed: breed(),
            ...overrides,
        };

        return await this.petService.create(petData);
    }
}

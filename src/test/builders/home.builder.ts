import { HomeService } from "../../home/home.service";
import { Home } from "../../types";
import { BaseBuilder } from "./base.builder";
import { faker } from "@faker-js/faker";
import { CreateHomeDto } from "../../home/dto";

/**
 * Home builder class for integration tests.
 * Set up once in beforeAll, then use createHome method in tests.
 */
export class HomeBuilder extends BaseBuilder {
    private get homeService(): HomeService {
        return this.getService<HomeService>(HomeService);
    }

    /**
     * Creates a home in the database allowing partial overrides.
     * @param overrides - Partial home data to override defaults.
     * @returns The created home.
     */
    async createHome(
        overrides: Partial<Omit<CreateHomeDto, "ownerId">> & {
            ownerId: string;
        },
    ): Promise<Home> {
        const name = faker.location.street();

        const homeData: CreateHomeDto = {
            name,
            ...overrides,
        };

        return await this.homeService.create(homeData);
    }
}

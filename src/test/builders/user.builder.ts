import { Prisma } from "prisma/generated/prisma";
import { UserService } from "../../user/user.service";
import { User } from "../../types";
import { BaseBuilder } from "./base.builder";
import { faker } from "@faker-js/faker";

/**
 * User builder class for integration tests.
 * Set up once in beforeAll, then use createUser method in tests.
 */
export class UserBuilder extends BaseBuilder {
    private get userService(): UserService {
        return this.getService<UserService>(UserService);
    }

    /**
     * Creates a user in the database allowing partial overrides.
     * @param overrides - Partial user data to override defaults.
     * @returns The created user.
     */
    async createUser(
        overrides: Partial<Prisma.UserCreateInput> = {},
    ): Promise<User> {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@ruff.com`;

        const userData: Prisma.UserCreateInput = {
            firstName,
            lastName,
            email,
            ...overrides,
        };

        return await this.userService.create(userData);
    }
}

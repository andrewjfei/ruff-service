import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Logger,
    Param,
    Post,
    Put,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { HomeCreateData } from "src/types";
import { Prisma, User } from "src/../prisma/generated/prisma";

@Controller("user")
export class UserController {
    private readonly logger = new Logger(UserController.name);

    constructor(private readonly userService: UserService) {}

    @Post()
    @HttpCode(201)
    async createUser(@Body() data: Prisma.UserCreateInput): Promise<User> {
        this.logger.log(`Creating user with data: ${JSON.stringify(data)}`);
        return this.userService.create(data);
    }

    @Get(":id")
    @HttpCode(200)
    async getUser(@Param("id") id: string): Promise<User> {
        this.logger.log(`Getting user with id: ${id}`);
        return this.userService.retrieve(id);
    }

    @Get()
    @HttpCode(200)
    async getUsers(): Promise<User[]> {
        this.logger.log("Getting all users");
        return this.userService.retrieveAll();
    }

    @Put(":id")
    @HttpCode(200)
    async updateUser(
        @Param("id") id: string,
        @Body() data: Prisma.UserUpdateInput,
    ): Promise<User> {
        this.logger.log(
            `Updating user with id: ${id} with data: ${JSON.stringify(data)}`,
        );
        return this.userService.update(id, data);
    }

    @Delete(":id")
    @HttpCode(200)
    async deleteUser(@Param("id") id: string): Promise<User> {
        this.logger.log(`Deleting user with id: ${id}`);
        return this.userService.delete(id);
    }

    @Post(":id/home")
    @HttpCode(201)
    async addHome(
        @Param("id") id: string,
        @Body() data: HomeCreateData,
    ): Promise<User> {
        this.logger.log(
            `Adding home to user with id: ${id} with data: ${JSON.stringify(data)}`,
        );
        return this.userService.addHome(id, data);
    }
}

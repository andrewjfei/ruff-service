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
import { Prisma } from "prisma/generated/prisma";
import { User } from "../types";

@Controller("user")
export class UserController {
    private readonly logger = new Logger(UserController.name);

    constructor(private readonly userService: UserService) {}

    @Post()
    @HttpCode(201)
    async createUser(@Body() data: Prisma.UserCreateInput): Promise<User> {
        return this.userService.create(data);
    }

    @Get(":id")
    @HttpCode(200)
    async getUser(@Param("id") id: string): Promise<User> {
        return this.userService.retrieve(id);
    }

    @Get()
    @HttpCode(200)
    async getUsers(): Promise<User[]> {
        return this.userService.retrieveAll();
    }

    @Put(":id")
    @HttpCode(200)
    async updateUser(
        @Param("id") id: string,
        @Body() data: Prisma.UserUpdateInput,
    ): Promise<User> {
        return this.userService.update(id, data);
    }

    @Delete(":id")
    @HttpCode(200)
    async deleteUser(@Param("id") id: string): Promise<User> {
        return this.userService.delete(id);
    }
}

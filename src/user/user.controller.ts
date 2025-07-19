import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
} from "@nestjs/common";
import { Prisma, User } from "generated/prisma";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get(":id")
    async getUser(@Param("id") id: string): Promise<User | null> {
        return this.userService.retrieveUser({ id: parseInt(id) });
    }

    @Get()
    async getUsers() {
        return this.userService.retrieveAllUsers();
    }

    @Post()
    async createUser(@Body() data: Prisma.UserCreateInput): Promise<User> {
        return this.userService.createUser(data);
    }

    @Put(":id")
    async updateUser(
        @Param("id") id: string,
        @Body() data: Prisma.UserUpdateInput,
    ): Promise<User> {
        return this.userService.updateUser({ id: parseInt(id) }, data);
    }

    @Delete(":id")
    async deleteUser(@Param("id") id: string): Promise<User> {
        return this.userService.deleteUser({ id: parseInt(id) });
    }
}

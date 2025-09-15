import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Logger,
    Param,
    Patch,
    Post,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "../types";
import { CreateUserDto, UpdateUserDto } from "./dto";

@Controller("users")
export class UserController {
    private readonly logger = new Logger(UserController.name);

    constructor(private readonly userService: UserService) {}

    @Post()
    @HttpCode(201)
    async createUser(@Body() data: CreateUserDto): Promise<User> {
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

    @Patch(":id")
    @HttpCode(200)
    async updateUser(
        @Param("id") id: string,
        @Body() data: UpdateUserDto,
    ): Promise<User> {
        return this.userService.update(id, data);
    }

    @Delete(":id")
    @HttpCode(200)
    async deleteUser(@Param("id") id: string): Promise<User> {
        return this.userService.delete(id);
    }
}

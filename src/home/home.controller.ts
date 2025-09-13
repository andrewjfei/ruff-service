import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Post,
    Put,
} from "@nestjs/common";
import { HomeService } from "./home.service";
import { Home, Prisma } from "src/../prisma/generated/prisma";

@Controller("home")
export class HomeController {
    constructor(private readonly homeService: HomeService) {}

    @Post()
    @HttpCode(201)
    async createHome(@Body() data: Prisma.HomeCreateInput): Promise<Home> {
        return this.homeService.create(data);
    }

    @Get(":id")
    @HttpCode(200)
    async getHome(@Param("id") id: string): Promise<Home | null> {
        return this.homeService.retrieve(id);
    }

    @Get()
    @HttpCode(200)
    async getHomes(): Promise<Home[]> {
        return this.homeService.retrieveAll();
    }

    @Put(":id")
    @HttpCode(200)
    async updateHome(
        @Param("id") id: string,
        @Body() data: Prisma.HomeUpdateInput,
    ): Promise<Home> {
        return this.homeService.update(id, data);
    }

    @Delete(":id")
    @HttpCode(200)
    async deleteHome(@Param("id") id: string): Promise<Home> {
        return this.homeService.delete(id);
    }
}

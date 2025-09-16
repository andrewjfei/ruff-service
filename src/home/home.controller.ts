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
    Query,
} from "@nestjs/common";
import { HomeService } from "./home.service";
import { Home } from "../../prisma/generated/prisma";
import {
    AddUserToHomeDto,
    CreateHomeDto,
    GetHomesDto,
    UpdateHomeDto,
} from "./dto";

@Controller("homes")
export class HomeController {
    private readonly logger = new Logger(HomeController.name);

    constructor(private readonly homeService: HomeService) {}

    @Post(":id/users")
    @HttpCode(201)
    async addUserToHome(
        @Param("id") homeId: string,
        @Body() data: AddUserToHomeDto,
    ): Promise<void> {
        return this.homeService.addUserToHome(homeId, data.userId);
    }

    @Post()
    @HttpCode(201)
    async createHome(@Body() data: CreateHomeDto): Promise<Home> {
        return this.homeService.create(data);
    }

    @Get(":id")
    @HttpCode(200)
    async getHome(@Param("id") homeId: string): Promise<Home> {
        return this.homeService.retrieve(homeId);
    }

    @Get()
    @HttpCode(200)
    async getHomes(@Query() query: GetHomesDto): Promise<Home[]> {
        return this.homeService.retrieveAll(query);
    }

    @Patch(":id")
    @HttpCode(200)
    async updateHome(
        @Param("id") homeId: string,
        @Body() data: UpdateHomeDto,
    ): Promise<Home> {
        return this.homeService.update(homeId, data);
    }

    @Delete(":id")
    @HttpCode(200)
    async deleteHome(@Param("id") homeId: string): Promise<Home> {
        return this.homeService.delete(homeId);
    }
}

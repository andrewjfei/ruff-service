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
import { PetService } from "./pet.service";
import { Pet, Prisma } from "prisma/generated/prisma";

@Controller("pet")
export class PetController {
    private readonly logger = new Logger(PetController.name);

    constructor(private readonly petService: PetService) {}

    @Post()
    @HttpCode(201)
    async createHome(@Body() data: Prisma.PetCreateInput): Promise<Pet> {
        return this.petService.create(data);
    }

    @Get(":id")
    @HttpCode(200)
    async getHome(@Param("id") id: string): Promise<Pet> {
        return this.petService.retrieve(id);
    }

    @Get()
    @HttpCode(200)
    async getHomes(): Promise<Pet[]> {
        return this.petService.retrieveAll();
    }

    @Put(":id")
    @HttpCode(200)
    async updatePet(
        @Param("id") id: string,
        @Body() data: Prisma.PetUpdateInput,
    ): Promise<Pet> {
        return this.petService.update(id, data);
    }

    @Delete(":id")
    @HttpCode(200)
    async deleteHome(@Param("id") id: string): Promise<Pet> {
        return this.petService.delete(id);
    }
}

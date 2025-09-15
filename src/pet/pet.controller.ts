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
import { PetService } from "./pet.service";
import { Pet } from "../types";
import { CreatePetDto, GetPetBreedsDto, UpdatePetDto } from "./dto";

@Controller("pets")
export class PetController {
    private readonly logger = new Logger(PetController.name);

    constructor(private readonly petService: PetService) {}

    @Get("types")
    @HttpCode(200)
    getPetTypes(): string[] {
        return this.petService.retrievePetTypes();
    }

    @Get("genders")
    @HttpCode(200)
    getPetGenders(): string[] {
        return this.petService.retrievePetGenders();
    }

    @Get("breeds")
    @HttpCode(200)
    getPetBreeds(@Query() data: GetPetBreedsDto): string[] {
        return this.petService.retrievePetBreeds(data.type);
    }

    @Post()
    @HttpCode(201)
    async createPet(@Body() data: CreatePetDto): Promise<Pet> {
        return this.petService.create(data);
    }

    @Get(":id")
    @HttpCode(200)
    async getPet(@Param("id") id: string): Promise<Pet> {
        return this.petService.retrieve(id);
    }

    @Get()
    @HttpCode(200)
    async getPets(): Promise<Pet[]> {
        return this.petService.retrieveAll();
    }

    @Patch(":id")
    @HttpCode(200)
    async updatePet(
        @Param("id") id: string,
        @Body() data: UpdatePetDto,
    ): Promise<Pet> {
        return this.petService.update(id, data);
    }

    @Delete(":id")
    @HttpCode(200)
    async deletePet(@Param("id") id: string): Promise<Pet> {
        return this.petService.delete(id);
    }
}

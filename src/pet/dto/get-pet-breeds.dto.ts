// src/items/dto/get-items.dto.ts
import { IsOptional, IsString } from "class-validator";

export class GetPetBreedsDto {
    @IsString()
    @IsOptional()
    type?: string;
}

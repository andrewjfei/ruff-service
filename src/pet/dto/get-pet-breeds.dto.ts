import { IsOptional, IsString } from "class-validator";

export class GetPetBreedsDto {
    @IsString()
    @IsOptional()
    type?: string;
}

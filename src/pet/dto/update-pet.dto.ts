import { IsDate, IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { Type } from "class-transformer";
import { DogBreed, PetGender, PetType } from "../../constants";

export class UpdatePetDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsEnum(PetType)
    @IsOptional()
    type?: string;

    @IsEnum(PetGender)
    @IsOptional()
    gender?: string;

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    dob?: Date;

    @IsEnum(DogBreed)
    @IsOptional()
    breed?: string;

    @IsUUID()
    @IsOptional()
    homeId?: string;
}

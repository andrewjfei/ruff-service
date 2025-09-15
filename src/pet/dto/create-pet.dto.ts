import { IsDate, IsEnum, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { Type } from "class-transformer";
import { DogBreed, PetGender, PetType } from "../../constants";

export class CreatePetDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEnum(PetType)
    @IsNotEmpty()
    type: string;

    @IsEnum(PetGender)
    @IsNotEmpty()
    gender: string;

    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    dob: Date;

    @IsEnum(DogBreed)
    @IsNotEmpty()
    breed: string;

    @IsUUID()
    @IsNotEmpty()
    homeId: string;
}

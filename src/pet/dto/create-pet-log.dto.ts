import {
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { PetLogType } from "../../constants";

export class CreatePetLogDto {
    @IsEnum(PetLogType)
    @IsNotEmpty()
    type: string;

    @IsString()
    @IsNotEmpty()
    @Transform(({ value }): string => (value as string)?.trim())
    title: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }): string => (value as string)?.trim())
    description?: string;

    @IsDate()
    @IsNotEmpty()
    @Type(() => Date)
    occuredAt: Date;
}

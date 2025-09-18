import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsUUID } from "class-validator";

export class GetAllPetLogsDto {
    @IsUUID()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }): string => (value as string)?.trim())
    userId?: string;

    @IsNumber()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }): number => Number(value))
    limit?: number = 10;
}

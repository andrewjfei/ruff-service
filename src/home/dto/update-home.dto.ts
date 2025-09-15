import { IsOptional, IsString, IsUUID } from "class-validator";

export class UpdateHomeDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsUUID()
    @IsOptional()
    ownerId?: string;
}

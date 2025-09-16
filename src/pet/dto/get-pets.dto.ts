import { IsOptional, IsUUID } from "class-validator";

export class GetPetsDto {
    @IsUUID()
    @IsOptional()
    userId?: string;
}

import { IsOptional, IsUUID } from "class-validator";

export class GetHomesDto {
    @IsUUID()
    @IsOptional()
    userId?: string;
}

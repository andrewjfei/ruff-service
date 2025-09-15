import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateHomeDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsUUID()
    @IsNotEmpty()
    ownerId: string;
}

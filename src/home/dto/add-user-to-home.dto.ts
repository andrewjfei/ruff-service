import { IsNotEmpty, IsUUID } from "class-validator";

export class AddUserToHomeDto {
    @IsUUID()
    @IsNotEmpty()
    userId: string;
}

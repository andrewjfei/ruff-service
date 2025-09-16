import { User } from "../../../prisma/generated/prisma";

export class LoginResponseDto {
    accessToken: string;
    user: User;
}

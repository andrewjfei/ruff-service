import {
    Injectable,
    InternalServerErrorException,
    Logger,
    UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { assertDefined } from "../utils";
import { LoginResponseDto, LoginUserDto } from "./dto";
import { NotDefinedError } from "../errors";

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    /**
     * Login a user.
     * @param data - The data to login the user with.
     * @returns The JWT token and user data.
     */
    async login(data: LoginUserDto): Promise<LoginResponseDto> {
        try {
            const user = assertDefined(
                await this.prismaService.user.findUnique({
                    where: {
                        email: data.email,
                    },
                }),
                "Invalid Credentials",
            );

            const payload = {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                sub: user.id,
            };
            const accessToken = this.jwtService.sign(payload);

            return {
                accessToken,
                user,
            };
        } catch (error) {
            if (error instanceof Error) {
                if (error instanceof NotDefinedError) {
                    throw new UnauthorizedException(error.message);
                }

                throw new InternalServerErrorException(
                    `Failed to login user: ${error.message}`,
                );
            }

            throw new InternalServerErrorException(error);
        }
    }
}

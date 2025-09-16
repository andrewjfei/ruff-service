import { Body, Controller, HttpCode, Logger, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginResponseDto, LoginUserDto } from "./dto";

@Controller("auth")
export class AuthController {
    private readonly logger = new Logger(AuthController.name);

    constructor(private readonly authService: AuthService) {}

    @Post("login")
    @HttpCode(200)
    async login(@Body() data: LoginUserDto): Promise<LoginResponseDto> {
        return this.authService.login(data);
    }
}

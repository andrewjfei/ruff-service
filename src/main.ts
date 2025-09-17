import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConsoleLogger, Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "./types/config";
import { assertDefined } from "./utils";
import { ResponseInterceptor } from "./interceptors/response.interceptor";
import { ExceptionInterceptor } from "./interceptors/exception.interceptor";

async function bootstrap() {
    const logger = new Logger("Main");

    const app = await NestFactory.create(AppModule, {
        logger: new ConsoleLogger({
            json: process.env.ENV === "production",
        }),
    });

    app.enableCors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    });

    app.useGlobalPipes(
        new ValidationPipe({
            // Transform the request body to the DTO class
            transform: true,
            // Remove any properties that are not in the DTO class
            whitelist: true,
        }),
    );

    // Format API response interceptor
    app.useGlobalInterceptors(new ResponseInterceptor());

    // Exception interceptor
    app.useGlobalInterceptors(new ExceptionInterceptor());

    const configService = app.get(ConfigService);
    const appConfig: AppConfig = assertDefined(
        configService.get<AppConfig>("app"),
    );

    const port = appConfig.port;

    await app.listen(port, () => {
        logger.log(`Nest application is running on port ${port}`);
    });
}

bootstrap();

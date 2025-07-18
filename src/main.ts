import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConsoleLogger, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "./types/config";
import { assertDefined } from "./utils/objectUtil";

async function bootstrap() {
    const logger = new Logger('Main');

    const app = await NestFactory.create(AppModule, {
        logger: new ConsoleLogger({
            json: process.env.ENV === "production",
        })
    });

    const configService = app.get(ConfigService);
    const appConfig: AppConfig = assertDefined(configService.get("app"));

    const port = appConfig.port;

    await app.listen(port, () => {
        logger.log(`Nest application is running on port ${port}`);
    });
}

bootstrap();

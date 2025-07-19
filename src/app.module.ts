import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./user/user.module";
import appConfig from "./config/app.config";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthModule } from "./health/health.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [".env"],
            load: [appConfig],
        }),
        UserModule,
        PrismaModule,
        HealthModule,
    ],
})
export class AppModule {}

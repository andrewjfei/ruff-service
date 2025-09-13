import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./user/user.module";
import { appConfig } from "./config";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthModule } from "./health/health.module";
import { PetModule } from "./pet/pet.module";
import { HomeModule } from "./home/home.module";

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
        PetModule,
        HomeModule,
    ],
})
export class AppModule {}

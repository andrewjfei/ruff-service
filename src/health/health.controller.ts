import { Controller, Get, HttpCode } from "@nestjs/common";
import { HealthService } from "./health.service";
import { Health } from "src/types";

@Controller("health")
export class HealthController {
    constructor(private readonly healthService: HealthService) {}

    @Get()
    @HttpCode(200)
    getHealth(): Health {
        return this.healthService.retrieveHealth();
    }
}

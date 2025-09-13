import { Injectable } from "@nestjs/common";
import { HealthStatus } from "src/constants";
import { Health } from "src/types";

@Injectable()
export class HealthService {
    retrieveHealth(): Health {
        return {
            status: HealthStatus.HEALTHY,
        };
    }
}

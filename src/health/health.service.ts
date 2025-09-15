import { Injectable } from "@nestjs/common";
import { HealthStatus } from "../constants";
import { Health } from "../types";

@Injectable()
export class HealthService {
    retrieveHealth(): Health {
        return {
            status: HealthStatus.HEALTHY,
        };
    }
}

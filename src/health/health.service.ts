import { Injectable } from "@nestjs/common";

@Injectable()
export class HealthService {
    retrieveHealth(): string {
        return "Healthy";
    }
}

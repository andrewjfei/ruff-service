import { INestApplication } from "@nestjs/common";

/**
 * Base builder class.
 * Provides common functionality for accessing services from the NestJS app.
 */
export abstract class BaseBuilder {
    protected app: INestApplication;

    constructor(app: INestApplication) {
        this.app = app;
    }

    /**
     * Helper method to get any service from the app.
     * Useful for accessing services in builders.
     * @param service - The service class to get.
     * @returns The service instance.
     */
    protected getService<T>(service: new (...args: any[]) => T): T {
        return this.app.get<T>(service);
    }
}

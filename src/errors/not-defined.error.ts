export class NotDefinedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NotDefinedError";
    }
}

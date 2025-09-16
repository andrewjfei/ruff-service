import { NotDefinedError } from "../errors";

/**
 * Asserts that a value is defined and not null.
 * @param value - The value to assert.
 * @returns The value if it is defined and not null.
 * @throws An error if the value is undefined or null.
 */
export function assertDefined<T>(value: T, message?: string): NonNullable<T> {
    if (value === undefined || value === null) {
        throw new NotDefinedError(message || "Value is undefined or null");
    }

    return value;
}

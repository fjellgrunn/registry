/**
 * Base class for all registry-related errors
 */
export abstract class RegistryError extends Error {
  public readonly registryType?: string;
  public readonly context?: Record<string, any>;

  constructor(message: string, registryType?: string, context?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    this.registryType = registryType;
    this.context = context;

    // Maintains proper stack trace for where our error was thrown (Node.js specific)
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }

  public getDetails(): string {
    const details: string[] = [this.message];

    if (this.registryType) {
      details.push(`Registry Type: ${this.registryType}`);
    }

    if (this.context) {
      details.push(`Context: ${JSON.stringify(this.context, null, 2)}`);
    }

    return details.join('\n');
  }
}

/**
 * Thrown when attempting to create a registry with invalid parameters
 */
export class RegistryCreationError extends RegistryError {
  constructor(type: string, reason: string, context?: Record<string, any>) {
    super(`Failed to create registry of type '${type}': ${reason}`, type, context);
  }
}

/**
 * Thrown when a factory function returns an invalid instance
 */
export class InvalidFactoryResultError extends RegistryError {
  public readonly keyPath: string[];
  public readonly factoryResult: any;

  constructor(keyPath: string[], factoryResult: any, registryType?: string) {
    const keyPathStr = keyPath.join('.');
    super(
      `Factory did not return a valid instance for: ${keyPathStr}. ` +
      `Expected instance with 'coordinate' and 'registry' properties, got: ${typeof factoryResult}`,
      registryType,
      { keyPath, factoryResult: typeof factoryResult }
    );
    this.keyPath = keyPath;
    this.factoryResult = factoryResult;
  }
}

/**
 * Thrown when attempting to register a non-instance object
 */
export class InvalidInstanceRegistrationError extends RegistryError {
  public readonly keyPath: string[];
  public readonly attemptedRegistration: any;

  constructor(keyPath: string[], attemptedRegistration: any, registryType?: string) {
    const keyPathStr = keyPath.join('.');
    super(
      `Attempting to register a non-instance: ${keyPathStr}. ` +
      `Expected instance with 'coordinate' and 'registry' properties, got: ${typeof attemptedRegistration}`,
      registryType,
      { keyPath, attemptedRegistration: typeof attemptedRegistration }
    );
    this.keyPath = keyPath;
    this.attemptedRegistration = attemptedRegistration;
  }
}

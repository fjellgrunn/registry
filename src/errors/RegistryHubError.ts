import { RegistryError } from './RegistryError';

/**
 * Base class for registry hub-related errors
 */
export abstract class RegistryHubError extends RegistryError {
  public readonly hubType?: string;

  constructor(message: string, hubType?: string, context?: Record<string, any>) {
    const enrichedContext = hubType ? { ...context, hubType } : context;
    super(message, '', enrichedContext);
    this.hubType = hubType;
  }
}

/**
 * Thrown when attempting to register a registry with a type that already exists
 */
export class DuplicateRegistryTypeError extends RegistryHubError {
  public readonly duplicateType: string;

  constructor(type: string, context?: Record<string, any>) {
    super(
      `Registry already registered under type: ${type}. ` +
      `Each registry type must be unique within a registry hub.`,
      '',
      { ...context, duplicateType: type }
    );
    this.duplicateType = type;
  }
}

/**
 * Thrown when attempting to access a registry type that doesn't exist
 */
export class RegistryTypeNotFoundError extends RegistryHubError {
  public readonly requestedType: string;
  public readonly availableTypes: string[];

  constructor(requestedType: string, availableTypes: string[] = [], context?: Record<string, any>) {
    let message = `No registry registered under type: ${requestedType}`;
    if (availableTypes.length > 0) {
      message += `. Available types: [${availableTypes.join(', ')}]`;
    }

    super(message, '', { ...context, requestedType, availableTypes });
    this.requestedType = requestedType;
    this.availableTypes = availableTypes;
  }
}

/**
 * Thrown when a registry factory function fails to create a valid registry
 */
export class RegistryFactoryError extends RegistryHubError {
  public readonly factoryError: Error;
  public readonly attemptedType: string;

  constructor(type: string, factoryError: Error, context?: Record<string, any>) {
    super(
      `Registry factory failed to create registry of type '${type}': ${factoryError.message}`,
      '',
      { ...context, attemptedType: type, originalError: factoryError.message }
    );
    this.factoryError = factoryError;
    this.attemptedType = type;
  }
}

/**
 * Thrown when a factory returns an invalid registry object
 */
export class InvalidRegistryFactoryResultError extends RegistryHubError {
  public readonly factoryResult: any;
  public readonly attemptedType: string;

  constructor(type: string, factoryResult: any, context?: Record<string, any>) {
    super(
      `Registry factory returned invalid registry for type '${type}'. ` +
      `Expected registry with 'type', 'get', 'register', and 'createInstance' properties, ` +
      `got: ${typeof factoryResult}`,
      '',
      { ...context, attemptedType: type, factoryResult: typeof factoryResult }
    );
    this.factoryResult = factoryResult;
    this.attemptedType = type;
  }
}

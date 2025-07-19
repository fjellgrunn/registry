import { RegistryError } from './RegistryError';

/**
 * Base class for coordinate-related errors
 */
export abstract class CoordinateError extends RegistryError {
  public readonly kta?: any;
  public readonly scopes?: string[];

  constructor(message: string, kta?: any, scopes?: string[], context?: Record<string, any>) {
    super(message, '', { ...context, kta, scopes });
    this.kta = kta;
    this.scopes = scopes;
  }
}

/**
 * Thrown when coordinate creation fails due to invalid parameters
 */
export class InvalidCoordinateError extends CoordinateError {
  constructor(kta: any, scopes: string[], reason: string, context?: Record<string, any>) {
    super(
      `Invalid coordinate parameters: ${reason}. ` +
      `KTA: ${JSON.stringify(kta)}, Scopes: [${scopes.join(', ')}]`,
      kta,
      scopes,
      { ...context, reason }
    );
  }
}

/**
 * Thrown when KTA (Key Type Array) is invalid
 */
export class InvalidKTAError extends CoordinateError {
  constructor(kta: any, reason: string, context?: Record<string, any>) {
    super(
      `Invalid KTA (Key Type Array): ${reason}. ` +
      `Expected string or array of strings, got: ${JSON.stringify(kta)}`,
      kta,
      [],
      { ...context, reason }
    );
  }
}

/**
 * Thrown when scopes array contains invalid values
 */
export class InvalidScopesError extends CoordinateError {
  public readonly invalidScopes: any[];

  constructor(scopes: any[], invalidScopes: any[], reason: string, context?: Record<string, any>) {
    super(
      `Invalid scopes: ${reason}. ` +
      `Invalid scope values: ${JSON.stringify(invalidScopes)}`,
      null,
      scopes.filter(s => typeof s === 'string'),
      { ...context, reason, invalidScopes }
    );
    this.invalidScopes = invalidScopes;
  }
}

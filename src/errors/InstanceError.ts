import { RegistryError } from './RegistryError';

/**
 * Base class for instance-related errors
 */
export abstract class InstanceError extends RegistryError {
  public readonly keyPath: string[];

  constructor(message: string, keyPath: string[], registryType?: string, context?: Record<string, any>) {
    super(message, registryType, { ...context, keyPath });
    this.keyPath = keyPath;
  }
}

/**
 * Thrown when an instance cannot be found for a given key path
 */
export class InstanceNotFoundError extends InstanceError {
  public readonly missingKey?: string;

  constructor(keyPath: string[], missingKey?: string, registryType?: string, context?: Record<string, any>) {
    const keyPathStr = keyPath.join('.');
    let message = `Instance not found for key path: ${keyPathStr}`;

    if (missingKey) {
      message += `, Missing key: ${missingKey}`;
    }

    super(message, keyPath, registryType, { ...context, missingKey });
    this.missingKey = missingKey;
  }
}

/**
 * Thrown when no instances are registered for a key path that exists in the tree
 */
export class NoInstancesRegisteredError extends InstanceError {
  constructor(keyPath: string[], registryType?: string, context?: Record<string, any>) {
    const keyPathStr = keyPath.join('.');
    super(
      `No instances registered for key path: ${keyPathStr}. ` +
      `The key path exists in the registry tree but contains no instances.`,
      keyPath,
      registryType,
      context
    );
  }
}

/**
 * Thrown when no instances are available (empty instances array)
 */
export class NoInstancesAvailableError extends InstanceError {
  constructor(keyPath: string[], registryType?: string, context?: Record<string, any>) {
    const keyPathStr = keyPath.join('.');
    super(
      `No instances available for key path: ${keyPathStr}. ` +
      `This typically indicates an internal registry state issue.`,
      keyPath,
      registryType,
      context
    );
  }
}

/**
 * Thrown when no instance matches the requested scopes
 */
export class ScopeNotFoundError extends InstanceError {
  public readonly requestedScopes: string[];
  public readonly availableScopes: string[][];

  constructor(
    keyPath: string[],
    requestedScopes: string[],
    availableScopes: string[][] = [],
    registryType?: string
  ) {
    const keyPathStr = keyPath.join('.');
    const scopesStr = requestedScopes.join(', ');
    const availableScopesStr = availableScopes.map(scopes => `[${scopes.join(', ')}]`).join(', ');

    let message = `No instance found matching scopes: ${scopesStr} for key path: ${keyPathStr}`;
    if (availableScopes.length > 0) {
      message += `. Available scopes: ${availableScopesStr}`;
    }

    super(message, keyPath, registryType, { requestedScopes, availableScopes });
    this.requestedScopes = requestedScopes;
    this.availableScopes = availableScopes;
  }
}

/**
 * Thrown when a key path has no children but children are expected
 */
export class NoChildrenAvailableError extends InstanceError {
  public readonly parentKey: string;

  constructor(keyPath: string[], parentKey: string, registryType?: string, context?: Record<string, any>) {
    const keyPathStr = keyPath.join('.');
    super(
      `Instance not found for key path: ${keyPathStr}, No children for: ${parentKey}. ` +
      `The path cannot be traversed further as '${parentKey}' has no child nodes.`,
      keyPath,
      registryType,
      { ...context, parentKey }
    );
    this.parentKey = parentKey;
  }
}

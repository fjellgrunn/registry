
import { describe, expect, test } from 'vitest';
import {
  InstanceError,
  InstanceNotFoundError,
  NoChildrenAvailableError,
  NoInstancesAvailableError,
  NoInstancesRegisteredError,
  ScopeNotFoundError
} from '../../src/errors/InstanceError';
import { RegistryError } from '../../src/errors/RegistryError';

describe('InstanceError', () => {
  // Create a concrete implementation for testing the abstract base class
  class TestInstanceError extends InstanceError {
    constructor(message: string, keyPath: string[], registryType?: string, context?: Record<string, any>) {
      super(message, keyPath, registryType, context);
    }
  }

  describe('constructor', () => {
    test('should create instance with message and keyPath', () => {
      const keyPath = ['parent', 'child'];
      const message = 'Test error message';
      const error = new TestInstanceError(message, keyPath);

      expect(error.message).toBe(message);
      expect(error.keyPath).toEqual(keyPath);
      expect(error.name).toBe('TestInstanceError');
      expect(error.registryType).toBeUndefined();
      expect(error.context).toEqual({ keyPath });
    });

    test('should create instance with registryType and context', () => {
      const keyPath = ['parent', 'child'];
      const message = 'Test error message';
      const registryType = 'test-registry';
      const context = { customField: 'value' };
      const error = new TestInstanceError(message, keyPath, registryType, context);

      expect(error.message).toBe(message);
      expect(error.keyPath).toEqual(keyPath);
      expect(error.registryType).toBe(registryType);
      expect(error.context).toEqual({ ...context, keyPath });
    });

    test('should inherit from RegistryError', () => {
      const error = new TestInstanceError('test', ['key']);
      expect(error).toBeInstanceOf(RegistryError);
      expect(error).toBeInstanceOf(Error);
    });
  });
});

describe('InstanceNotFoundError', () => {
  describe('constructor', () => {
    test('should create error with basic keyPath', () => {
      const keyPath = ['parent', 'child'];
      const error = new InstanceNotFoundError(keyPath);

      expect(error.message).toBe('Instance not found for key path: parent.child');
      expect(error.keyPath).toEqual(keyPath);
      expect(error.missingKey).toBeUndefined();
      expect(error.name).toBe('InstanceNotFoundError');
    });

    test('should create error with missing key', () => {
      const keyPath = ['parent', 'child'];
      const missingKey = 'missing';
      const error = new InstanceNotFoundError(keyPath, missingKey);

      expect(error.message).toBe('Instance not found for key path: parent.child, Missing key: missing');
      expect(error.keyPath).toEqual(keyPath);
      expect(error.missingKey).toBe(missingKey);
      expect(error.context).toEqual({ keyPath, missingKey });
    });

    test('should create error with registryType and context', () => {
      const keyPath = ['test'];
      const missingKey = 'missing';
      const registryType = 'test-registry';
      const context = { extra: 'data' };
      const error = new InstanceNotFoundError(keyPath, missingKey, registryType, context);

      expect(error.registryType).toBe(registryType);
      expect(error.context).toEqual({ ...context, keyPath, missingKey });
    });

    test('should handle empty keyPath', () => {
      const keyPath: string[] = [];
      const error = new InstanceNotFoundError(keyPath);

      expect(error.message).toBe('Instance not found for key path: ');
      expect(error.keyPath).toEqual([]);
    });
  });
});

describe('NoInstancesRegisteredError', () => {
  describe('constructor', () => {
    test('should create error with keyPath', () => {
      const keyPath = ['parent', 'child'];
      const error = new NoInstancesRegisteredError(keyPath);

      expect(error.message).toBe(
        'No instances registered for key path: parent.child. ' +
        'The key path exists in the registry tree but contains no instances.'
      );
      expect(error.keyPath).toEqual(keyPath);
      expect(error.name).toBe('NoInstancesRegisteredError');
    });

    test('should create error with registryType and context', () => {
      const keyPath = ['test'];
      const registryType = 'test-registry';
      const context = { reason: 'test' };
      const error = new NoInstancesRegisteredError(keyPath, registryType, context);

      expect(error.registryType).toBe(registryType);
      expect(error.context).toEqual({ ...context, keyPath });
    });

    test('should handle single key path', () => {
      const keyPath = ['single'];
      const error = new NoInstancesRegisteredError(keyPath);

      expect(error.message).toBe(
        'No instances registered for key path: single. ' +
        'The key path exists in the registry tree but contains no instances.'
      );
    });
  });
});

describe('NoInstancesAvailableError', () => {
  describe('constructor', () => {
    test('should create error with keyPath', () => {
      const keyPath = ['parent', 'child'];
      const error = new NoInstancesAvailableError(keyPath);

      expect(error.message).toBe(
        'No instances available for key path: parent.child. ' +
        'This typically indicates an internal registry state issue.'
      );
      expect(error.keyPath).toEqual(keyPath);
      expect(error.name).toBe('NoInstancesAvailableError');
    });

    test('should create error with registryType and context', () => {
      const keyPath = ['test'];
      const registryType = 'test-registry';
      const context = { state: 'corrupted' };
      const error = new NoInstancesAvailableError(keyPath, registryType, context);

      expect(error.registryType).toBe(registryType);
      expect(error.context).toEqual({ ...context, keyPath });
    });
  });
});

describe('ScopeNotFoundError', () => {
  describe('constructor', () => {
    test('should create error with basic parameters', () => {
      const keyPath = ['parent', 'child'];
      const requestedScopes = ['scope1', 'scope2'];
      const error = new ScopeNotFoundError(keyPath, requestedScopes);

      expect(error.message).toBe(
        'No instance found matching scopes: scope1, scope2 for key path: parent.child'
      );
      expect(error.keyPath).toEqual(keyPath);
      expect(error.requestedScopes).toEqual(requestedScopes);
      expect(error.availableScopes).toEqual([]);
      expect(error.name).toBe('ScopeNotFoundError');
    });

    test('should create error with available scopes', () => {
      const keyPath = ['parent'];
      const requestedScopes = ['scope1'];
      const availableScopes = [['scope2', 'scope3'], ['scope4']];
      const error = new ScopeNotFoundError(keyPath, requestedScopes, availableScopes);

      expect(error.message).toBe(
        'No instance found matching scopes: scope1 for key path: parent. ' +
        'Available scopes: [scope2, scope3], [scope4]'
      );
      expect(error.availableScopes).toEqual(availableScopes);
    });

    test('should create error with registryType', () => {
      const keyPath = ['test'];
      const requestedScopes = ['scope1'];
      const availableScopes: string[][] = [];
      const registryType = 'test-registry';
      const error = new ScopeNotFoundError(keyPath, requestedScopes, availableScopes, registryType);

      expect(error.registryType).toBe(registryType);
      expect(error.context).toEqual({ requestedScopes, availableScopes, keyPath });
    });

    test('should handle empty scopes', () => {
      const keyPath = ['test'];
      const requestedScopes: string[] = [];
      const error = new ScopeNotFoundError(keyPath, requestedScopes);

      expect(error.message).toBe(
        'No instance found matching scopes:  for key path: test'
      );
    });

    test('should handle complex available scopes', () => {
      const keyPath = ['complex'];
      const requestedScopes = ['admin'];
      const availableScopes = [['user'], ['guest', 'visitor'], ['moderator', 'admin', 'superuser']];
      const error = new ScopeNotFoundError(keyPath, requestedScopes, availableScopes);

      expect(error.message).toBe(
        'No instance found matching scopes: admin for key path: complex. ' +
        'Available scopes: [user], [guest, visitor], [moderator, admin, superuser]'
      );
    });
  });
});

describe('NoChildrenAvailableError', () => {
  describe('constructor', () => {
    test('should create error with keyPath and parentKey', () => {
      const keyPath = ['parent', 'child'];
      const parentKey = 'parent';
      const error = new NoChildrenAvailableError(keyPath, parentKey);

      expect(error.message).toBe(
        'Instance not found for key path: parent.child, No children for: parent. ' +
        'The path cannot be traversed further as \'parent\' has no child nodes.'
      );
      expect(error.keyPath).toEqual(keyPath);
      expect(error.parentKey).toBe(parentKey);
      expect(error.name).toBe('NoChildrenAvailableError');
    });

    test('should create error with registryType and context', () => {
      const keyPath = ['test', 'missing'];
      const parentKey = 'test';
      const registryType = 'test-registry';
      const context = { attempted: 'missing' };
      const error = new NoChildrenAvailableError(keyPath, parentKey, registryType, context);

      expect(error.registryType).toBe(registryType);
      expect(error.context).toEqual({ ...context, keyPath, parentKey });
    });

    test('should handle special characters in parentKey', () => {
      const keyPath = ['parent.with.dots', 'child'];
      const parentKey = 'parent.with.dots';
      const error = new NoChildrenAvailableError(keyPath, parentKey);

      expect(error.message).toContain('\'parent.with.dots\' has no child nodes');
    });
  });
});

describe('Error inheritance and properties', () => {
  test('all error classes should inherit from InstanceError', () => {
    const keyPath = ['test'];

    expect(new InstanceNotFoundError(keyPath)).toBeInstanceOf(InstanceError);
    expect(new NoInstancesRegisteredError(keyPath)).toBeInstanceOf(InstanceError);
    expect(new NoInstancesAvailableError(keyPath)).toBeInstanceOf(InstanceError);
    expect(new ScopeNotFoundError(keyPath, [])).toBeInstanceOf(InstanceError);
    expect(new NoChildrenAvailableError(keyPath, 'parent')).toBeInstanceOf(InstanceError);
  });

  test('all error classes should have correct names', () => {
    const keyPath = ['test'];

    expect(new InstanceNotFoundError(keyPath).name).toBe('InstanceNotFoundError');
    expect(new NoInstancesRegisteredError(keyPath).name).toBe('NoInstancesRegisteredError');
    expect(new NoInstancesAvailableError(keyPath).name).toBe('NoInstancesAvailableError');
    expect(new ScopeNotFoundError(keyPath, []).name).toBe('ScopeNotFoundError');
    expect(new NoChildrenAvailableError(keyPath, 'parent').name).toBe('NoChildrenAvailableError');
  });

  test('all errors should maintain keyPath property', () => {
    const keyPath = ['parent', 'child'];

    expect(new InstanceNotFoundError(keyPath).keyPath).toEqual(keyPath);
    expect(new NoInstancesRegisteredError(keyPath).keyPath).toEqual(keyPath);
    expect(new NoInstancesAvailableError(keyPath).keyPath).toEqual(keyPath);
    expect(new ScopeNotFoundError(keyPath, []).keyPath).toEqual(keyPath);
    expect(new NoChildrenAvailableError(keyPath, 'parent').keyPath).toEqual(keyPath);
  });

  test('errors should be throwable and catchable', () => {
    const keyPath = ['test'];

    expect(() => {
      throw new InstanceNotFoundError(keyPath);
    }).toThrow(InstanceNotFoundError);

    expect(() => {
      throw new NoInstancesRegisteredError(keyPath);
    }).toThrow(NoInstancesRegisteredError);

    expect(() => {
      throw new ScopeNotFoundError(keyPath, ['scope']);
    }).toThrow(ScopeNotFoundError);
  });
});

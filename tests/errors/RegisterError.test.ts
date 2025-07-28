import { describe, expect, it } from 'vitest';
import {
  InvalidFactoryResultError,
  InvalidInstanceRegistrationError,
  RegistryCreationError,
  RegistryError,
} from '../../src/errors/RegistryError';

// Concrete implementation for testing the abstract RegistryError class
class TestRegistryError extends RegistryError {
  constructor(message: string, registryType?: string, context?: Record<string, any>) {
    super(message, registryType, context);
  }
}

describe('RegistryError', () => {
  describe('constructor', () => {
    it('should create error with message only', () => {
      const error = new TestRegistryError('Test error message');

      expect(error.message).toBe('Test error message');
      expect(error.name).toBe('TestRegistryError');
      expect(error.registryType).toBeUndefined();
      expect(error.context).toBeUndefined();
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(RegistryError);
    });

    it('should create error with message and registryType', () => {
      const error = new TestRegistryError('Test error message', 'TestRegistry');

      expect(error.message).toBe('Test error message');
      expect(error.name).toBe('TestRegistryError');
      expect(error.registryType).toBe('TestRegistry');
      expect(error.context).toBeUndefined();
    });

    it('should create error with message, registryType, and context', () => {
      const context = { key: 'value', number: 42 };
      const error = new TestRegistryError('Test error message', 'TestRegistry', context);

      expect(error.message).toBe('Test error message');
      expect(error.name).toBe('TestRegistryError');
      expect(error.registryType).toBe('TestRegistry');
      expect(error.context).toEqual(context);
    });

    it('should have proper stack trace', () => {
      const error = new TestRegistryError('Test error message');

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
      expect(error.stack).toContain('TestRegistryError');
    });
  });

  describe('getDetails', () => {
    it('should return only message when no additional details', () => {
      const error = new TestRegistryError('Test error message');

      expect(error.getDetails()).toBe('Test error message');
    });

    it('should include registry type when provided', () => {
      const error = new TestRegistryError('Test error message', 'TestRegistry');

      const details = error.getDetails();
      expect(details).toContain('Test error message');
      expect(details).toContain('Registry Type: TestRegistry');
    });

    it('should include context when provided', () => {
      const context = { key: 'value', number: 42 };
      const error = new TestRegistryError('Test error message', void 0, context);

      const details = error.getDetails();
      expect(details).toContain('Test error message');
      expect(details).toContain('Context: {\n  "key": "value",\n  "number": 42\n}');
    });

    it('should include all details when all are provided', () => {
      const context = { key: 'value', number: 42 };
      const error = new TestRegistryError('Test error message', 'TestRegistry', context);

      const details = error.getDetails();
      expect(details).toContain('Test error message');
      expect(details).toContain('Registry Type: TestRegistry');
      expect(details).toContain('Context: {\n  "key": "value",\n  "number": 42\n}');
    });
  });
});

describe('RegistryCreationError', () => {
  it('should create error with correct message format', () => {
    const error = new RegistryCreationError('MyRegistry', 'Invalid configuration');

    expect(error.message).toBe("Failed to create registry of type 'MyRegistry': Invalid configuration");
    expect(error.name).toBe('RegistryCreationError');
    expect(error.registryType).toBe('MyRegistry');
    expect(error).toBeInstanceOf(RegistryError);
    expect(error).toBeInstanceOf(RegistryCreationError);
  });

  it('should include context when provided', () => {
    const context = { config: 'invalid', reason: 'missing required field' };
    const error = new RegistryCreationError('MyRegistry', 'Invalid configuration', context);

    expect(error.message).toBe("Failed to create registry of type 'MyRegistry': Invalid configuration");
    expect(error.registryType).toBe('MyRegistry');
    expect(error.context).toEqual(context);
  });

  it('should format details correctly', () => {
    const context = { config: 'invalid' };
    const error = new RegistryCreationError('MyRegistry', 'Invalid configuration', context);

    const details = error.getDetails();
    expect(details).toContain("Failed to create registry of type 'MyRegistry': Invalid configuration");
    expect(details).toContain('Registry Type: MyRegistry');
    expect(details).toContain('Context: {\n  "config": "invalid"\n}');
  });
});

describe('InvalidFactoryResultError', () => {
  it('should create error with correct message format', () => {
    const keyPath = ['level1', 'level2', 'key'];
    const factoryResult = 'invalid result';
    const error = new InvalidFactoryResultError(keyPath, factoryResult);

    expect(error.message).toBe(
      "Factory did not return a valid instance for: level1.level2.key. " +
      "Expected instance with 'coordinate' and 'registry' properties, got: string"
    );
    expect(error.name).toBe('InvalidFactoryResultError');
    expect(error.keyPath).toEqual(keyPath);
    expect(error.factoryResult).toBe(factoryResult);
    expect(error).toBeInstanceOf(RegistryError);
    expect(error).toBeInstanceOf(InvalidFactoryResultError);
  });

  it('should include registry type when provided', () => {
    const keyPath = ['key'];
    const factoryResult = null;
    const error = new InvalidFactoryResultError(keyPath, factoryResult, 'TestRegistry');

    expect(error.message).toBe(
      "Factory did not return a valid instance for: key. " +
      "Expected instance with 'coordinate' and 'registry' properties, got: object"
    );
    expect(error.registryType).toBe('TestRegistry');
    expect(error.keyPath).toEqual(keyPath);
    expect(error.factoryResult).toBe(factoryResult);
  });

  it('should handle empty key path', () => {
    const keyPath: string[] = [];
    const factoryResult = void 0;
    const error = new InvalidFactoryResultError(keyPath, factoryResult);

    expect(error.message).toBe(
      "Factory did not return a valid instance for: . " +
      "Expected instance with 'coordinate' and 'registry' properties, got: undefined"
    );
    expect(error.keyPath).toEqual([]);
  });

  it('should handle single key in path', () => {
    const keyPath = ['singleKey'];
    const factoryResult = 42;
    const error = new InvalidFactoryResultError(keyPath, factoryResult);

    expect(error.message).toBe(
      "Factory did not return a valid instance for: singleKey. " +
      "Expected instance with 'coordinate' and 'registry' properties, got: number"
    );
    expect(error.keyPath).toEqual(['singleKey']);
  });

  it('should include context with correct structure', () => {
    const keyPath = ['test', 'key'];
    const factoryResult = { invalid: 'object' };
    const error = new InvalidFactoryResultError(keyPath, factoryResult);

    expect(error.context).toEqual({
      keyPath: ['test', 'key'],
      factoryResult: 'object'
    });
  });
});

describe('InvalidInstanceRegistrationError', () => {
  it('should create error with correct message format', () => {
    const keyPath = ['level1', 'level2', 'key'];
    const attemptedRegistration = 'invalid registration';
    const error = new InvalidInstanceRegistrationError(keyPath, attemptedRegistration);

    expect(error.message).toBe(
      "Attempting to register a non-instance: level1.level2.key. " +
      "Expected instance with 'coordinate' and 'registry' properties, got: string"
    );
    expect(error.name).toBe('InvalidInstanceRegistrationError');
    expect(error.keyPath).toEqual(keyPath);
    expect(error.attemptedRegistration).toBe(attemptedRegistration);
    expect(error).toBeInstanceOf(RegistryError);
    expect(error).toBeInstanceOf(InvalidInstanceRegistrationError);
  });

  it('should include registry type when provided', () => {
    const keyPath = ['key'];
    const attemptedRegistration = null;
    const error = new InvalidInstanceRegistrationError(keyPath, attemptedRegistration, 'TestRegistry');

    expect(error.message).toBe(
      "Attempting to register a non-instance: key. " +
      "Expected instance with 'coordinate' and 'registry' properties, got: object"
    );
    expect(error.registryType).toBe('TestRegistry');
    expect(error.keyPath).toEqual(keyPath);
    expect(error.attemptedRegistration).toBe(attemptedRegistration);
  });

  it('should handle empty key path', () => {
    const keyPath: string[] = [];
    const attemptedRegistration = void 0;
    const error = new InvalidInstanceRegistrationError(keyPath, attemptedRegistration);

    expect(error.message).toBe(
      "Attempting to register a non-instance: . " +
      "Expected instance with 'coordinate' and 'registry' properties, got: undefined"
    );
    expect(error.keyPath).toEqual([]);
  });

  it('should handle single key in path', () => {
    const keyPath = ['singleKey'];
    const attemptedRegistration = false;
    const error = new InvalidInstanceRegistrationError(keyPath, attemptedRegistration);

    expect(error.message).toBe(
      "Attempting to register a non-instance: singleKey. " +
      "Expected instance with 'coordinate' and 'registry' properties, got: boolean"
    );
    expect(error.keyPath).toEqual(['singleKey']);
  });

  it('should include context with correct structure', () => {
    const keyPath = ['test', 'key'];
    const attemptedRegistration = { invalid: 'object' };
    const error = new InvalidInstanceRegistrationError(keyPath, attemptedRegistration);

    expect(error.context).toEqual({
      keyPath: ['test', 'key'],
      attemptedRegistration: 'object'
    });
  });
});

describe('Error inheritance and polymorphism', () => {
  it('should maintain correct inheritance chain for RegistryCreationError', () => {
    const error = new RegistryCreationError('TestType', 'Test reason');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(RegistryError);
    expect(error).toBeInstanceOf(RegistryCreationError);
  });

  it('should maintain correct inheritance chain for InvalidFactoryResultError', () => {
    const error = new InvalidFactoryResultError(['key'], 'result');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(RegistryError);
    expect(error).toBeInstanceOf(InvalidFactoryResultError);
  });

  it('should maintain correct inheritance chain for InvalidInstanceRegistrationError', () => {
    const error = new InvalidInstanceRegistrationError(['key'], 'registration');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(RegistryError);
    expect(error).toBeInstanceOf(InvalidInstanceRegistrationError);
  });

  it('should allow catching with base RegistryError', () => {
    const errors = [
      new RegistryCreationError('Type', 'Reason'),
      new InvalidFactoryResultError(['key'], 'result'),
      new InvalidInstanceRegistrationError(['key'], 'registration')
    ];

    errors.forEach(error => {
      expect(error).toBeInstanceOf(RegistryError);
      expect(typeof error.getDetails()).toBe('string');
    });
  });
});

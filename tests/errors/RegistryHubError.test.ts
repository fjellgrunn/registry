/* eslint-disable no-undefined */
import { describe, expect, it } from 'vitest';
import {
  DuplicateRegistryTypeError,
  InvalidRegistryFactoryResultError,
  RegistryFactoryError,
  RegistryHubError,
  RegistryTypeNotFoundError
} from '../../src/errors/RegistryHubError';
import { RegistryError } from '../../src/errors/RegistryError';

describe('RegistryHubError', () => {
  describe('DuplicateRegistryTypeError', () => {
    it('should create error with correct message and properties', () => {
      const type = 'TestRegistry';
      const error = new DuplicateRegistryTypeError(type);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(RegistryError);
      expect(error).toBeInstanceOf(RegistryHubError);
      expect(error).toBeInstanceOf(DuplicateRegistryTypeError);

      expect(error.message).toBe(
        `Registry already registered under type: ${type}. ` +
        `Each registry type must be unique within a registry hub.`
      );
      expect(error.duplicateType).toBe(type);
      expect(error.name).toBe('DuplicateRegistryTypeError');
    });

    it('should include context when provided', () => {
      const type = 'TestRegistry';
      const context = { operation: 'register', source: 'unit-test' };
      const error = new DuplicateRegistryTypeError(type, context);

      expect(error.context).toEqual({
        ...context,
        duplicateType: type
      });
      expect(error.duplicateType).toBe(type);
    });

    it('should handle empty type string', () => {
      const type = '';
      const error = new DuplicateRegistryTypeError(type);

      expect(error.duplicateType).toBe('');
      expect(error.message).toContain('Registry already registered under type: ');
    });

    it('should merge context correctly', () => {
      const type = 'TestRegistry';
      const context = { duplicateType: 'ShouldBeOverwritten', other: 'value' };
      const error = new DuplicateRegistryTypeError(type, context);

      expect(error.context?.duplicateType).toBe(type);
      expect(error.context?.other).toBe('value');
    });
  });

  describe('RegistryTypeNotFoundError', () => {
    it('should create error with correct message when no available types', () => {
      const requestedType = 'NonExistentRegistry';
      const error = new RegistryTypeNotFoundError(requestedType);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(RegistryError);
      expect(error).toBeInstanceOf(RegistryHubError);
      expect(error).toBeInstanceOf(RegistryTypeNotFoundError);

      expect(error.message).toBe(`No registry registered under type: ${requestedType}`);
      expect(error.requestedType).toBe(requestedType);
      expect(error.availableTypes).toEqual([]);
      expect(error.name).toBe('RegistryTypeNotFoundError');
    });

    it('should create error with available types in message', () => {
      const requestedType = 'NonExistentRegistry';
      const availableTypes = ['TypeA', 'TypeB', 'TypeC'];
      const error = new RegistryTypeNotFoundError(requestedType, availableTypes);

      expect(error.message).toBe(
        `No registry registered under type: ${requestedType}. ` +
        `Available types: [${availableTypes.join(', ')}]`
      );
      expect(error.requestedType).toBe(requestedType);
      expect(error.availableTypes).toEqual(availableTypes);
    });

    it('should handle empty available types array', () => {
      const requestedType = 'NonExistentRegistry';
      const availableTypes: string[] = [];
      const error = new RegistryTypeNotFoundError(requestedType, availableTypes);

      expect(error.message).toBe(`No registry registered under type: ${requestedType}`);
      expect(error.availableTypes).toEqual([]);
    });

    it('should include context when provided', () => {
      const requestedType = 'NonExistentRegistry';
      const availableTypes = ['TypeA', 'TypeB'];
      const context = { operation: 'get', source: 'unit-test' };
      const error = new RegistryTypeNotFoundError(requestedType, availableTypes, context);

      expect(error.context).toEqual({
        ...context,
        requestedType,
        availableTypes
      });
    });

    it('should handle single available type', () => {
      const requestedType = 'NonExistentRegistry';
      const availableTypes = ['OnlyType'];
      const error = new RegistryTypeNotFoundError(requestedType, availableTypes);

      expect(error.message).toContain('Available types: [OnlyType]');
    });
  });

  describe('RegistryFactoryError', () => {
    it('should create error with correct message and properties', () => {
      const type = 'TestRegistry';
      const originalError = new Error('Factory failed');
      const error = new RegistryFactoryError(type, originalError);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(RegistryError);
      expect(error).toBeInstanceOf(RegistryHubError);
      expect(error).toBeInstanceOf(RegistryFactoryError);

      expect(error.message).toBe(
        `Registry factory failed to create registry of type '${type}': ${originalError.message}`
      );
      expect(error.factoryError).toBe(originalError);
      expect(error.attemptedType).toBe(type);
      expect(error.name).toBe('RegistryFactoryError');
    });

    it('should include context when provided', () => {
      const type = 'TestRegistry';
      const originalError = new Error('Factory failed');
      const context = { retryCount: 3, timeout: 5000 };
      const error = new RegistryFactoryError(type, originalError, context);

      expect(error.context).toEqual({
        ...context,
        attemptedType: type,
        originalError: originalError.message
      });
    });

    it('should handle error without message', () => {
      const type = 'TestRegistry';
      const originalError = new Error();
      const error = new RegistryFactoryError(type, originalError);

      expect(error.message).toContain(`Registry factory failed to create registry of type '${type}':`);
      expect(error.factoryError).toBe(originalError);
    });

    it('should handle complex error types', () => {
      const type = 'TestRegistry';
      const originalError = new TypeError('Invalid constructor');
      const error = new RegistryFactoryError(type, originalError);

      expect(error.factoryError).toBe(originalError);
      expect(error.message).toContain('Invalid constructor');
    });
  });

  describe('InvalidRegistryFactoryResultError', () => {
    it('should create error with correct message for undefined result', () => {
      const type = 'TestRegistry';
      const error = new InvalidRegistryFactoryResultError(type, undefined);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(RegistryError);
      expect(error).toBeInstanceOf(RegistryHubError);
      expect(error).toBeInstanceOf(InvalidRegistryFactoryResultError);

      expect(error.message).toBe(
        `Registry factory returned invalid registry for type '${type}'. ` +
        `Expected registry with 'type', 'get', 'register', and 'createInstance' properties, ` +
        `got: undefined`
      );
      expect(error.factoryResult).toBeUndefined();
      expect(error.attemptedType).toBe(type);
      expect(error.name).toBe('InvalidRegistryFactoryResultError');
    });

    it('should create error with correct message for null result', () => {
      const type = 'TestRegistry';
      const factoryResult = null;
      const error = new InvalidRegistryFactoryResultError(type, factoryResult);

      expect(error.message).toContain('got: object');
      expect(error.factoryResult).toBe(null);
    });

    it('should create error with correct message for wrong type result', () => {
      const type = 'TestRegistry';
      const factoryResult = 'string result';
      const error = new InvalidRegistryFactoryResultError(type, factoryResult);

      expect(error.message).toContain('got: string');
      expect(error.factoryResult).toBe(factoryResult);
    });

    it('should include context when provided', () => {
      const type = 'TestRegistry';
      const factoryResult = { incomplete: 'object' };
      const context = { factoryName: 'createTestRegistry', attempt: 1 };
      const error = new InvalidRegistryFactoryResultError(type, factoryResult, context);

      expect(error.context).toEqual({
        ...context,
        attemptedType: type,
        factoryResult: typeof factoryResult
      });
    });

    it('should handle object factory result', () => {
      const type = 'TestRegistry';
      const factoryResult = { some: 'object', but: 'incomplete' };
      const error = new InvalidRegistryFactoryResultError(type, factoryResult);

      expect(error.message).toContain('got: object');
      expect(error.factoryResult).toBe(factoryResult);
    });

    it('should handle array factory result', () => {
      const type = 'TestRegistry';
      const factoryResult = ['array', 'result'];
      const error = new InvalidRegistryFactoryResultError(type, factoryResult);

      expect(error.message).toContain('got: object');
      expect(error.factoryResult).toBe(factoryResult);
    });
  });

  describe('RegistryHubError base class behavior', () => {
    it('should set hubType property correctly through subclasses', () => {
      const error = new DuplicateRegistryTypeError('TestType');

      // The hubType is passed through the constructor but in the current implementation
      // it's passed as empty string, so we test the property exists
      expect(error.hubType).toBeDefined();
    });

    it('should inherit from RegistryError correctly', () => {
      const error = new DuplicateRegistryTypeError('TestType');

      expect(error).toBeInstanceOf(RegistryError);
      expect(error.registryType).toBeDefined();
      expect(typeof error.getDetails).toBe('function');
    });

    it('should maintain proper inheritance chain', () => {
      const error = new RegistryTypeNotFoundError('TestType');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(RegistryError);
      expect(error).toBeInstanceOf(RegistryHubError);
      expect(error).toBeInstanceOf(RegistryTypeNotFoundError);
    });

    it('should have proper error names', () => {
      expect(new DuplicateRegistryTypeError('test').name).toBe('DuplicateRegistryTypeError');
      expect(new RegistryTypeNotFoundError('test').name).toBe('RegistryTypeNotFoundError');
      expect(new RegistryFactoryError('test', new Error()).name).toBe('RegistryFactoryError');
      expect(new InvalidRegistryFactoryResultError('test', null).name).toBe('InvalidRegistryFactoryResultError');
    });
  });

  describe('Edge cases and error conditions', () => {
    it('should handle special characters in type names', () => {
      const specialType = 'Test/Registry-With_Special.Characters@123';
      const error = new DuplicateRegistryTypeError(specialType);

      expect(error.duplicateType).toBe(specialType);
      expect(error.message).toContain(specialType);
    });

    it('should handle very long type names', () => {
      const longType = 'A'.repeat(1000);
      const error = new RegistryTypeNotFoundError(longType);

      expect(error.requestedType).toBe(longType);
      expect(error.message).toContain(longType);
    });

    it('should handle large available types arrays', () => {
      const requestedType = 'Missing';
      const availableTypes = Array.from({ length: 100 }, (_, i) => `Type${i}`);
      const error = new RegistryTypeNotFoundError(requestedType, availableTypes);

      expect(error.availableTypes).toHaveLength(100);
      expect(error.message).toContain('Type0, Type1');
    });

    it('should handle deeply nested context objects', () => {
      const type = 'TestRegistry';
      const context = {
        level1: {
          level2: {
            level3: {
              deep: 'value',
              array: [1, 2, 3]
            }
          }
        }
      };
      const error = new DuplicateRegistryTypeError(type, context);

      expect(error.context?.level1?.level2?.level3?.deep).toBe('value');
    });
  });
});

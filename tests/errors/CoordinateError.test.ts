import { describe, expect, test } from 'vitest';
import {
  CoordinateError,
  InvalidCoordinateError,
  InvalidKTAError,
  InvalidScopesError
} from '../../src/errors/CoordinateError';
import { RegistryError } from '../../src/errors/RegistryError';

// Concrete implementation of abstract CoordinateError for testing
class TestCoordinateError extends CoordinateError {
  constructor(message: string, kta?: any, scopes?: string[], context?: Record<string, any>) {
    super(message, kta, scopes, context);
  }
}

describe('CoordinateError', () => {
  describe('abstract CoordinateError class', () => {
    test('should extend RegistryError', () => {
      const error = new TestCoordinateError('test message');
      expect(error).toBeInstanceOf(RegistryError);
      expect(error).toBeInstanceOf(CoordinateError);
      expect(error).toBeInstanceOf(Error);
    });

    test('should set basic properties correctly', () => {
      const message = 'Test coordinate error';
      const error = new TestCoordinateError(message);

      expect(error.message).toBe(message);
      expect(error.name).toBe('TestCoordinateError');
      expect(error.kta).toBeUndefined();
      expect(error.scopes).toBeUndefined();
    });

    test('should set kta and scopes when provided', () => {
      const message = 'Test error';
      const kta = ['test', 'key'];
      const scopes = ['scope1', 'scope2'];
      const context = { test: 'value' };

      const error = new TestCoordinateError(message, kta, scopes, context);

      expect(error.kta).toEqual(kta);
      expect(error.scopes).toEqual(scopes);
      expect(error.context).toMatchObject({
        test: 'value',
        kta: kta,
        scopes: scopes
      });
    });

    test('should handle null/undefined kta and scopes', () => {
      const error = new TestCoordinateError('test', null);

      expect(error.kta).toBeNull();
      expect(error.scopes).not.toBeDefined();
    });
  });

  describe('InvalidCoordinateError', () => {
    test('should create error with proper message format', () => {
      const kta = ['user', 'profile'];
      const scopes = ['read', 'write'];
      const reason = 'missing required field';

      const error = new InvalidCoordinateError(kta, scopes, reason);

      expect(error.message).toBe(
        'Invalid coordinate parameters: missing required field. ' +
        'KTA: ["user","profile"], Scopes: [read, write]'
      );
    });

    test('should set properties correctly', () => {
      const kta = 'simple';
      const scopes = ['admin'];
      const reason = 'invalid type';
      const context = { extra: 'data' };

      const error = new InvalidCoordinateError(kta, scopes, reason, context);

      expect(error.kta).toBe(kta);
      expect(error.scopes).toEqual(scopes);
      expect(error.context).toMatchObject({
        extra: 'data',
        reason: 'invalid type',
        kta: 'simple',
        scopes: ['admin']
      });
    });

    test('should handle empty scopes array', () => {
      const kta = ['test'];
      const scopes: string[] = [];
      const reason = 'empty scopes';

      const error = new InvalidCoordinateError(kta, scopes, reason);

      expect(error.message).toContain('Scopes: []');
      expect(error.scopes).toEqual([]);
    });

    test('should handle complex KTA objects', () => {
      const kta = { type: 'user', id: 123 };
      const scopes = ['read'];
      const reason = 'object kta not supported';

      const error = new InvalidCoordinateError(kta, scopes, reason);

      expect(error.message).toContain('KTA: {"type":"user","id":123}');
      expect(error.kta).toEqual(kta);
    });
  });

  describe('InvalidKTAError', () => {
    test('should create error with proper message format for non-string/array KTA', () => {
      const kta = 123;
      const reason = 'numeric value not allowed';

      const error = new InvalidKTAError(kta, reason);

      expect(error.message).toBe(
        'Invalid KTA (Key Type Array): numeric value not allowed. ' +
        'Expected string or array of strings, got: 123'
      );
    });

    test('should set properties correctly', () => {
      const kta = { invalid: 'object' };
      const reason = 'object type not supported';
      const context = { source: 'user input' };

      const error = new InvalidKTAError(kta, reason, context);

      expect(error.kta).toEqual(kta);
      expect(error.scopes).toEqual([]);
      expect(error.context).toMatchObject({
        source: 'user input',
        reason: 'object type not supported',
        kta: { invalid: 'object' },
        scopes: []
      });
    });

    test('should handle null KTA', () => {
      const kta = null;
      const reason = 'null value not allowed';

      const error = new InvalidKTAError(kta, reason);

      expect(error.message).toContain('got: null');
      expect(error.kta).toBeNull();
    });

    test('should handle undefined KTA', () => {
      const reason = 'undefined value not allowed';

      const error = new InvalidKTAError(void 0, reason);

      expect(error.message).toContain('got: undefined');
      expect(error.kta).not.toBeDefined();
    });

    test('should handle function KTA', () => {
      const kta = () => 'test';
      const reason = 'function not allowed';

      const error = new InvalidKTAError(kta, reason);

      expect(error.message).toContain('function not allowed');
      expect(error.kta).toBe(kta);
    });
  });

  describe('InvalidScopesError', () => {
    test('should create error with proper message format', () => {
      const scopes = ['read', 123, 'write', null];
      const invalidScopes = [123, null];
      const reason = 'non-string values found';

      const error = new InvalidScopesError(scopes, invalidScopes, reason);

      expect(error.message).toBe(
        'Invalid scopes: non-string values found. ' +
        'Invalid scope values: [123,null]'
      );
    });

    test('should set properties correctly', () => {
      const scopes = ['admin', 42, 'user'];
      const invalidScopes = [42];
      const reason = 'numeric scope not allowed';
      const context = { validation: 'strict' };

      const error = new InvalidScopesError(scopes, invalidScopes, reason, context);

      expect(error.scopes).toEqual(['admin', 'user']); // Only string values
      expect(error.invalidScopes).toEqual([42]);
      expect(error.context).toMatchObject({
        validation: 'strict',
        reason: 'numeric scope not allowed',
        invalidScopes: [42],
        kta: null,
        scopes: ['admin', 'user']
      });
    });

    test('should handle all invalid scopes', () => {
      const scopes = [123, null, void 0, {}];
      const invalidScopes = [123, null, void 0, {}];
      const reason = 'all scopes invalid';

      const error = new InvalidScopesError(scopes, invalidScopes, reason);

      expect(error.scopes).toEqual([]); // No valid string scopes
      expect(error.invalidScopes).toEqual(invalidScopes);
    });

    test('should handle mixed valid and invalid scopes', () => {
      const scopes = ['read', 'write', 123, 'admin', null, 'delete'];
      const invalidScopes = [123, null];
      const reason = 'mixed scope types';

      const error = new InvalidScopesError(scopes, invalidScopes, reason);

      expect(error.scopes).toEqual(['read', 'write', 'admin', 'delete']);
      expect(error.invalidScopes).toEqual([123, null]);
    });

    test('should handle empty arrays', () => {
      const scopes: any[] = [];
      const invalidScopes: any[] = [];
      const reason = 'empty scopes array';

      const error = new InvalidScopesError(scopes, invalidScopes, reason);

      expect(error.scopes).toEqual([]);
      expect(error.invalidScopes).toEqual([]);
      expect(error.message).toContain('Invalid scope values: []');
    });
  });

  describe('Error inheritance and behavior', () => {
    test('all errors should be instances of Error and RegistryError', () => {
      const invalidCoordError = new InvalidCoordinateError(['test'], ['scope'], 'reason');
      const invalidKTAError = new InvalidKTAError('test', 'reason');
      const invalidScopesError = new InvalidScopesError(['test'], [], 'reason');

      [invalidCoordError, invalidKTAError, invalidScopesError].forEach(error => {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(RegistryError);
        expect(error).toBeInstanceOf(CoordinateError);
      });
    });

    test('all errors should have proper stack traces', () => {
      const error = new InvalidCoordinateError(['test'], ['scope'], 'reason');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('InvalidCoordinateError');
    });

    test('all errors should have correct names', () => {
      const invalidCoordError = new InvalidCoordinateError(['test'], ['scope'], 'reason');
      const invalidKTAError = new InvalidKTAError('test', 'reason');
      const invalidScopesError = new InvalidScopesError(['test'], [], 'reason');

      expect(invalidCoordError.name).toBe('InvalidCoordinateError');
      expect(invalidKTAError.name).toBe('InvalidKTAError');
      expect(invalidScopesError.name).toBe('InvalidScopesError');
    });
  });
});

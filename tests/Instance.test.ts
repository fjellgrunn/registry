/* eslint-disable no-undefined */
import { describe, expect, test, vi } from 'vitest';
import { createInstance, isInstance } from '@/Instance';
import { Registry } from '@/Registry';
import { Coordinate } from '@/Coordinate';

vi.mock('@fjell/logging', () => {
  const logger = {
    get: vi.fn().mockReturnThis(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    emergency: vi.fn(),
    alert: vi.fn(),
    critical: vi.fn(),
    notice: vi.fn(),
    time: vi.fn().mockReturnThis(),
    end: vi.fn(),
    log: vi.fn(),
  };

  return {
    default: {
      getLogger: () => logger,
    }
  }
});

describe('Instance', () => {
  describe('createInstance', () => {
    test('should create instance with definition and operations', () => {
      const mockCoordinate = {} as Coordinate<'test'>;
      const mockRegistry = {} as Registry;

      const instance = createInstance(mockCoordinate, mockRegistry);

      expect(instance).toBeDefined();
      expect(instance.coordinate).toBe(mockCoordinate);
      expect(instance.registry).toBe(mockRegistry);
    });
  });

  describe('isInstance', () => {
    test('should return true for valid instance', () => {
      const mockInstance = {
        coordinate: {},
        registry: {}
      };

      expect(isInstance(mockInstance)).toBe(true);
    });

    test('should return false for invalid instance', () => {
      const mockInvalidInstance = {
        definition: undefined,
        operations: {}
      };

      expect(isInstance(mockInvalidInstance)).toBe(false);
    });

    test('should return false for non-object', () => {
      expect(isInstance(null)).toBe(false);
      expect(isInstance(undefined)).toBe(false);
      expect(isInstance('not an instance')).toBe(false);
    });
  });
});

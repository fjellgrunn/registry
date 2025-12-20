import { describe, expect, test, vi } from 'vitest';
import { createCoordinate } from '@fjell/core';
import { ItemTypeArray } from "@fjell/types";

vi.mock('../src/logger', () => ({
  default: {
    get: vi.fn(() => ({
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
    })),
  }
}));

describe('Coordinate', () => {
  describe('createCoordinate', () => {
    test('should create coordinate with single type array and empty scopes', () => {
      const kta = ['test'] as ItemTypeArray<'test'>;
      const scopes: string[] = [];

      const coordinate = createCoordinate(kta, scopes);

      expect(coordinate).toBeDefined();
      expect(coordinate.kta).toEqual(kta);
      expect(coordinate.scopes).toEqual(scopes);
    });

    test('should create coordinate with multiple type arrays and scopes', () => {
      const kta = ['test', 'other'] as ItemTypeArray<'test', 'other'>;
      const scopes = ['scope1', 'scope2'];

      const coordinate = createCoordinate(kta, scopes);

      expect(coordinate).toBeDefined();
      expect(coordinate.kta).toEqual(kta);
      expect(coordinate.scopes).toEqual(scopes);
    });

    test('should create coordinate with single string parameter', () => {
      const kta = 'test';
      const scopes = ['scope1'];

      const coordinate = createCoordinate(kta, scopes);

      expect(coordinate).toBeDefined();
      expect(coordinate.kta).toEqual(['test']);
      expect(coordinate.scopes).toEqual(scopes);
    });

    test('toString should return formatted string representation', () => {
      const kta = ['test', 'other'] as ItemTypeArray<'test', 'other'>;
      const scopes = ['scope1', 'scope2'];

      const coordinate = createCoordinate(kta, scopes);
      const expected = 'test, other - scope1, scope2';

      expect(coordinate.toString()).toBe(expected);
    });

    test('toString should handle empty scopes correctly', () => {
      const kta = ['test'] as ItemTypeArray<'test'>;
      const scopes: string[] = [];

      const coordinate = createCoordinate(kta, scopes);
      const expected = 'test - ';

      expect(coordinate.toString()).toBe(expected);
    });

    test('toString should work with createCoordinate variations', () => {
      const kta = ['test'] as ItemTypeArray<'test'>;
      const scopes = ['scope1'];

      const coordinate = createCoordinate(kta, scopes);

      coordinate.toString();

      // Just ensure it doesn't throw
      expect(coordinate.toString()).toBeTruthy();
    });

    test('createCoordinate should work with default scopes', () => {
      const kta = ['test'] as ItemTypeArray<'test'>;

      const coordinate = createCoordinate(kta);

      expect(coordinate.scopes).toEqual([]);
    });
  });
});

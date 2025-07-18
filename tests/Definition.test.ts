import { describe, expect, test, vi } from 'vitest';
import { createCoordinate } from "@/Coordinate";
import { createDefinition } from "@/Definition";

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

describe('Definition', () => {

  describe('createDefinition', () => {
    const mockCoordinate = createCoordinate(['test'], ['scope1', 'scope2']);

    test('should create definition with coordinate and default options when no options provided', () => {
      const definition = createDefinition<'test', 'loc1', 'loc2'>(mockCoordinate);

      expect(definition.coordinate).toBe(mockCoordinate);
    });

    test('should create definition with provided options', () => {

      const definition = createDefinition<'test', 'loc1', 'loc2'>(
        mockCoordinate
      );

      expect(definition.coordinate).toBe(mockCoordinate);
    });

    test('should merge provided options with default options', () => {

      const definition = createDefinition<'test', 'loc1', 'loc2'>(
        mockCoordinate
      );

      expect(definition.coordinate).toBe(mockCoordinate);
    });
  });
});

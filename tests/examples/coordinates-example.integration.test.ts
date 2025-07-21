import { describe, expect, it } from 'vitest';
import { runCoordinatesExample } from '../../examples/coordinates-example';
import { expectNoErrors, getLogOutput, setupConsoleCapture } from './test-helpers';

describe('Coordinates Example Integration Tests', () => {
  const testConsole = setupConsoleCapture();

  describe('Coordinates Discovery Example', () => {
    it('should run coordinates discovery example without errors', async () => {
      await expect(runCoordinatesExample()).resolves.not.toThrow();

      // Verify expected output
      const logOutput = getLogOutput(testConsole);
      expect(logOutput).toContain('Registry Coordinates Discovery Example');
      expect(logOutput).toContain('Total registered coordinates: 6');
      expect(logOutput).toContain('Coordinates discovery example completed');

      // Should have no errors
      expectNoErrors(testConsole);
    });

    it('should demonstrate getCoordinates functionality', async () => {
      const result = await runCoordinatesExample();

      // Verify return structure
      expect(result.totalCoordinates).toBe(6);
      expect(result.coordinates).toHaveLength(6);
      expect(result.byEnvironment).toBeDefined();
      expect(result.byServiceType).toBeDefined();

      const logOutput = getLogOutput(testConsole);
      expect(logOutput).toContain('Discovering all registered coordinates');
      expect(logOutput).toContain('Registered Coordinates:');
    });

    it('should show coordinate analysis and grouping', async () => {
      const result = await runCoordinatesExample();

      const logOutput = getLogOutput(testConsole);

      // Verify coordinate analysis output
      expect(logOutput).toContain('Analyzing coordinate patterns');
      expect(logOutput).toContain('Coordinates by Environment');
      expect(logOutput).toContain('Coordinates by Service Type');

      // Verify environment groupings
      expect(result.byEnvironment.production).toHaveLength(3); // database, cache, logging
      expect(result.byEnvironment.development).toHaveLength(3); // database, cache, logging
      expect(result.byEnvironment.testing).toHaveLength(1); // memory cache

      // Verify service type groupings
      expect(result.byServiceType.database).toHaveLength(2); // postgres, sqlite
      expect(result.byServiceType.cache).toHaveLength(2); // redis, memory
      expect(result.byServiceType.logging).toHaveLength(2); // production, development
    });

    it('should demonstrate practical usage scenarios', async () => {
      await runCoordinatesExample();

      const logOutput = getLogOutput(testConsole);

      // Verify practical scenarios are shown
      expect(logOutput).toContain('Practical usage scenarios');
      expect(logOutput).toContain('Health Check Example');
      expect(logOutput).toContain('Environment Validation');
      expect(logOutput).toContain('Service Discovery Example');

      // Verify specific expected services are checked
      expect(logOutput).toContain('database: ✅ Registered');
      expect(logOutput).toContain('cache: ✅ Registered');
      expect(logOutput).toContain('logging: ✅ Registered');
    });

    it('should show detailed coordinate information', async () => {
      const result = await runCoordinatesExample();

      const logOutput = getLogOutput(testConsole);

      // Verify coordinate details are shown
      expect(logOutput).toContain('Key Path:');
      expect(logOutput).toContain('Scopes:');

      // Verify all expected coordinates exist
      const coordinateStrings = result.coordinates.map(c => c.toString());

      // Check for database coordinates
      expect(coordinateStrings.some(c => c.includes('database') && c.includes('production'))).toBe(true);
      expect(coordinateStrings.some(c => c.includes('database') && c.includes('development'))).toBe(true);

      // Check for cache coordinates
      expect(coordinateStrings.some(c => c.includes('cache') && c.includes('redis'))).toBe(true);
      expect(coordinateStrings.some(c => c.includes('cache') && c.includes('memory'))).toBe(true);

      // Check for logging coordinates
      expect(coordinateStrings.some(c => c.includes('logging') && c.includes('production'))).toBe(true);
      expect(coordinateStrings.some(c => c.includes('logging') && c.includes('development'))).toBe(true);
    });

    it('should demonstrate scope-based filtering', async () => {
      const result = await runCoordinatesExample();

      const logOutput = getLogOutput(testConsole);

      // Verify environment analysis shows proper counts
      expect(logOutput).toContain('Production environment has 3 service(s) registered');
      expect(logOutput).toContain('Development environment has 3 service(s) registered');

      // Verify scope filtering works correctly
      const productionCoords = result.coordinates.filter(c => c.scopes.includes('production'));
      const developmentCoords = result.coordinates.filter(c => c.scopes.includes('development'));
      const testingCoords = result.coordinates.filter(c => c.scopes.includes('testing'));

      expect(productionCoords).toHaveLength(3);
      expect(developmentCoords).toHaveLength(3);
      expect(testingCoords).toHaveLength(1);
    });

    it('should show service discovery capabilities', async () => {
      await runCoordinatesExample();

      const logOutput = getLogOutput(testConsole);

      // Verify cache service discovery example
      expect(logOutput).toContain('Available cache services:');
      expect(logOutput).toContain('cache.redis');
      expect(logOutput).toContain('cache.memory');
    });
  });
});

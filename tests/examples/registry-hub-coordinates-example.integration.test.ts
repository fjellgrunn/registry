import { describe, expect, it } from 'vitest';
import { runRegistryHubCoordinatesExample } from '../../examples/registry-hub-coordinates-example';
import { expectNoErrors, getLogOutput, setupConsoleCapture } from './test-helpers';

describe('RegistryHub Coordinates Example Integration Tests', () => {
  const testConsole = setupConsoleCapture();

  describe('RegistryHub Coordinates Discovery Example', () => {
    it('should run RegistryHub coordinates discovery example without errors', async () => {
      await expect(runRegistryHubCoordinatesExample()).resolves.not.toThrow();

      // Verify expected output
      const logOutput = getLogOutput(testConsole);
      expect(logOutput).toContain('RegistryHub Coordinates Discovery Example');
      expect(logOutput).toContain('Total coordinates discovered: 11');
      expect(logOutput).toContain('RegistryHub coordinates discovery example completed');

      // Should have no errors
      expectNoErrors(testConsole);
    });

    it('should demonstrate getAllCoordinates functionality across multiple registries', async () => {
      const result = await runRegistryHubCoordinatesExample();

      // Verify return structure
      expect(result.totalCoordinates).toBe(11);
      expect(result.registryTypes).toHaveLength(4);
      expect(result.allCoordinates).toHaveLength(11);
      expect(result.coordinatesByRegistry).toBeDefined();

      const logOutput = getLogOutput(testConsole);
      expect(logOutput).toContain('Discovering all coordinates across the entire system');
      expect(logOutput).toContain('All Registered Coordinates by Registry Type');
    });

    it('should register services across multiple registry types', async () => {
      const result = await runRegistryHubCoordinatesExample();

      // Verify we have the expected registry types
      expect(result.registryTypes).toContain('auth');
      expect(result.registryTypes).toContain('data');
      expect(result.registryTypes).toContain('cache');
      expect(result.registryTypes).toContain('integrations');

      // Verify coordinates are distributed across registries
      const authCoords = result.allCoordinates.filter(c => c.registryType === 'auth');
      const dataCoords = result.allCoordinates.filter(c => c.registryType === 'data');
      const cacheCoords = result.allCoordinates.filter(c => c.registryType === 'cache');
      const integrationCoords = result.allCoordinates.filter(c => c.registryType === 'integrations');

      expect(authCoords).toHaveLength(3); // JWT, SAML, Local auth
      expect(dataCoords).toHaveLength(3); // User repos, Order repo
      expect(cacheCoords).toHaveLength(3); // Session, Query, Memory caches
      expect(integrationCoords).toHaveLength(2); // Stripe, SendGrid
    });

    it('should show registry type organization', async () => {
      await runRegistryHubCoordinatesExample();

      const logOutput = getLogOutput(testConsole);

      // Verify registry type sections are shown
      expect(logOutput).toContain('AUTH REGISTRY');
      expect(logOutput).toContain('DATA REGISTRY');
      expect(logOutput).toContain('CACHE REGISTRY');
      expect(logOutput).toContain('INTEGRATIONS REGISTRY');

      // Verify specific service registrations
      expect(logOutput).toContain('JWT Auth (production) registered in auth registry');
      expect(logOutput).toContain('User Repository (Firestore/production) registered in data registry');
      expect(logOutput).toContain('Session Cache (Redis/production) registered in cache registry');
      expect(logOutput).toContain('Stripe Payment (production) registered in integrations registry');
    });

    it('should demonstrate cross-registry analysis', async () => {
      await runRegistryHubCoordinatesExample();

      const logOutput = getLogOutput(testConsole);

      // Verify cross-registry analysis sections
      expect(logOutput).toContain('Cross-Registry Architecture Analysis');
      expect(logOutput).toContain('Environment Distribution');
      expect(logOutput).toContain('Service Architecture Overview');

      // Verify environment analysis is performed
      expect(logOutput).toContain('production:');
      expect(logOutput).toContain('development:');
      expect(logOutput).toContain('testing:');
    });

    it('should show practical usage scenarios', async () => {
      await runRegistryHubCoordinatesExample();

      const logOutput = getLogOutput(testConsole);

      // Verify practical scenarios are demonstrated
      expect(logOutput).toContain('Practical Usage Scenarios');
      expect(logOutput).toContain('System Health Check');
      expect(logOutput).toContain('Production Readiness Check');
      expect(logOutput).toContain('Development Environment Check');

      // Verify specific health checks
      expect(logOutput).toContain('Auth: ✅ Available');
      expect(logOutput).toContain('Repository: ✅ Available');
      expect(logOutput).toContain('Cache: ✅ Available');
      expect(logOutput).toContain('Payment: ✅ Available');
    });

    it('should verify coordinate data structures', async () => {
      const result = await runRegistryHubCoordinatesExample();

      // Verify all coordinates have required properties
      result.allCoordinates.forEach(coordinateWithRegistry => {
        expect(coordinateWithRegistry.coordinate).toBeDefined();
        expect(coordinateWithRegistry.registryType).toBeDefined();
        expect(typeof coordinateWithRegistry.registryType).toBe('string');
        expect(coordinateWithRegistry.coordinate.kta).toBeDefined();
        expect(Array.isArray(coordinateWithRegistry.coordinate.kta)).toBe(true);
        expect(coordinateWithRegistry.coordinate.scopes).toBeDefined();
        expect(Array.isArray(coordinateWithRegistry.coordinate.scopes)).toBe(true);
      });

      // Verify specific service coordinates exist
      const coordinateStrings = result.allCoordinates.map(c => ({
        path: c.coordinate.kta.join('.'),
        registry: c.registryType,
        scopes: c.coordinate.scopes
      }));

      // Check for auth services
      expect(coordinateStrings.some(c => c.path.includes('Auth.JWT') && c.registry === 'auth')).toBe(true);
      expect(coordinateStrings.some(c => c.path.includes('Auth.SAML') && c.registry === 'auth')).toBe(true);

      // Check for data services
      expect(coordinateStrings.some(c => c.path.includes('Repository.User') && c.registry === 'data')).toBe(true);
      expect(coordinateStrings.some(c => c.path.includes('Repository.Order') && c.registry === 'data')).toBe(true);

      // Check for cache services
      expect(coordinateStrings.some(c => c.path.includes('Cache.Session') && c.registry === 'cache')).toBe(true);
      expect(coordinateStrings.some(c => c.path.includes('Cache.Query') && c.registry === 'cache')).toBe(true);

      // Check for integration services
      expect(coordinateStrings.some(c => c.path.includes('Payment.Stripe') && c.registry === 'integrations')).toBe(true);
      expect(coordinateStrings.some(c => c.path.includes('Email.SendGrid') && c.registry === 'integrations')).toBe(true);
    });

    it('should demonstrate environment-based filtering', async () => {
      const result = await runRegistryHubCoordinatesExample();

      const logOutput = getLogOutput(testConsole);

      // Verify environment analysis shows proper distribution
      expect(logOutput).toMatch(/production: \d+ service\(s\) across \d+ registry type\(s\)/);
      expect(logOutput).toMatch(/development: \d+ service\(s\) across \d+ registry type\(s\)/);

      // Verify actual environment filtering works
      const productionCoords = result.allCoordinates.filter(c => c.coordinate.scopes.includes('production'));
      const developmentCoords = result.allCoordinates.filter(c => c.coordinate.scopes.includes('development'));

      expect(productionCoords.length).toBeGreaterThan(0);
      expect(developmentCoords.length).toBeGreaterThan(0);

      // Verify production coordinates span multiple registries
      const productionRegistries = [...new Set(productionCoords.map(c => c.registryType))];
      expect(productionRegistries.length).toBeGreaterThan(1);
    });

    it('should validate registry hub functionality', async () => {
      const result = await runRegistryHubCoordinatesExample();

      const logOutput = getLogOutput(testConsole);

      // Verify RegistryHub creation and registration steps
      expect(logOutput).toContain('Creating RegistryHub and domain-specific registries');
      expect(logOutput).toContain('Registering registries in the hub');
      expect(logOutput).toContain('Registered registry types: auth, data, cache, integrations');

      // Verify coordinatesByRegistry structure
      expect(result.coordinatesByRegistry.auth).toBeDefined();
      expect(result.coordinatesByRegistry.data).toBeDefined();
      expect(result.coordinatesByRegistry.cache).toBeDefined();
      expect(result.coordinatesByRegistry.integrations).toBeDefined();

      // Verify each registry has the expected number of coordinates
      expect(result.coordinatesByRegistry.auth).toHaveLength(3);
      expect(result.coordinatesByRegistry.data).toHaveLength(3);
      expect(result.coordinatesByRegistry.cache).toHaveLength(3);
      expect(result.coordinatesByRegistry.integrations).toHaveLength(2);
    });

    it('should demonstrate service discovery across registries', async () => {
      await runRegistryHubCoordinatesExample();

      const logOutput = getLogOutput(testConsole);

      // Verify service architecture overview
      expect(logOutput).toContain('Service Architecture Overview');
      expect(logOutput).toMatch(/Auth: \d+ implementation\(s\) in auth registr/);
      expect(logOutput).toMatch(/Repository: \d+ implementation\(s\) in data registr/);
      expect(logOutput).toMatch(/Cache: \d+ implementation\(s\) in cache registr/);
      expect(logOutput).toMatch(/Payment: \d+ implementation\(s\) in integrations registr/);
    });

    it('should validate production readiness and development completeness checks', async () => {
      await runRegistryHubCoordinatesExample();

      const logOutput = getLogOutput(testConsole);

      // Verify production readiness check
      expect(logOutput).toContain('Production Readiness Check');
      expect(logOutput).toMatch(/Total production services: \d+/);

      // Verify development environment check
      expect(logOutput).toContain('Development Environment Check');
      expect(logOutput).toMatch(/Development services available: \d+/);

      // Should show either missing dev services or confirmation that all are available
      expect(logOutput).toMatch(/(Missing development equivalents|All production services have development equivalents)/);
    });
  });
});

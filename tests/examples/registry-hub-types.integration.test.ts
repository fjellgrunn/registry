import { describe, expect, it } from 'vitest';
import registryHubTypesExample from '../../examples/registry-hub-types';
import { expectNoErrors, getLogOutput, setupConsoleCapture } from './test-helpers';

describe('Registry Hub Types Example Integration Tests', () => {
  const testConsole = setupConsoleCapture();

  describe('Basic Functionality', () => {
    it('should run registry hub types example without errors', async () => {
      await expect(registryHubTypesExample.demonstrateRegistryHub()).resolves.not.toThrow();

      // Verify the example completed successfully
      const logOutput = getLogOutput(testConsole);
      expect(logOutput).toContain('RegistryHub example completed successfully');
      expect(logOutput).toContain('Key Benefits Demonstrated');

      // Should have no unhandled errors
      expectNoErrors(testConsole);
    });

    it('should demonstrate registry hub creation and management', async () => {
      await registryHubTypesExample.demonstrateRegistryHub();

      const logOutput = getLogOutput(testConsole);

      // Verify registry hub setup
      expect(logOutput).toContain('Creating RegistryHub');
      expect(logOutput).toContain('Creating specialized registries');
      expect(logOutput).toContain('Created registries: services, data, infrastructure, communication');
    });
  });

  describe('Service Type Organization', () => {
    it('should organize services by type categories', async () => {
      await registryHubTypesExample.demonstrateRegistryHub();

      const logOutput = getLogOutput(testConsole);

      // Verify different service categories
      expect(logOutput).toContain('Registering services by type and scope');

      // Check for different service implementations
      expect(logOutput).toContain('JWT Auth');
      expect(logOutput).toContain('OAuth2 Auth');
      expect(logOutput).toContain('PostgreSQL');
      expect(logOutput).toContain('MongoDB');
      expect(logOutput).toContain('Redis Cache');
      expect(logOutput).toContain('Memory Cache');
      expect(logOutput).toContain('SendGrid Email');
      expect(logOutput).toContain('SMTP Email');
    });

    it('should demonstrate environment-specific implementations', async () => {
      await registryHubTypesExample.demonstrateRegistryHub();

      const logOutput = getLogOutput(testConsole);

      // Verify environment-based switching
      expect(logOutput).toContain('PRODUCTION ENVIRONMENT');
      expect(logOutput).toContain('DEVELOPMENT ENVIRONMENT');

      // Check that different implementations are used for different environments
      expect(logOutput).toContain('JWT Auth'); // Production auth
      expect(logOutput).toContain('OAuth2 Auth'); // Development auth
      expect(logOutput).toContain('Redis Cache'); // Production cache
      expect(logOutput).toContain('Memory Cache'); // Development cache
    });
  });

  describe('Service Registry Categories', () => {
    it('should demonstrate business logic services', async () => {
      await registryHubTypesExample.demonstrateRegistryHub();

      const logOutput = getLogOutput(testConsole);

      // Verify authentication services
      expect(logOutput).toContain('JWT Auth: Logging in');
      expect(logOutput).toContain('OAuth2 Auth: Logging in');
      expect(logOutput).toContain('Production token received');
      expect(logOutput).toContain('Development token received');
    });

    it('should demonstrate data access services', async () => {
      await registryHubTypesExample.demonstrateRegistryHub();

      const logOutput = getLogOutput(testConsole);

      // Verify database services
      expect(logOutput).toContain('PostgreSQL: Finding user');
      expect(logOutput).toContain('MongoDB: Finding user');
    });

    it('should demonstrate infrastructure services', async () => {
      await registryHubTypesExample.demonstrateRegistryHub();

      const logOutput = getLogOutput(testConsole);

      // Verify caching services
      expect(logOutput).toContain('Redis Cache: Setting');
      expect(logOutput).toContain('Memory Cache: Setting');

      // Verify logging services
      expect(logOutput).toContain('FILE INFO');
      expect(logOutput).toContain('INFO:');
    });

    it('should demonstrate communication services', async () => {
      await registryHubTypesExample.demonstrateRegistryHub();

      const logOutput = getLogOutput(testConsole);

      // Verify email services
      expect(logOutput).toContain('SendGrid Email: Sending to');
      expect(logOutput).toContain('SMTP Email: Sending template');
    });
  });

  describe('Cross-Registry Service Interactions', () => {
    it('should demonstrate services working together across registries', async () => {
      await registryHubTypesExample.demonstrateRegistryHub();

      const logOutput = getLogOutput(testConsole);

      // Verify cross-registry workflow
      expect(logOutput).toContain('Cross-registry service interactions');
      expect(logOutput).toContain('Starting complex workflow');
      expect(logOutput).toContain('User authenticated for workflow');
      expect(logOutput).toContain('User data retrieved');
      expect(logOutput).toContain('User data cached');
      expect(logOutput).toContain('Retrieved user from cache');
    });

    it('should show coordinated service usage patterns', async () => {
      await registryHubTypesExample.demonstrateRegistryHub();

      const logOutput = getLogOutput(testConsole);

      // Verify that services from different registries work together
      expect(logOutput).toContain('workflow_user');
      expect(logOutput).toContain('workflow123');
      expect(logOutput).toContain('workflow:user123');
    });
  });

  describe('Registry Management Features', () => {
    it('should demonstrate registry type management', async () => {
      await registryHubTypesExample.demonstrateRegistryHub();

      const logOutput = getLogOutput(testConsole);

      // Verify registry management
      expect(logOutput).toContain('Registry management');
      expect(logOutput).toContain('Available registry types: services,data,infrastructure,communication');
      expect(logOutput).toContain('Direct registry access available for: services data');
    });

    it('should show direct registry access capabilities', async () => {
      await registryHubTypesExample.demonstrateRegistryHub();

      const logOutput = getLogOutput(testConsole);

      // Verify direct access is mentioned
      expect(logOutput).toContain('Direct registry access available for');
    });
  });

  describe('Educational Value and Benefits', () => {
    it('should provide clear educational takeaways', async () => {
      await registryHubTypesExample.demonstrateRegistryHub();

      const logOutput = getLogOutput(testConsole);

      // Verify educational content is present
      expect(logOutput).toContain('Key Benefits Demonstrated');
      expect(logOutput).toContain('Service organization by type/category');
      expect(logOutput).toContain('Environment-specific implementations');
      expect(logOutput).toContain('Clean separation of concerns');
      expect(logOutput).toContain('Centralized service discovery');
      expect(logOutput).toContain('Easy testing with different implementations');
    });

    it('should demonstrate comprehensive service management patterns', async () => {
      await registryHubTypesExample.demonstrateRegistryHub();

      const logOutput = getLogOutput(testConsole);

      // Verify comprehensive demonstration
      expect(logOutput).toContain('Registry Hub with Different Service Types Example');
      expect(logOutput).toContain('All services registered successfully');
      expect(logOutput).toContain('RegistryHub example completed successfully');
    });
  });

  describe('Service Implementation Variety', () => {
    it('should show multiple authentication implementations', async () => {
      await registryHubTypesExample.demonstrateRegistryHub();

      const logOutput = getLogOutput(testConsole);

      // Verify JWT vs OAuth2 implementations
      expect(logOutput).toContain('🔐 JWT Auth');
      expect(logOutput).toContain('🔒 OAuth2 Auth');
      expect(logOutput).toContain('jwt-token-');
      expect(logOutput).toContain('oauth2-token-');
    });

    it('should show multiple database implementations', async () => {
      await registryHubTypesExample.demonstrateRegistryHub();

      const logOutput = getLogOutput(testConsole);

      // Verify PostgreSQL vs MongoDB implementations
      expect(logOutput).toContain('🐘 PostgreSQL');
      expect(logOutput).toContain('🍃 MongoDB');
    });

    it('should show multiple caching implementations', async () => {
      await registryHubTypesExample.demonstrateRegistryHub();

      const logOutput = getLogOutput(testConsole);

      // Verify Redis vs Memory cache implementations
      expect(logOutput).toContain('🔴 Redis Cache');
      expect(logOutput).toContain('💾 Memory Cache');
    });

    it('should show multiple email implementations', async () => {
      await registryHubTypesExample.demonstrateRegistryHub();

      const logOutput = getLogOutput(testConsole);

      // Verify SendGrid vs SMTP implementations
      expect(logOutput).toContain('📨 SendGrid Email');
      expect(logOutput).toContain('📧 SMTP Email');
    });

    it('should show multiple logging implementations', async () => {
      await registryHubTypesExample.demonstrateRegistryHub();

      const logOutput = getLogOutput(testConsole);

      // Verify File vs Console logging implementations
      expect(logOutput).toContain('📝 FILE INFO');
      expect(logOutput).toContain('ℹ️  INFO');
    });
  });
});

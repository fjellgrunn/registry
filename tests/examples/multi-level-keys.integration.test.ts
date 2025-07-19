import { describe, expect, it } from 'vitest';
import multiLevelExample from '../../examples/multi-level-keys';
import { expectNoErrors, getLogOutput, setupConsoleCapture } from './test-helpers';

describe('Multi-Level Keys Example Integration Tests', () => {
  const testConsole = setupConsoleCapture();

  describe('Basic Functionality', () => {
    it('should run multi-level keys example without errors', async () => {
      await expect(multiLevelExample.runMultiLevelKeysExample()).resolves.not.toThrow();

      // Verify the example completed successfully
      const logOutput = getLogOutput(testConsole);
      expect(logOutput).toContain('Multi-level keys example completed successfully');
      expect(logOutput).toContain('Key takeaways');

      // Should have no unhandled errors (expected errors are caught in the example)
      expectNoErrors(testConsole, ['Caught expected error']);
    });

    it('should demonstrate hierarchical key patterns', async () => {
      await multiLevelExample.runMultiLevelKeysExample();

      const logOutput = getLogOutput(testConsole);

      // Verify different key levels are demonstrated
      expect(logOutput).toContain('Production Environment');
      expect(logOutput).toContain('Development Environment');
      expect(logOutput).toContain('Multi-level service access');

      // Verify scope-based selection works
      expect(logOutput).toContain('[SQL]');
      expect(logOutput).toContain('[NoSQL]');
      expect(logOutput).toContain('[S3]');
      expect(logOutput).toContain('[Local]');
    });
  });

  describe('Scope-Based Implementation Selection', () => {
    it('should show scope-based implementation selection', async () => {
      await multiLevelExample.runMultiLevelKeysExample();

      const logOutput = getLogOutput(testConsole);

      // Verify different scopes produce different implementations
      expect(logOutput).toContain('[SQL]');
      expect(logOutput).toContain('[NoSQL]');
      expect(logOutput).toContain('[S3]');
      expect(logOutput).toContain('[Local]');
      expect(logOutput).toContain('[PostgreSQL]');
      expect(logOutput).toContain('[MongoDB]');
    });

    it('should demonstrate environment-based switching', async () => {
      await multiLevelExample.runMultiLevelKeysExample();

      const logOutput = getLogOutput(testConsole);

      // Verify environment switching is shown
      expect(logOutput).toContain('Production Environment');
      expect(logOutput).toContain('Development Environment');
      expect(logOutput).toContain('Environment-based service selection');
    });

    it('should show database implementation selection', async () => {
      await multiLevelExample.runMultiLevelKeysExample();

      const logOutput = getLogOutput(testConsole);

      // Verify database selection demonstrations
      expect(logOutput).toContain('Database implementation selection');
      expect(logOutput).toContain('PostgreSQL Task Implementation');
      expect(logOutput).toContain('MongoDB Task Implementation');
    });
  });

  describe('Error Handling and Type Safety', () => {
    it('should demonstrate error handling for missing services', async () => {
      await multiLevelExample.runMultiLevelKeysExample();

      const logOutput = getLogOutput(testConsole);

      // Verify error handling is demonstrated
      expect(logOutput).toContain('Error handling');
      expect(logOutput).toContain('❌ Service with wrong scope throws error');
      expect(logOutput).toContain('❌ Caught expected error');
    });

    it('should demonstrate type safety and service retrieval', async () => {
      await multiLevelExample.runMultiLevelKeysExample();

      const logOutput = getLogOutput(testConsole);

      // Verify type safety demonstration
      expect(logOutput).toContain('Type Safety in Action');
      expect(logOutput).toContain('All services retrieved successfully');
      expect(logOutput).toContain('User service type:');
      expect(logOutput).toContain('Profile service type:');
      expect(logOutput).toContain('Preference service type:');
      expect(logOutput).toContain('Task service type:');
    });
  });

  describe('Multi-Level Service Access', () => {
    it('should demonstrate multi-level key hierarchies', async () => {
      await multiLevelExample.runMultiLevelKeysExample();

      const logOutput = getLogOutput(testConsole);

      // Verify multi-level access patterns
      expect(logOutput).toContain('Multi-level service access');
      expect(logOutput).toContain('User preferences');
      expect(logOutput).toContain('[Redis]'); // Three-level key path
    });

    it('should show practical service usage patterns', async () => {
      await multiLevelExample.runMultiLevelKeysExample();

      const logOutput = getLogOutput(testConsole);

      // Verify practical usage is demonstrated
      expect(logOutput).toContain('Saving user');
      expect(logOutput).toContain('Updating profile');
      expect(logOutput).toContain('Updating preferences');
      expect(logOutput).toContain('Creating new task');
    });
  });

  describe('Educational Value', () => {
    it('should provide clear educational takeaways', async () => {
      await multiLevelExample.runMultiLevelKeysExample();

      const logOutput = getLogOutput(testConsole);

      // Verify educational content is present
      expect(logOutput).toContain('Key takeaways');
      expect(logOutput).toContain('consistent interface type');
      expect(logOutput).toContain('multiple implementations');
      expect(logOutput).toContain('TypeScript provides full type safety');
      expect(logOutput).toContain('hierarchically while remaining independent');
      expect(logOutput).toContain('microservices, A/B testing');
    });
  });
});

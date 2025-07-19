import { describe, expect, it } from 'vitest';
import { runAdvancedSimpleExample, runSimpleExample } from '../../examples/simple-example';
import { expectNoErrors, getLogOutput, setupConsoleCapture } from './test-helpers';

describe('Simple Example Integration Tests', () => {
  const testConsole = setupConsoleCapture();

  describe('Basic Simple Example', () => {
    it('should run simple registry example without errors', async () => {
      await expect(runSimpleExample()).resolves.not.toThrow();

      // Verify expected output
      const logOutput = getLogOutput(testConsole);
      expect(logOutput).toContain('Simple Registry Example');
      expect(logOutput).toContain('[LOG]');
      expect(logOutput).toContain('My Simple App');
      expect(logOutput).toContain('All services working correctly');

      // Should have no errors
      expectNoErrors(testConsole);
    });

    it('should demonstrate registry creation and service registration', async () => {
      await runSimpleExample();

      // Check that key registry concepts are demonstrated
      const logOutput = getLogOutput(testConsole);
      expect(logOutput).toContain('registry'); // Shows registry usage
      expect(logOutput).toContain('service'); // Shows service concept
    });

    it('should show step-by-step registry usage', async () => {
      await runSimpleExample();

      const logOutput = getLogOutput(testConsole);

      // Verify the example walks through key steps
      expect(logOutput).toContain('Creating a simple registry');
      expect(logOutput).toContain('Creating and registering instances');
      expect(logOutput).toContain('Retrieving instances from registry');
      expect(logOutput).toContain('Testing the services');
    });
  });

  describe('Advanced Simple Example', () => {
    it('should run advanced simple example with service dependencies', async () => {
      await expect(runAdvancedSimpleExample()).resolves.not.toThrow();

      // Verify dependency injection worked
      const logOutput = getLogOutput(testConsole);
      expect(logOutput).toContain('Sending notification');
      expect(logOutput).toContain('📢 Notification sent');
      expect(logOutput).toContain('services can depend on each other');

      // Should have no errors
      expectNoErrors(testConsole);
    });

    it('should demonstrate service dependencies', async () => {
      await runAdvancedSimpleExample();

      const logOutput = getLogOutput(testConsole);

      // Verify dependency injection concepts
      expect(logOutput).toContain('Advanced Simple Example');
      expect(logOutput).toContain('Service Dependencies');
      expect(logOutput).toContain('[LOG]'); // Logger is used by notification service
    });
  });

  describe('Integration Validation', () => {
    it('should verify both examples can run in sequence without conflicts', async () => {
      // Run examples in sequence to ensure they don't interfere with each other
      await runSimpleExample();
      const firstRunLogs = testConsole.consoleLogs.length;

      await runAdvancedSimpleExample();
      const secondRunLogs = testConsole.consoleLogs.length;

      // Each should produce output
      expect(firstRunLogs).toBeGreaterThan(0);
      expect(secondRunLogs).toBeGreaterThan(firstRunLogs);

      // No errors should accumulate
      expectNoErrors(testConsole);
    });

    it('should demonstrate practical registry patterns', async () => {
      await runSimpleExample();
      await runAdvancedSimpleExample();

      const logOutput = getLogOutput(testConsole);

      // Should cover key educational concepts
      expect(logOutput).toContain('Key Takeaways');
      expect(logOutput).toContain('No RegistryHub required');
      expect(logOutput).toContain('No scopes required');
      expect(logOutput).toContain('dependency injection');
    });
  });
});

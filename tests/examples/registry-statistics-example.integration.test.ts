import { describe, expect, it } from 'vitest';
import { runRegistryStatisticsExample } from '../../examples/registry-statistics-example';
import { expectNoErrors, getLogOutput, setupConsoleCapture } from './test-helpers';

describe('Registry Statistics Example Integration Tests', () => {
  const testConsole = setupConsoleCapture();

  describe('Registry Statistics Example', () => {
    it('should run registry statistics example without errors', async () => {
      await expect(runRegistryStatisticsExample()).resolves.not.toThrow();

      // Verify expected output
      const logOutput = getLogOutput(testConsole);
      expect(logOutput).toContain('Registry Statistics Tracking with Scopes Example');
      expect(logOutput).toContain('Total get calls:');
      expect(logOutput).toContain('Advanced Statistics Example Complete');

      // Should have no errors
      expectNoErrors(testConsole);
    });

    it('should demonstrate statistics tracking functionality', async () => {
      const result = await runRegistryStatisticsExample();

      // Verify return structure and basic functionality
      expect(result.totalGetCalls).toBeGreaterThan(0);
      expect(result.coordinateCallRecords).toBeGreaterThan(0);
      expect(result.prodCalls).toBeGreaterThan(0);
      expect(result.devCalls).toBeGreaterThan(0);

      // Verify client summary functionality
      expect(result.clientSummary).toBeDefined();
      expect(result.clientSummary.serviceCalls).toBeGreaterThan(0);
      expect(result.clientSummary.applicationCalls).toBeGreaterThan(0);

      const logOutput = getLogOutput(testConsole);
      expect(logOutput).toContain('Making service calls with different scopes and clients');
      expect(logOutput).toContain('Statistics after service calls');
      expect(logOutput).toContain('Client Summary:');
      expect(logOutput).toContain('Service-to-service calls:');
      expect(logOutput).toContain('Application calls:');
    });

    it('should show coordinate call analysis', async () => {
      await runRegistryStatisticsExample();

      const logOutput = getLogOutput(testConsole);

      // Verify analysis output
      expect(logOutput).toContain('Detailed coordinate call records');
      expect(logOutput).toContain('Aggregated analysis by coordinate');
      expect(logOutput).toContain('Environment-based analysis');
      expect(logOutput).toContain('Production services:');
      expect(logOutput).toContain('Development services:');
    });

    it('should demonstrate client tracking capabilities', async () => {
      await runRegistryStatisticsExample();

      const logOutput = getLogOutput(testConsole);

      // Verify client breakdown analysis
      expect(logOutput).toContain('App "MyWebApp":');
      expect(logOutput).toContain('Service services/order');
      expect(logOutput).toContain('Service services/payment');
      expect(logOutput).toContain('App "CacheUtility":');
      expect(logOutput).toContain('from apps,');
      expect(logOutput).toContain('from services');
    });

    it('should demonstrate statistics immutability', async () => {
      await runRegistryStatisticsExample();

      const logOutput = getLogOutput(testConsole);

      // Verify immutability demonstration
      expect(logOutput).toContain('Testing immutability of returned statistics');
      expect(logOutput).toContain('Are record arrays the same object? false');
      expect(logOutput).toContain('original count preserved? true');
    });
  });
});

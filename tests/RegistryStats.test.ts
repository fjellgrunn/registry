import { beforeEach, describe, expect, test } from 'vitest';
import { RegistryStats } from '../src/RegistryStats';

describe('RegistryStats', () => {
  let stats: RegistryStats;

  beforeEach(() => {
    stats = new RegistryStats();
  });

  describe('recordGetCall and getStatistics', () => {
    test('should track basic get calls', () => {
      stats.recordGetCall(['user', 'profile']);
      stats.recordGetCall(['user', 'settings']);

      const result = stats.getStatistics();

      expect(result.totalGetCalls).toBe(2);
      expect(result.coordinateCallRecords).toHaveLength(2);
    });

    test('should track repeated calls to same coordinate', () => {
      stats.recordGetCall(['user', 'profile']);
      stats.recordGetCall(['user', 'profile']);
      stats.recordGetCall(['user', 'profile']);

      const result = stats.getStatistics();

      expect(result.totalGetCalls).toBe(3);
      expect(result.coordinateCallRecords).toHaveLength(1);
      expect(result.coordinateCallRecords[0].count).toBe(3);
    });

    test('should track calls with scopes', () => {
      stats.recordGetCall(['user', 'profile'], ['read']);
      stats.recordGetCall(['user', 'profile'], ['write', 'read']);

      const result = stats.getStatistics();

      expect(result.totalGetCalls).toBe(2);
      expect(result.coordinateCallRecords).toHaveLength(2);
    });

    test('should track same kta with different scopes separately', () => {
      stats.recordGetCall(['user', 'profile'], ['read']);
      stats.recordGetCall(['user', 'profile'], ['write']);
      stats.recordGetCall(['user', 'profile']); // no scopes

      const result = stats.getStatistics();

      expect(result.totalGetCalls).toBe(3);
      expect(result.coordinateCallRecords).toHaveLength(3);

      const readRecord = result.coordinateCallRecords.find(r =>
        r.kta.join('.') === 'user.profile' && r.scopes.includes('read') && r.scopes.length === 1
      );
      expect(readRecord?.count).toBe(1);
    });
  });

  describe('getCallCount', () => {
    test('should return correct count for specific coordinate', () => {
      stats.recordGetCall(['user', 'profile']);
      stats.recordGetCall(['user', 'profile']);
      stats.recordGetCall(['user', 'settings']);

      expect(stats.getCallCount(['user', 'profile'])).toBe(2);
      expect(stats.getCallCount(['user', 'settings'])).toBe(1);
      expect(stats.getCallCount(['nonexistent'])).toBe(0);
    });

    test('should return correct count for coordinate with scopes', () => {
      stats.recordGetCall(['user', 'profile'], ['read']);
      stats.recordGetCall(['user', 'profile'], ['read']);
      stats.recordGetCall(['user', 'profile'], ['write']);

      expect(stats.getCallCount(['user', 'profile'], ['read'])).toBe(2);
      expect(stats.getCallCount(['user', 'profile'], ['write'])).toBe(1);
      expect(stats.getCallCount(['user', 'profile'], ['admin'])).toBe(0);
    });
  });

  describe('getTotalCallsForKta', () => {
    test('should return total calls across all scopes for kta', () => {
      stats.recordGetCall(['user', 'profile'], ['read']);
      stats.recordGetCall(['user', 'profile'], ['write']);
      stats.recordGetCall(['user', 'profile']); // no scopes
      stats.recordGetCall(['user', 'settings']);

      expect(stats.getTotalCallsForKta(['user', 'profile'])).toBe(3);
      expect(stats.getTotalCallsForKta(['user', 'settings'])).toBe(1);
      expect(stats.getTotalCallsForKta(['nonexistent'])).toBe(0);
    });
  });

  describe('getCalledKtaPaths', () => {
    test('should return all unique kta paths', () => {
      stats.recordGetCall(['user', 'profile']);
      stats.recordGetCall(['user', 'settings']);
      stats.recordGetCall(['admin', 'config']);
      stats.recordGetCall(['user', 'profile']); // duplicate

      const ktaPaths = stats.getCalledKtaPaths();

      expect(ktaPaths).toHaveLength(3);
      expect(ktaPaths).toContainEqual(['user', 'profile']);
      expect(ktaPaths).toContainEqual(['user', 'settings']);
      expect(ktaPaths).toContainEqual(['admin', 'config']);
    });

    test('should return empty array when no calls made', () => {
      const ktaPaths = stats.getCalledKtaPaths();
      expect(ktaPaths).toEqual([]);
    });
  });

  describe('scope handling', () => {
    test('should handle empty scopes array', () => {
      stats.recordGetCall(['user', 'profile'], []);
      stats.recordGetCall(['user', 'profile']); // undefined scopes

      const result = stats.getStatistics();

      expect(result.coordinateCallRecords).toHaveLength(1);
      expect(result.coordinateCallRecords[0].count).toBe(2);
      expect(result.coordinateCallRecords[0].scopes).toEqual([]);
    });

    test('should normalize scope order', () => {
      stats.recordGetCall(['user', 'profile'], ['write', 'read']);
      stats.recordGetCall(['user', 'profile'], ['read', 'write']);

      const result = stats.getStatistics();

      expect(result.coordinateCallRecords).toHaveLength(1);
      expect(result.coordinateCallRecords[0].count).toBe(2);
    });
  });

  describe('complex scenarios', () => {
    test('should handle multiple kta and scope combinations', () => {
      // Multiple different coordinates with various scope combinations
      stats.recordGetCall(['user', 'profile'], ['read']);
      stats.recordGetCall(['user', 'profile'], ['write']);
      stats.recordGetCall(['user', 'profile']);
      stats.recordGetCall(['admin', 'users'], ['admin']);
      stats.recordGetCall(['public', 'data']);

      const result = stats.getStatistics();

      expect(result.totalGetCalls).toBe(5);
      expect(result.coordinateCallRecords).toHaveLength(5);

      // Verify specific records exist
      const profileReadRecord = result.coordinateCallRecords.find(r =>
        r.kta.join('.') === 'user.profile' && r.scopes.includes('read') && r.scopes.length === 1
      );
      expect(profileReadRecord?.count).toBe(1);

      const publicDataRecord = result.coordinateCallRecords.find(r =>
        r.kta.join('.') === 'public.data' && r.scopes.length === 0
      );
      expect(publicDataRecord?.count).toBe(1);
    });
  });
});

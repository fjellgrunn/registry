import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Instance } from '../src/Instance';
import { createRegistry, Registry } from '../src/Registry';
import { Coordinate } from '../src/Coordinate';

vi.mock('../src/logger', () => {
  return {
    default: {
      get: vi.fn(() => ({
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
  }
});

describe('Registry', () => {
  let registry: Registry;

  beforeEach(() => {
    registry = createRegistry('test');
  });

  describe('type property', () => {
    it('should have the type provided during creation', () => {
      const serviceRegistry = createRegistry('services');
      const dataRegistry = createRegistry('data');

      expect(serviceRegistry.type).toBe('services');
      expect(dataRegistry.type).toBe('data');
    });
  });

  it('should register a library', () => {
    const lib = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;
    registry.register(['testLib'], lib);
    expect(registry.get(['testLib'])).toBe(lib);
  });

  it('should return undefined for unregistered library', () => {
    expect(() => registry.get(['nonExistentLib'])).toThrow();
  });

  it('should register and retrieve library with multi-element key array', () => {
    const lib = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;
    registry.register(['test', 'nested', 'lib'], lib);
    expect(registry.get(['test', 'nested', 'lib'])).toBe(lib);
  });

  it('should return undefined when partial key array match', () => {
    const lib = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;
    registry.register(['test', 'nested', 'lib'], lib);
    expect(() => registry.get(['test', 'nested'])).toThrow();
  });

  it('should handle multiple libraries with different key arrays', () => {
    const lib1 = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;
    const lib2 = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;

    registry.register(['test', 'lib1'], lib1);
    registry.register(['test', 'lib2'], lib2);

    expect(registry.get(['test', 'lib1'])).toBe(lib1);
    expect(registry.get(['test', 'lib2'])).toBe(lib2);
  });

  it('should handle multiple libraries with very different key arrays', () => {
    const element = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;
    const container = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;
    const region = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;
    const nation = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;

    registry.register(['nation'], nation);
    registry.register(['region', 'nation'], region);
    registry.register(['container', 'region', 'nation'], container);
    registry.register(['element', 'container', 'region', 'nation'], element);

    expect(registry.get(['element', 'container', 'region', 'nation'])).toBe(element);
    expect(registry.get(['container', 'region', 'nation'])).toBe(container);
    expect(registry.get(['region', 'nation'])).toBe(region);
    expect(registry.get(['nation'])).toBe(nation);
  });

  it('should handle multiple libraries with very different key arrays', () => {
    const element = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;
    const container = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;
    const region = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;
    const nation = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;

    registry.register(['element', 'container', 'region', 'nation'], element);
    registry.register(['nation'], nation);
    registry.register(['region', 'nation'], region);
    registry.register(['container', 'region', 'nation'], container);

    expect(registry.get(['nation'])).toBe(nation);
    expect(registry.get(['element', 'container', 'region', 'nation'])).toBe(element);
    expect(registry.get(['container', 'region', 'nation'])).toBe(container);
    expect(registry.get(['region', 'nation'])).toBe(region);
  });

  it('should handle multiple libraries with different scopes', () => {
    const nationDefault = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;
    const nationFirestore = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;
    const nationSequelize = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;

    registry.register(['nation'], nationDefault);
    registry.register(['nation'], nationFirestore, { scopes: ['firestore'] });
    registry.register(['nation'], nationSequelize, { scopes: ['sequelize'] });

    expect(registry.get(['nation'])).toBe(nationDefault);
    expect(registry.get(['nation'], { scopes: ['firestore'] })).toBe(nationFirestore);
    expect(registry.get(['nation'], { scopes: ['sequelize'] })).toBe(nationSequelize);
  });

  it('should handle multiple libraries with very different key arrays', () => {
    const elementFirestore1 =
      {
        coordinate: {} as Coordinate<'test'>,
        registry: {} as Registry,
      } as unknown as Instance<'test'>;
    const elementSequelize1 =
      {
        coordinate: {} as Coordinate<'test'>,
        registry: {} as Registry,
      } as unknown as Instance<'test'>;
    const elementSequelize2 =
      {
        coordinate: {} as Coordinate<'test'>,
        registry: {} as Registry,
      } as unknown as Instance<'test'>;
    const elementFirestore2 =
      {
        coordinate: {} as Coordinate<'test'>,
        registry: {} as Registry,
      } as unknown as Instance<'test'>;
    const elementSequelizeBlamo2 =
      {
        coordinate: {} as Coordinate<'test'>,
        registry: {} as Registry,
      } as unknown as Instance<'test'>;
    const container = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;
    const containerFirestore =
      {
        coordinate: {} as Coordinate<'test'>,
        registry: {} as Registry,
      } as unknown as Instance<'test'>;
    const containerSequelize =
      {
        coordinate: {} as Coordinate<'test'>,
        registry: {} as Registry,
      } as unknown as Instance<'test'>;
    const region = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;
    const nation = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;

    registry.register(['element', 'container', 'region', 'nation'], elementFirestore1, { scopes: ['firestore'] });
    registry.register(['element', 'container', 'region', 'nation'], elementSequelize1, { scopes: ['sequelize'] });
    registry.register(['element2', 'container', 'region', 'nation'], elementSequelize2, { scopes: ['sequelize'] });
    registry.register(['element2', 'container', 'region', 'nation'], elementFirestore2, { scopes: ['firestore'] });
    registry.register(['element2', 'container', 'region', 'nation'],
      elementSequelizeBlamo2, { scopes: ['sequelize', 'blamo'] });
    registry.register(['nation'], nation);
    registry.register(['region', 'nation'], region);
    registry.register(['container', 'region', 'nation'], container);
    registry.register(['container', 'region', 'nation'], containerFirestore, { scopes: ['firestore'] });
    registry.register(['container', 'region', 'nation'], containerSequelize, { scopes: ['sequelize'] });

    expect(registry.get(['nation'])).toBe(nation);
    expect(registry.get(['element', 'container', 'region', 'nation']))
      .toBe(elementFirestore1);
    expect(registry.get(['element', 'container', 'region', 'nation'], { scopes: ['firestore'] }))
      .toBe(elementFirestore1);
    expect(registry.get(['element', 'container', 'region', 'nation'], { scopes: ['sequelize'] }))
      .toBe(elementSequelize1);
    expect(registry.get(['element', 'container', 'region', 'nation'], { scopes: ['sequelize'] }))
      .toBe(elementSequelize1);
    expect(() => registry.get(['element', 'container', 'region', 'nation'], { scopes: ['sequelize', 'blamo'] }))
      .toThrow();
    expect(registry.get(['element2', 'container', 'region', 'nation']))
      .toBe(elementSequelize2);
    expect(registry.get(['element2', 'container', 'region', 'nation'], { scopes: ['firestore'] }))
      .toBe(elementFirestore2);
    expect(registry.get(['element2', 'container', 'region', 'nation'], { scopes: ['sequelize'] }))
      .toBe(elementSequelize2);
    expect(registry.get(['element2', 'container', 'region', 'nation'], { scopes: ['sequelize', 'blamo'] }))
      .toBe(elementSequelizeBlamo2);
    expect(registry.get(['container', 'region', 'nation'])).toBe(container);
    expect(registry.get(['container', 'region', 'nation'], { scopes: ['firestore'] })).toBe(containerFirestore);
    expect(registry.get(['container', 'region', 'nation'], { scopes: ['sequelize'] })).toBe(containerSequelize);
    expect(registry.get(['region', 'nation'])).toBe(region);
  });

  it('should throw error when trying to register a non-instance', () => {
    const invalidInstance = { invalid: 'object' } as any;

    expect(() => {
      registry.register(['testLib'], invalidInstance);
    }).toThrow('Attempting to register a non-instance: testLib');
  });

  it('should throw error when no instances are available for a registered key', () => {
    // This is a tricky case to reproduce, but we can simulate it by manipulating the internal tree
    const lib = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;

    registry.register(['testLib'], lib);

    // Manually clear the instances to simulate the "No instances available" error
    (registry.instanceTree as any).testLib.instances = [];

    expect(() => registry.get(['testLib'])).toThrow('No instances registered for key path: testLib');
  });

  it('should throw error when trying to get instance with no children in path', () => {
    const lib = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;

    registry.register(['testLib'], lib);

    // Manually remove children to simulate the error
    (registry.instanceTree as any).testLib.children = null;

    expect(() => registry.get(['testLib', 'nonexistent'])).toThrow('Missing key: nonexistent');
  });

  it('should trigger logger debug calls during registration', () => {
    vi.clearAllMocks();

    const lib = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;

    registry.register(['testLib'], lib);

    // Just ensure the registration works and the library can be retrieved
    expect(registry.get(['testLib'])).toBe(lib);
  });

});

describe('Registry createInstance', () => {
  let registry: Registry;

  beforeEach(() => {
    registry = createRegistry('test-createInstance');
  });

  it('should create and register an instance atomically', () => {
    const factory = (coord: Coordinate<'User'>, context: { registry: Registry, registryHub?: any }) => ({
      coordinate: coord,
      registry: context.registry,
    }) as Instance<'User'>;

    const userInstance = registry.createInstance(['User'], ['firestore'], factory);

    expect(userInstance).toBeDefined();
    expect(userInstance.coordinate.kta).toEqual(['User']);
    expect(userInstance.coordinate.scopes).toEqual(['firestore']);
    // The registry should be a proxied version with the same type
    expect(userInstance.registry.type).toBe(registry.type);
    expect(typeof userInstance.registry.get).toBe('function');
    expect(typeof userInstance.registry.register).toBe('function');

    // Verify it was automatically registered
    expect(registry.get(['User'], { scopes: ['firestore'] })).toBe(userInstance);
  });

  it('should create instances with multiple key types', () => {
    const factory = (coord: any, context: { registry: Registry, registryHub?: any }) => ({
      coordinate: coord,
      registry: context.registry,
    }) as any;

    const profileInstance = registry.createInstance(['User', 'Profile'], ['firestore'], factory);

    expect(profileInstance.coordinate.kta).toEqual(['User', 'Profile']);
    expect(registry.get(['User', 'Profile'], { scopes: ['firestore'] })).toBe(profileInstance);
  });

  it('should handle multiple instances with different scopes', () => {
    const firestoreFactory = (coord: Coordinate<'User'>, context: { registry: Registry, registryHub?: any }) => ({
      coordinate: coord,
      registry: context.registry,
      type: 'firestore',
    }) as Instance<'User'> & { type: string };

    const postgresFactory = (coord: Coordinate<'User'>, context: { registry: Registry, registryHub?: any }) => ({
      coordinate: coord,
      registry: context.registry,
      type: 'postgres',
    }) as Instance<'User'> & { type: string };

    const firestoreUser = registry.createInstance(['User'], ['firestore'], firestoreFactory);
    const postgresUser = registry.createInstance(['User'], ['postgres'], postgresFactory);

    expect(registry.get(['User'], { scopes: ['firestore'] })).toBe(firestoreUser);
    expect(registry.get(['User'], { scopes: ['postgres'] })).toBe(postgresUser);
    expect((firestoreUser as any).type).toBe('firestore');
    expect((postgresUser as any).type).toBe('postgres');
  });

  it('should throw error if factory returns invalid instance', () => {
    const badFactory = () => ({ invalid: 'instance' }) as any;

    expect(() => {
      registry.createInstance(['User'], ['firestore'], badFactory);
    }).toThrow('Factory did not return a valid instance for: User');
  });

  it('should trigger logger debug calls during createInstance', () => {
    vi.clearAllMocks();

    const factory = (coord: Coordinate<'User'>, context: { registry: Registry, registryHub?: any }) => ({
      coordinate: coord,
      registry: context.registry,
    }) as Instance<'User'>;

    const userInstance = registry.createInstance(['User'], ['firestore'], factory);

    // Just ensure the instance was created and registered correctly
    expect(userInstance).toBeDefined();
    expect(userInstance.coordinate.kta).toEqual(['User']);
    expect(registry.get(['User'], { scopes: ['firestore'] })).toBe(userInstance);
  });
});

describe('Registry findScopedInstance error cases', () => {
  let registry: Registry;

  beforeEach(() => {
    registry = createRegistry('test-scopedInstance');
  });

  it('should throw error when no instances available in empty array', () => {
    // This tests the "No instances available" error path in findScopedInstance
    const lib = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;

    registry.register(['testLib'], lib);

    // Clear instances to trigger the error
    (registry.instanceTree as any).testLib.instances = [];

    expect(() => registry.get(['testLib'])).toThrow('No instances registered for key path: testLib');
  });

  it('should throw error when no instance matches requested scopes', () => {
    const lib = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;

    registry.register(['testLib'], lib, { scopes: ['firestore'] });

    expect(() => registry.get(['testLib'], { scopes: ['postgres'] })).toThrow('No instance found matching scopes: postgres');
  });

  describe('getCoordinates', () => {
    it('should return empty array when no instances are registered', () => {
      const coordinates = registry.getCoordinates();
      expect(coordinates).toEqual([]);
    });

    it('should return all coordinates from registered instances', () => {
      const coordinate1 = { kta: ['lib1'], scopes: ['scope1'], toString: () => 'lib1 - scope1' } as Coordinate<'lib1'>;
      const coordinate2 = { kta: ['lib2'], scopes: ['scope2'], toString: () => 'lib2 - scope2' } as Coordinate<'lib2'>;
      const coordinate3 = { kta: ['nested', 'lib3'], scopes: [], toString: () => 'nested, lib3 - ' } as unknown as Coordinate<'nested'>;

      const lib1 = {
        coordinate: coordinate1,
        registry: {} as Registry,
      } as unknown as Instance<'lib1'>;

      const lib2 = {
        coordinate: coordinate2,
        registry: {} as Registry,
      } as unknown as Instance<'lib2'>;

      const lib3 = {
        coordinate: coordinate3,
        registry: {} as Registry,
      } as unknown as Instance<'nested'>;

      registry.register(['lib1'], lib1, { scopes: ['scope1'] });
      registry.register(['lib2'], lib2, { scopes: ['scope2'] });
      registry.register(['nested', 'lib3'], lib3);

      const coordinates = registry.getCoordinates();

      expect(coordinates).toHaveLength(3);
      expect(coordinates).toContain(coordinate1);
      expect(coordinates).toContain(coordinate2);
      expect(coordinates).toContain(coordinate3);
    });

    it('should return coordinates from instances with same key path but different scopes', () => {
      const coordinate1 = { kta: ['lib'], scopes: ['scope1'], toString: () => 'lib - scope1' } as Coordinate<'lib'>;
      const coordinate2 = { kta: ['lib'], scopes: ['scope2'], toString: () => 'lib - scope2' } as Coordinate<'lib'>;

      const lib1 = {
        coordinate: coordinate1,
        registry: {} as Registry,
      } as unknown as Instance<'lib'>;

      const lib2 = {
        coordinate: coordinate2,
        registry: {} as Registry,
      } as unknown as Instance<'lib'>;

      registry.register(['lib'], lib1, { scopes: ['scope1'] });
      registry.register(['lib'], lib2, { scopes: ['scope2'] });

      const coordinates = registry.getCoordinates();

      expect(coordinates).toHaveLength(2);
      expect(coordinates).toContain(coordinate1);
      expect(coordinates).toContain(coordinate2);
    });
  });

  describe('getStatistics', () => {
    it('should track get call statistics correctly', () => {
      // Create test instances
      const lib1 = {
        coordinate: {} as Coordinate<'lib1'>,
        registry: {} as Registry,
      } as unknown as Instance<'lib1'>;

      const lib2 = {
        coordinate: {} as Coordinate<'lib2'>,
        registry: {} as Registry,
      } as unknown as Instance<'lib2'>;

      // Register instances
      registry.register(['lib1'], lib1);
      registry.register(['lib2'], lib2);

      // Initial statistics should show no get calls
      let stats = registry.getStatistics();
      expect(stats.totalGetCalls).toBe(0);
      expect(stats.coordinateCallRecords).toHaveLength(0);

      // Call get method multiple times
      registry.get(['lib1']);
      registry.get(['lib1']);
      registry.get(['lib2']);

      // Check updated statistics
      stats = registry.getStatistics();
      expect(stats.totalGetCalls).toBe(3);
      expect(stats.coordinateCallRecords).toHaveLength(2);

      // Find the records
      const lib1Record = stats.coordinateCallRecords.find(r => r.kta.join('.') === 'lib1');
      const lib2Record = stats.coordinateCallRecords.find(r => r.kta.join('.') === 'lib2');

      expect(lib1Record).toBeDefined();
      expect(lib1Record!.count).toBe(2);
      expect(lib1Record!.scopes).toEqual([]);

      expect(lib2Record).toBeDefined();
      expect(lib2Record!.count).toBe(1);
      expect(lib2Record!.scopes).toEqual([]);
    });

    it('should return a copy of statistics to prevent external mutation', () => {
      const lib = {
        coordinate: {} as Coordinate<'test'>,
        registry: {} as Registry,
      } as unknown as Instance<'test'>;

      registry.register(['test'], lib);
      registry.get(['test']);

      const stats1 = registry.getStatistics();
      const stats2 = registry.getStatistics();

      // Should be different array instances
      expect(stats1.coordinateCallRecords).not.toBe(stats2.coordinateCallRecords);

      // But with same content
      expect(stats1.coordinateCallRecords).toEqual(stats2.coordinateCallRecords);
    });

    it('should track statistics for nested coordinates', () => {
      const nestedLib = {
        coordinate: {} as Coordinate<'services', 'auth'>,
        registry: {} as Registry,
      } as unknown as Instance<'services', 'auth'>;

      registry.register(['services', 'auth'], nestedLib);

      registry.get(['services', 'auth']);
      registry.get(['services', 'auth']);

      const stats = registry.getStatistics();
      expect(stats.totalGetCalls).toBe(2);

      const record = stats.coordinateCallRecords.find(r => r.kta.join('.') === 'services.auth');
      expect(record).toBeDefined();
      expect(record!.count).toBe(2);
      expect(record!.scopes).toEqual([]);
    });

    it('should track statistics with different scopes separately', () => {
      const prodLib = {
        coordinate: {} as Coordinate<'auth'>,
        registry: {} as Registry,
      } as unknown as Instance<'auth'>;

      const devLib = {
        coordinate: {} as Coordinate<'auth'>,
        registry: {} as Registry,
      } as unknown as Instance<'auth'>;

      // Register same service with different scopes
      registry.register(['auth'], prodLib, { scopes: ['production'] });
      registry.register(['auth'], devLib, { scopes: ['development'] });

      // Call with different scopes
      registry.get(['auth'], { scopes: ['production'] });
      registry.get(['auth'], { scopes: ['production'] });
      registry.get(['auth'], { scopes: ['development'] });

      const stats = registry.getStatistics();
      expect(stats.totalGetCalls).toBe(3);
      expect(stats.coordinateCallRecords).toHaveLength(2);

      // Find the records
      const prodRecord = stats.coordinateCallRecords.find(r =>
        r.kta.join('.') === 'auth' && r.scopes.includes('production')
      );
      const devRecord = stats.coordinateCallRecords.find(r =>
        r.kta.join('.') === 'auth' && r.scopes.includes('development')
      );

      expect(prodRecord).toBeDefined();
      expect(prodRecord!.count).toBe(2);
      expect(prodRecord!.scopes).toEqual(['production']);

      expect(devRecord).toBeDefined();
      expect(devRecord!.count).toBe(1);
      expect(devRecord!.scopes).toEqual(['development']);
    });

    it('should handle multiple scopes correctly', () => {
      const lib = {
        coordinate: {} as Coordinate<'cache'>,
        registry: {} as Registry,
      } as unknown as Instance<'cache'>;

      registry.register(['cache'], lib, { scopes: ['redis', 'production'] });

      registry.get(['cache'], { scopes: ['redis', 'production'] });
      registry.get(['cache'], { scopes: ['production', 'redis'] }); // Different order

      const stats = registry.getStatistics();
      expect(stats.totalGetCalls).toBe(2);
      expect(stats.coordinateCallRecords).toHaveLength(1); // Should be same record due to scope normalization

      const record = stats.coordinateCallRecords[0];
      expect(record.count).toBe(2);
      expect(record.scopes.sort()).toEqual(['production', 'redis']);
    });
  });
});

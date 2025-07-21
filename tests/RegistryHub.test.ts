import { beforeEach, describe, expect, it } from 'vitest';
import { createRegistryHub, RegistryHub } from '@/RegistryHub';
import { createRegistry, Registry } from '@/Registry';
import { createInstance } from '@/Instance';
import { createCoordinate } from '@/Coordinate';

describe('RegistryHub', () => {
  let hub: RegistryHub;
  let serviceRegistry: Registry;
  let dataRegistry: Registry;

  beforeEach(() => {
    hub = createRegistryHub();
    serviceRegistry = createRegistry('services');
    dataRegistry = createRegistry('data');
  });

  describe('registerRegistry', () => {
    it('should register a registry using its type property', () => {
      hub.registerRegistry(serviceRegistry);

      const retrievedRegistry = hub.getRegistry('services');
      expect(retrievedRegistry).toBe(serviceRegistry);
    });

    it('should throw error when registering duplicate type', () => {
      hub.registerRegistry(serviceRegistry);
      const anotherServiceRegistry = createRegistry('services');

      expect(() => {
        hub.registerRegistry(anotherServiceRegistry);
      }).toThrow('Registry already registered under type: services');
    });

    it('should allow registering different types', () => {
      hub.registerRegistry(serviceRegistry);
      hub.registerRegistry(dataRegistry);

      expect(hub.getRegistry('services')).toBe(serviceRegistry);
      expect(hub.getRegistry('data')).toBe(dataRegistry);
    });
  });

  describe('getRegistry', () => {
    it('should return null for unregistered type', () => {
      const registry = hub.getRegistry('nonexistent');
      expect(registry).toBeNull();
    });

    it('should return correct registry for registered type', () => {
      hub.registerRegistry(serviceRegistry);

      const registry = hub.getRegistry('services');
      expect(registry).toBe(serviceRegistry);
    });
  });

  describe('getRegisteredTypes', () => {
    it('should return empty array when no registries registered', () => {
      const types = hub.getRegisteredTypes();
      expect(types).toEqual([]);
    });

    it('should return all registered type keys', () => {
      hub.registerRegistry(serviceRegistry);
      hub.registerRegistry(dataRegistry);

      const types = hub.getRegisteredTypes();
      expect(types).toHaveLength(2);
      expect(types).toContain('services');
      expect(types).toContain('data');
    });
  });

  describe('unregisterRegistry', () => {
    it('should return false for unregistered type', () => {
      const result = hub.unregisterRegistry('nonexistent');
      expect(result).toBe(false);
    });

    it('should unregister existing registry and return true', () => {
      hub.registerRegistry(serviceRegistry);

      const result = hub.unregisterRegistry('services');
      expect(result).toBe(true);
      expect(hub.getRegistry('services')).toBeNull();
    });

    it('should not affect other registries when unregistering one', () => {
      hub.registerRegistry(serviceRegistry);
      hub.registerRegistry(dataRegistry);

      hub.unregisterRegistry('services');

      expect(hub.getRegistry('services')).toBeNull();
      expect(hub.getRegistry('data')).toBe(dataRegistry);
    });
  });

  describe('get', () => {
    let mockInstance: any;

    beforeEach(() => {
      // Create a mock instance for testing
      const coordinate = createCoordinate(['test'], []);
      mockInstance = createInstance(serviceRegistry, coordinate);

      // Register the instance in the service registry
      serviceRegistry.register(['test'], mockInstance);

      // Register the service registry in the hub
      hub.registerRegistry(serviceRegistry);
    });

    it('should delegate get call to appropriate registry', () => {
      const instance = hub.get('services', ['test']);
      expect(instance).toBe(mockInstance);
    });

    it('should pass through options to registry get method', () => {
      const coordinate = createCoordinate(['scoped'], ['dev']);
      const scopedInstance = createInstance(serviceRegistry, coordinate);

      serviceRegistry.register(['scoped'], scopedInstance, { scopes: ['dev'] });

      const instance = hub.get('services', ['scoped'], { scopes: ['dev'] });
      expect(instance).toBe(scopedInstance);
    });

    it('should throw error for unregistered registry type', () => {
      expect(() => {
        hub.get('nonexistent', ['test']);
      }).toThrow('No registry registered under type: nonexistent');
    });

    it('should propagate registry get errors', () => {
      expect(() => {
        hub.get('services', ['nonexistent']);
      }).toThrow('Instance not found for key path: nonexistent');
    });
  });

  describe('integration with multiple registries', () => {
    it('should work with multiple registries and instances', () => {
      // Setup service registry with instances
      const serviceCoordinate = createCoordinate(['auth'], []);
      const authService = createInstance(serviceRegistry, serviceCoordinate);
      serviceRegistry.register(['auth'], authService);

      // Setup data registry with instances
      const dataCoordinate = createCoordinate(['user'], []);
      const userRepo = createInstance(dataRegistry, dataCoordinate);
      dataRegistry.register(['user'], userRepo);

      // Register both registries in hub
      hub.registerRegistry(serviceRegistry);
      hub.registerRegistry(dataRegistry);

      // Test access to instances in different registries
      const retrievedAuth = hub.get('services', ['auth']);
      const retrievedUser = hub.get('data', ['user']);

      expect(retrievedAuth).toBe(authService);
      expect(retrievedUser).toBe(userRepo);
    });

    it('should work with scoped instances across registries', () => {
      // Create scoped instances in both registries
      const prodServiceCoord = createCoordinate(['cache'], ['prod']);
      const prodCacheService = createInstance(serviceRegistry, prodServiceCoord);

      const devDataCoord = createCoordinate(['cache'], ['dev']);
      const devCacheRepo = createInstance(dataRegistry, devDataCoord);

      serviceRegistry.register(['cache'], prodCacheService, { scopes: ['prod'] });
      dataRegistry.register(['cache'], devCacheRepo, { scopes: ['dev'] });

      hub.registerRegistry(serviceRegistry);
      hub.registerRegistry(dataRegistry);

      // Test scoped access
      const prodCache = hub.get('services', ['cache'], { scopes: ['prod'] });
      const devCache = hub.get('data', ['cache'], { scopes: ['dev'] });

      expect(prodCache).toBe(prodCacheService);
      expect(devCache).toBe(devCacheRepo);
    });
  });

  describe('createRegistry', () => {
    it('should create and register a registry using a factory', () => {
      const registryFactory = (type: string, registryHub?: RegistryHub) => {
        const registry = createRegistry(type, registryHub);
        return registry;
      };

      const createdRegistry = hub.createRegistry('custom', registryFactory);

      expect(createdRegistry).toBeDefined();
      expect(createdRegistry.type).toBe('custom');
      expect(createdRegistry.registryHub).toBe(hub);

      // Verify it was automatically registered
      const retrievedRegistry = hub.getRegistry('custom');
      expect(retrievedRegistry).toBe(createdRegistry);
    });

    it('should throw error when creating registry with duplicate type', () => {
      hub.registerRegistry(serviceRegistry);

      const registryFactory = (type: string, registryHub?: RegistryHub) => {
        return createRegistry(type, registryHub);
      };

      expect(() => {
        hub.createRegistry('services', registryFactory);
      }).toThrow('Registry already registered under type: services');
    });

    it('should pass the hub reference to the factory', () => {
      let receivedHub: RegistryHub | undefined;

      const registryFactory = (type: string, registryHub?: RegistryHub) => {
        receivedHub = registryHub;
        return createRegistry(type, registryHub);
      };

      hub.createRegistry('test', registryFactory);

      expect(receivedHub).toBe(hub);
    });
  });

  describe('getAllCoordinates', () => {
    it('should return empty array when no registries are registered', () => {
      const coordinates = hub.getAllCoordinates();
      expect(coordinates).toEqual([]);
    });

    it('should return coordinates from single registry with registry type', () => {
      hub.registerRegistry(serviceRegistry);

      // Create an instance in the service registry
      const coordinate = createCoordinate(['User'], ['production']);
      const instance = createInstance(serviceRegistry, coordinate);
      serviceRegistry.register(['User'], instance, { scopes: ['production'] });

      const coordinates = hub.getAllCoordinates();

      expect(coordinates).toHaveLength(1);
      expect(coordinates[0].coordinate).toBe(coordinate);
      expect(coordinates[0].registryType).toBe('services');
    });

    it('should return coordinates from multiple registries with their registry types', () => {
      hub.registerRegistry(serviceRegistry);
      hub.registerRegistry(dataRegistry);

      // Create instances in service registry
      const serviceCoord1 = createCoordinate(['Auth'], ['jwt']);
      const serviceInstance1 = createInstance(serviceRegistry, serviceCoord1);
      serviceRegistry.register(['Auth'], serviceInstance1, { scopes: ['jwt'] });

      const serviceCoord2 = createCoordinate(['Payment'], ['stripe']);
      const serviceInstance2 = createInstance(serviceRegistry, serviceCoord2);
      serviceRegistry.register(['Payment'], serviceInstance2, { scopes: ['stripe'] });

      // Create instances in data registry
      const dataCoord1 = createCoordinate(['User'], ['firestore']);
      const dataInstance1 = createInstance(dataRegistry, dataCoord1);
      dataRegistry.register(['User'], dataInstance1, { scopes: ['firestore'] });

      const dataCoord2 = createCoordinate(['Order'], ['postgresql']);
      const dataInstance2 = createInstance(dataRegistry, dataCoord2);
      dataRegistry.register(['Order'], dataInstance2, { scopes: ['postgresql'] });

      const coordinates = hub.getAllCoordinates();

      expect(coordinates).toHaveLength(4);

      // Verify service registry coordinates
      const serviceCoords = coordinates.filter(c => c.registryType === 'services');
      expect(serviceCoords).toHaveLength(2);
      expect(serviceCoords.some(c => c.coordinate === serviceCoord1)).toBe(true);
      expect(serviceCoords.some(c => c.coordinate === serviceCoord2)).toBe(true);

      // Verify data registry coordinates
      const dataCoords = coordinates.filter(c => c.registryType === 'data');
      expect(dataCoords).toHaveLength(2);
      expect(dataCoords.some(c => c.coordinate === dataCoord1)).toBe(true);
      expect(dataCoords.some(c => c.coordinate === dataCoord2)).toBe(true);
    });

    it('should handle registries with no instances', () => {
      const emptyRegistry = createRegistry('empty');
      hub.registerRegistry(serviceRegistry);
      hub.registerRegistry(emptyRegistry);

      // Add instance only to service registry
      const coordinate = createCoordinate(['Service'], ['scope']);
      const instance = createInstance(serviceRegistry, coordinate);
      serviceRegistry.register(['Service'], instance, { scopes: ['scope'] });

      const coordinates = hub.getAllCoordinates();

      expect(coordinates).toHaveLength(1);
      expect(coordinates[0].registryType).toBe('services');
      expect(coordinates[0].coordinate).toBe(coordinate);
    });

    it('should handle multiple instances in same registry with different scopes', () => {
      hub.registerRegistry(serviceRegistry);

      // Create multiple instances with same key path but different scopes
      const coord1 = createCoordinate(['Database'], ['production']);
      const instance1 = createInstance(serviceRegistry, coord1);
      serviceRegistry.register(['Database'], instance1, { scopes: ['production'] });

      const coord2 = createCoordinate(['Database'], ['development']);
      const instance2 = createInstance(serviceRegistry, coord2);
      serviceRegistry.register(['Database'], instance2, { scopes: ['development'] });

      const coordinates = hub.getAllCoordinates();

      expect(coordinates).toHaveLength(2);
      expect(coordinates.every(c => c.registryType === 'services')).toBe(true);
      expect(coordinates.some(c => c.coordinate === coord1)).toBe(true);
      expect(coordinates.some(c => c.coordinate === coord2)).toBe(true);
    });

    it('should include coordinates from registries created via hub.createRegistry', () => {
      const registryFactory = (type: string, registryHub?: RegistryHub) => {
        return createRegistry(type, registryHub);
      };

      const createdRegistry = hub.createRegistry('created', registryFactory);

      // Add instance to created registry
      const coordinate = createCoordinate(['CreatedService'], ['test']);
      const instance = createInstance(createdRegistry, coordinate);
      createdRegistry.register(['CreatedService'], instance, { scopes: ['test'] });

      const coordinates = hub.getAllCoordinates();

      expect(coordinates).toHaveLength(1);
      expect(coordinates[0].registryType).toBe('created');
      expect(coordinates[0].coordinate).toBe(coordinate);
    });

    it('should group coordinates correctly by registry type in result', () => {
      const cacheRegistry = createRegistry('cache');

      hub.registerRegistry(serviceRegistry);
      hub.registerRegistry(dataRegistry);
      hub.registerRegistry(cacheRegistry);

      // Add instances to each registry
      const serviceCoord = createCoordinate(['Service'], []);
      const serviceInstance = createInstance(serviceRegistry, serviceCoord);
      serviceRegistry.register(['Service'], serviceInstance);

      const dataCoord = createCoordinate(['Data'], []);
      const dataInstance = createInstance(dataRegistry, dataCoord);
      dataRegistry.register(['Data'], dataInstance);

      const cacheCoord = createCoordinate(['Cache'], []);
      const cacheInstance = createInstance(cacheRegistry, cacheCoord);
      cacheRegistry.register(['Cache'], cacheInstance);

      const coordinates = hub.getAllCoordinates();

      expect(coordinates).toHaveLength(3);

      // Group by registry type
      const grouped = coordinates.reduce((acc, item) => {
        if (!acc[item.registryType]) acc[item.registryType] = [];
        acc[item.registryType].push(item);
        return acc;
      }, {} as Record<string, typeof coordinates>);

      expect(Object.keys(grouped)).toHaveLength(3);
      expect(grouped['services']).toHaveLength(1);
      expect(grouped['data']).toHaveLength(1);
      expect(grouped['cache']).toHaveLength(1);
    });
  });
});

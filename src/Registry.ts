/* eslint-disable indent */
import LibLogger from './logger';
import { Instance, isInstance } from './Instance';
import { AllItemTypeArrays, Coordinate } from "@fjell/types";
import { createCoordinate } from "@fjell/core";
import {
  InstanceFactory,
  InstanceTree,
  Registry,
  RegistryHub,
  ScopedInstance
} from './types';
import { ClientIdentifier, RegistryStatistics, RegistryStats, ServiceClient } from './RegistryStats';
import { InvalidKTAError } from './errors/CoordinateError';

// Re-export types for backward compatibility
export type { Registry, RegistryHub, InstanceFactory, RegistryFactory } from './types';

const logger = LibLogger.get("Registry");

const findScopedInstance = (
  scopedInstances: ScopedInstance[],
  requestedScopes?: string[],

): Instance<any, any, any, any, any, any> | null => {
  if (!requestedScopes || requestedScopes.length === 0) {
    // Return first instance if no scopes specified
    const firstInstance = scopedInstances[0]?.instance;
    if (!firstInstance) {
      return null;
    }
    return firstInstance;
  }

  // Find instance that matches all requested scopes
  const matchingInstance = scopedInstances.find(scopedInstance => {
    if (!scopedInstance.scopes) return false;
    return requestedScopes.every(scope =>
      scopedInstance.scopes && scopedInstance.scopes.includes(scope)
    );
  });

  if (!matchingInstance) {
    const availableScopes = scopedInstances.map(si => si.scopes?.join(', ') || '(no scopes)');
    logger.warning(
      `No instance found matching scopes: ${requestedScopes.join(', ')}. ` +
      `Available scopes: ${availableScopes.join(' | ')}`
    );
    return null;
  }

  return matchingInstance.instance;
}

export const createRegistry = (type: string, registryHub?: RegistryHub): Registry => {
  const instanceTree: InstanceTree = {};

  // Statistics tracking
  const registryStats = new RegistryStats();

  /**
   * Creates a proxied Registry that automatically injects client information for service-to-service calls
   */
  const createProxiedRegistry = (callingCoordinate: { kta: string[]; scopes: string[] }): Registry => {
    const serviceClient: ServiceClient = {
      registryType: type,
      coordinate: {
        kta: callingCoordinate.kta,
        scopes: callingCoordinate.scopes
      }
    };

    return {
      ...registry,
      get: <
        S extends string,
        L1 extends string = never,
        L2 extends string = never,
        L3 extends string = never,
        L4 extends string = never,
        L5 extends string = never,
      >(kta: AllItemTypeArrays<S, L1, L2, L3, L4, L5>, options?: { scopes?: string[]; client?: ClientIdentifier }): Instance<S, L1, L2, L3, L4, L5> | null => {
        // Automatically inject the calling service as the client if no client is specified
        const clientToUse = options?.client || serviceClient;
        return registry.get(kta, { ...options, client: clientToUse });
      }
    };
  };

  const createInstance = <
    S extends string,
    L1 extends string = never,
    L2 extends string = never,
    L3 extends string = never,
    L4 extends string = never,
    L5 extends string = never,
  >(
    kta: AllItemTypeArrays<S, L1, L2, L3, L4, L5>,
    scopes: string[],
    factory: InstanceFactory<S, L1, L2, L3, L4, L5>
  ): Instance<S, L1, L2, L3, L4, L5> => {
    logger.debug(`Creating and registering instance for key path and scopes`, kta, scopes, `in registry type: ${type}`);

    if (!kta || (kta as readonly string[]).length === 0) {
      throw new InvalidKTAError(kta, 'KTA must contain at least one key type');
    }

    // Create coordinate for the instance
    const coordinate = createCoordinate(kta as any, scopes) as unknown as Coordinate<S, L1, L2, L3, L4, L5>;

    // Create a proxied registry that automatically tracks this service as the client
    const proxiedRegistry = createProxiedRegistry(coordinate);

    // Use factory to create the instance with the proxied registry
    const instance = factory(coordinate, {
      registry: proxiedRegistry,
      registryHub,
    });

    // Validate the created instance
    if (!isInstance(instance)) {
      logger.error('Factory returned invalid instance', {
        component: 'registry',
        operation: 'getOrCreateInstance',
        type,
        kta,
        returnedType: typeof instance,
        suggestion: 'Ensure factory function returns a valid instance with coordinate and registry properties'
      });
      throw new Error(
        `Factory did not return a valid instance for: ${kta.join('.')}. ` +
        `Expected instance with coordinate and registry properties, got: ${typeof instance}`
      );
    }

    // Register the instance
    registerInternal(kta, instance, { scopes });

    return instance;
  };

  const registerInternal = <
    S extends string,
    L1 extends string = never,
    L2 extends string = never,
    L3 extends string = never,
    L4 extends string = never,
    L5 extends string = never,
  >(kta: AllItemTypeArrays<S, L1, L2, L3, L4, L5>, instance: Instance<S, L1, L2, L3, L4, L5>, options?: { scopes?: string[] }): void => {
    if (!kta || (kta as readonly string[]).length === 0) {
      throw new InvalidKTAError(kta, 'KTA must contain at least one key type');
    }

    const keyPath = [...kta].reverse(); // Work from most specific to least specific
    let currentLevel = instanceTree;

    logger.debug(`Registering instance for key path and scopes`, keyPath, options?.scopes, `in registry type: ${type}`);

    if (!isInstance(instance)) {
      logger.error('Attempting to register invalid instance', {
        component: 'registry',
        operation: 'registerInstance',
        type,
        kta,
        providedType: typeof instance,
        suggestion: 'Ensure you are registering a valid instance with coordinate and registry properties, not a factory or other object'
      });
      throw new Error(
        `Attempting to register a non-instance: ${kta.join('.')}. ` +
        `Expected instance with coordinate and registry properties, got: ${typeof instance}`
      );
    }

    // Navigate to the correct location in the tree
    for (let i = 0; i < keyPath.length; i++) {
      const keyType = keyPath[i];
      const isLeaf = i === keyPath.length - 1;

      if (!currentLevel[keyType]) {
        currentLevel[keyType] = {
          instances: [],
          children: isLeaf ? null : {}
        };
      }

      if (isLeaf) {
        // Check for duplicate scopes before adding
        const newScopes = options?.scopes || [];
        const existing = currentLevel[keyType].instances;
        if (newScopes.length > 0) {
          for (const existingEntry of existing) {
            const existingScopes = existingEntry.scopes || [];
            if (existingScopes.length === newScopes.length &&
                newScopes.every(s => existingScopes.includes(s))) {
              logger.warning('Duplicate scope registration detected — earlier entry will be shadowed', {
                component: 'registry',
                operation: 'registerInternal',
                type,
                kta,
                scopes: newScopes,
                suggestion: 'Ensure each scope combination is unique per key path to avoid silent shadowing'
              });
              break;
            }
          }
        }
        // Add instance to the leaf node
        currentLevel[keyType].instances.push({
          scopes: options?.scopes,
          instance
        });
      } else {
        // Navigate deeper into the tree
        if (!currentLevel[keyType].children) {
          currentLevel[keyType].children = {};
        }
        currentLevel = currentLevel[keyType].children!;
      }
    }
  };

  const register = <
    S extends string,
    L1 extends string = never,
    L2 extends string = never,
    L3 extends string = never,
    L4 extends string = never,
    L5 extends string = never,
  >(kta: AllItemTypeArrays<S, L1, L2, L3, L4, L5>, instance: Instance<S, L1, L2, L3, L4, L5>, options?: { scopes?: string[] }): void => {
    logger.debug('Using deprecated register method. Consider using createInstance instead.');
    registerInternal(kta, instance, options);
  };

  const get = <
    S extends string,
    L1 extends string = never,
    L2 extends string = never,
    L3 extends string = never,
    L4 extends string = never,
    L5 extends string = never,
  >(kta: AllItemTypeArrays<S, L1, L2, L3, L4, L5>, options?: { scopes?: string[]; client?: ClientIdentifier }): Instance<S, L1, L2, L3, L4, L5> | null => {
    // Track statistics with kta, scopes, and client
    registryStats.recordGetCall(kta, options?.scopes, options?.client);

    if (!kta || (kta as readonly string[]).length === 0) {
      throw new InvalidKTAError(kta, 'KTA must contain at least one key type');
    }

    const keyPath = [...kta].reverse();
    let currentLevel = instanceTree;

    // Navigate to the target node
    for (let i = 0; i < keyPath.length; i++) {
      const keyType = keyPath[i];
      const isLeaf = i === keyPath.length - 1;

      if (!currentLevel[keyType]) {
        logger.debug(`Instance not found for key path: ${kta.join('.')}, Missing key: ${keyType}`);
        return null;
      }

      if (isLeaf) {
        // Found the target node, extract instance
        const scopedInstances = currentLevel[keyType].instances;

        if (scopedInstances.length === 0) {
          logger.debug(`No instances registered for key path: ${kta.join('.')}`);
          return null;
        }

        const found = findScopedInstance(scopedInstances, options?.scopes);
        if (!found) {
          return null;
        }
        return found;
      } else {
        // Continue navigation
        if (!currentLevel[keyType].children) {
          logger.debug(`Instance not found for key path: ${kta.join('.')}, No children for: ${keyType}`);
          return null;
        }
        currentLevel = currentLevel[keyType].children!;
      }
    }

    return null;
  };

  const getCoordinates = (): Coordinate<any, any, any, any, any, any>[] => {
    const coordinates: Coordinate<any, any, any, any, any, any>[] = [];

    const traverseTree = (node: InstanceTree): void => {
      for (const keyType in node) {
        const treeNode = node[keyType];

        // Collect coordinates from instances at this level
        for (const scopedInstance of treeNode.instances) {
          coordinates.push(scopedInstance.instance.coordinate as Coordinate<any, any, any, any, any, any>);
        }

        // Recursively traverse children if they exist
        if (treeNode.children) {
          traverseTree(treeNode.children);
        }
      }
    };

    traverseTree(instanceTree);
    return coordinates;
  };

  const getStatistics = (): RegistryStatistics => {
    return registryStats.getStatistics();
  };

  const registry: Registry = {
    type,
    registryHub,
    createInstance,
    register,
    get,
    getCoordinates,
    getStatistics,
    instanceTree,
  };

  return registry;
}

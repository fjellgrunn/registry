/* eslint-disable indent */
import LibLogger from './logger';
import { Instance, isInstance } from './Instance';
import { AllItemTypeArrays, Coordinate, createCoordinate } from '@fjell/core';
import {
  InstanceFactory,
  InstanceTree,
  Registry,
  RegistryHub,
  ScopedInstance
} from './types';
import { ClientIdentifier, RegistryStatistics, RegistryStats, ServiceClient } from './RegistryStats';

// Re-export types for backward compatibility
export type { Registry, RegistryHub, InstanceFactory, RegistryFactory } from './types';

const logger = LibLogger.get("Registry");

const findScopedInstance = (
  scopedInstances: ScopedInstance[],
  requestedScopes?: string[],

): Instance<any, any | never, any | never, any | never, any | never, any | never> => {
  if (!requestedScopes || requestedScopes.length === 0) {
    // Return first instance if no scopes specified
    const firstInstance = scopedInstances[0]?.instance;
    if (!firstInstance) {
      throw new Error('No instances available');
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
    throw new Error(`No instance found matching scopes: ${requestedScopes.join(', ')}`);
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
  const createProxiedRegistry = (callingCoordinate: Coordinate<any, any | never, any | never, any | never, any | never, any | never>): Registry => {
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

    // Create coordinate for the instance
    const coordinate = createCoordinate(kta as any, scopes);

    // Create a proxied registry that automatically tracks this service as the client
    const proxiedRegistry = createProxiedRegistry(coordinate);

    // Use factory to create the instance with the proxied registry
    const instance = factory(coordinate, {
      registry: proxiedRegistry,
      registryHub,
    });

    // Validate the created instance
    if (!isInstance(instance)) {
      throw new Error(`Factory did not return a valid instance for: ${kta.join('.')}`);
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
    const keyPath = [...kta].reverse(); // Work from most specific to least specific
    let currentLevel = instanceTree;

    logger.debug(`Registering instance for key path and scopes`, keyPath, options?.scopes, `in registry type: ${type}`);

    if (!isInstance(instance)) {
      throw new Error(`Attempting to register a non-instance: ${kta.join('.')}`);
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

    const keyPath = [...kta].reverse();
    let currentLevel = instanceTree;

    // Navigate to the target node
    for (let i = 0; i < keyPath.length; i++) {
      const keyType = keyPath[i];
      const isLeaf = i === keyPath.length - 1;

      if (!currentLevel[keyType]) {
        throw new Error(`Instance not found for key path: ${kta.join('.')}, Missing key: ${keyType}`);
      }

      if (isLeaf) {
        // Found the target node, extract instance
        const scopedInstances = currentLevel[keyType].instances;

        if (scopedInstances.length === 0) {
          throw new Error(`No instances registered for key path: ${kta.join('.')}`);
        }

        return findScopedInstance(scopedInstances, options?.scopes);
      } else {
        // Continue navigation
        if (!currentLevel[keyType].children) {
          throw new Error(`Instance not found for key path: ${kta.join('.')}, No children for: ${keyType}`);
        }
        currentLevel = currentLevel[keyType].children!;
      }
    }

    return null;
  };

  const getCoordinates = (): Coordinate<any, any | never, any | never, any | never, any | never, any | never>[] => {
    const coordinates: Coordinate<any, any | never, any | never, any | never, any | never, any | never>[] = [];

    const traverseTree = (node: InstanceTree): void => {
      for (const keyType in node) {
        const treeNode = node[keyType];

        // Collect coordinates from instances at this level
        for (const scopedInstance of treeNode.instances) {
          coordinates.push(scopedInstance.instance.coordinate);
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

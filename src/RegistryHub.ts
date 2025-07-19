 
import LibLogger from '@/logger';
import { Registry, RegistryFactory, RegistryHub } from './types';
import { Instance } from './Instance';
import {
  DuplicateRegistryTypeError,
  RegistryTypeNotFoundError,
} from './errors/RegistryHubError';

// Re-export types for backward compatibility
export type { RegistryHub } from './types';

const logger = LibLogger.get("RegistryHub");

interface RegistryHubData {
  [type: string]: Registry;
}

export const createRegistryHub = (): RegistryHub => {
  const registries: RegistryHubData = {};

  const createRegistry = (type: string, factory: RegistryFactory): Registry => {
    logger.debug(`Creating new registry with type: ${type}`);

    if (registries[type]) {
      throw new DuplicateRegistryTypeError(type);
    }

    // Create the registry with a reference to this hub
    const registry = factory(type, hub);

    // Ensure the created registry has a reference to this hub if not already set
    if (!('registryHub' in registry) || registry.registryHub !== hub) {
      // @ts-expect-error: registryHub is optional and may be readonly, but we want to set it for hub awareness
      registry.registryHub = hub;
    }

    // Register the created registry
    registries[type] = registry;
    logger.debug(`Successfully created and registered new registry with type: ${type}`);

    return registry;
  };

  const registerRegistry = (registry: Registry): void => {
    const type = registry.type;
    logger.debug(`Registering registry with type: ${type}`);

    if (registries[type]) {
      throw new DuplicateRegistryTypeError(type);
    }

    registries[type] = registry;

    // Ensure the created registry has a reference to this hub if not already set
    if (!('registryHub' in registry) || registry.registryHub !== hub) {
      // @ts-expect-error: registryHub is optional and may be readonly, but we want to set it for hub awareness
      registry.registryHub = hub;
    }

    logger.debug(`Successfully registered registry with type: ${type}`);
  };

  const get = (
    type: string,
    kta: string[],
    options?: { scopes?: string[] },
  ): Instance<any, any | never, any | never, any | never, any | never, any | never> | null => {
    logger.debug(`Looking up instance for type: ${type}, kta: ${kta.join('.')}, scopes: ${options?.scopes?.join(',') || 'none'}`);

    const registry = registries[type];
    if (!registry) {
      const availableTypes = Object.keys(registries);
      throw new RegistryTypeNotFoundError(type, availableTypes);
    }

    return registry.get(kta, options);
  };

  const getRegistry = (type: string): Registry | null => {
    return registries[type] || null;
  };

  const getRegisteredTypes = (): string[] => {
    return Object.keys(registries);
  };

  const unregisterRegistry = (type: string): boolean => {
    if (registries[type]) {
      delete registries[type];
      logger.debug(`Unregistered registry under type: ${type}`);
      return true;
    }
    return false;
  };

  const hub: RegistryHub = {
    createRegistry,
    registerRegistry,
    get,
    getRegistry,
    getRegisteredTypes,
    unregisterRegistry,
  };

  return hub;
};

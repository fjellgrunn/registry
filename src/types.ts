import { Instance } from './Instance';
import { Coordinate } from './Coordinate';

/**
 * The RegistryHub interface provides a higher-level registry that manages multiple Registry instances.
 */
export interface RegistryHub {
    /**
     * Creates a new registry instance using a RegistryFactory and automatically registers it.
     */
    readonly createRegistry: (type: string, factory: RegistryFactory) => Registry;

    /**
     * Registers a registry instance, using the registry's type property as the key.
     */
    readonly registerRegistry: (registry: Registry) => void;

    /**
     * Retrieves an instance by delegating to the appropriate registry.
     */
    readonly get: (type: string, kta: string[], options?: { scopes?: string[] }) => Instance<any, any | never, any | never, any | never, any | never, any | never> | null;

    /**
     * Retrieves a registry instance by its type key.
     */
    readonly getRegistry: (type: string) => Registry | null;

    /**
     * Lists all registered type keys.
     */
    readonly getRegisteredTypes: () => string[];

    /**
     * Removes a registry from the hub.
     */
    readonly unregisterRegistry: (type: string) => boolean;
}

/**
 * Factory function for creating instances. This function receives a coordinate and context
 * and returns a fully initialized instance.
 */
export type InstanceFactory<
    S extends string,
    L1 extends string = never,
    L2 extends string = never,
    L3 extends string = never,
    L4 extends string = never,
    L5 extends string = never
> = (
    coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
    context: {
        registry: Registry,
        registryHub?: RegistryHub,
    }
) => Instance<S, L1, L2, L3, L4, L5>;

/**
 * Factory function for creating a Registry instance. This function receives the type and hub
 * and returns a fully initialized registry.
 */
export type RegistryFactory = (type: string, registryHub?: RegistryHub) => Registry;

/**
 * Tree structure representing the hierarchy of instances
 */
export interface InstanceTree {
    [keyType: string]: InstanceTreeNode;
}

export interface InstanceTreeNode {
    instances: ScopedInstance[];
    children: InstanceTree | null;
}

export interface ScopedInstance {
    scopes?: string[];
    instance: Instance<any, any | never, any | never, any | never, any | never, any | never>;
}

/**
 * The Registry interface provides a central registry for managing and accessing instances of services.
 * It serves as a dependency injection container that allows libraries to reference and access
 * other library instances they depend on.
 */
export interface Registry {
    /** The type identifier for this registry (e.g., 'services', 'data', 'cache') */
    readonly type: string;

    /** Optional reference to the RegistryHub that created this registry */
    readonly registryHub?: RegistryHub;

    /**
     * Creates and registers a new instance in the registry in one atomic operation.
     */
    createInstance: <
        S extends string,
        L1 extends string = never,
        L2 extends string = never,
        L3 extends string = never,
        L4 extends string = never,
        L5 extends string = never
    >(
        kta: S[],
        scopes: string[],
        factory: InstanceFactory<S, L1, L2, L3, L4, L5>
    ) => Instance<S, L1, L2, L3, L4, L5>;

    /**
     * Registers an existing instance in the registry (for migration/advanced use cases).
     * @deprecated Use createInstance instead for new code
     */
    register: (
        kta: string[],
        instance: Instance<any, any | never, any | never, any | never, any | never, any | never>,
        options?: { scopes?: string[] },
    ) => void;

    /**
     * Retrieves an instance from the registry.
     */
    get: (
        kta: string[],
        options?: { scopes?: string[] },
    ) => Instance<any, any | never, any | never, any | never, any | never, any | never> | null;

    /** The tree structure representing the hierarchy of instances */
    instanceTree: InstanceTree;
}
# API Reference

Complete Registry API documentation and method reference.

## Core Registry Interface

```typescript
interface Registry {
  readonly type: string; // Mandatory type identifier
  createInstance: <...>(...) => Instance<...>;
  get: (...) => Instance | null;
  getCoordinates: () => Coordinate[]; // Discover all registered coordinates
  instanceTree: InstanceTree;
}
```

## Primary Methods

### `createRegistry(type: string): Registry`
Creates a new registry with the specified type identifier.

### `registry.createInstance(kta, scopes, factory)`
Registers a new service instance with the given key type array and scopes.

### `registry.get(kta, options)`
Retrieves a service instance by key type array and scope options.

### `registry.getCoordinates(): Coordinate[]`
Returns all registered coordinates for service discovery and introspection.

## RegistryHub Interface

```typescript
interface RegistryHub {
  registerRegistry: (registry: Registry) => void;
  get: (registryType: string, kta: string[], options?: GetOptions) => Instance | null;
  getRegistries: () => Registry[];
  getAllCoordinates: () => Array<{coordinate: Coordinate, registryType: string}>;
}
```

## Coordinate System

```typescript
interface Coordinate {
  kta: string[]; // Key Type Array - hierarchical identifiers
  scopes: string[]; // Context qualifiers
}
```

## Complete Documentation

For comprehensive API documentation with detailed examples, implementation patterns, and advanced usage scenarios, see the **Foundation** section which contains the complete Registry documentation including:

- Interface definitions and type signatures
- Detailed method documentation with examples
- Registry and RegistryHub patterns
- Coordinate system explanation
- Service discovery and introspection
- Error handling and best practices

The Foundation section serves as the authoritative API reference with full context and examples.

# Getting Started

Quick start guide to using Fjell Registry in your applications.

## Installation

```bash
npm install @fjell/registry
```

## Basic Usage

The simplest way to get started with Registry:

```typescript
import { createRegistry, createInstance } from '@fjell/registry'

// Create a registry with a type identifier
const registry = createRegistry('services')

// Register a simple service
registry.createInstance(['logger'], [], (coordinate, context) => {
  const service = new LoggerService()
  const instance = createInstance(context.registry, coordinate)

  // Attach service methods to the instance
  (instance as any).log = service.log.bind(service)
  return instance
})

// Retrieve and use the service
const logger = registry.get(['logger'], [])
logger?.log('Hello from Registry!')
```

## Core Concepts Quick Reference

- **Registry**: Central service container with a mandatory type identifier
- **Coordinate**: Unique identifier using key types + scopes
- **Instance**: Registered service with coordinate and registry reference
- **Scopes**: Context qualifiers like environment or implementation type

## Next Steps

- Check out the **Examples** section for complete working examples
- Read the **Foundation** section for deep understanding of concepts
- Explore the **API Reference** for complete method documentation

## Common Patterns

### Single Registry (Simple Apps)
```typescript
const registry = createRegistry('app')
// Register all your services here
```

### Multiple Registries (Enterprise)
```typescript
const servicesRegistry = createRegistry('services')
const dataRegistry = createRegistry('data')
const cacheRegistry = createRegistry('cache')
```

### Scoped Services
```typescript
// Different implementations for different environments
registry.createInstance(['database'], ['postgresql'], ...)
registry.createInstance(['database'], ['firestore'], ...)
```

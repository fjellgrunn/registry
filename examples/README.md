# Registry Examples

This directory contains examples demonstrating how to use the Registry with different key patterns and configurations.

## Examples

### 1. `simple-example.ts` ⭐ **Start Here!**
**Perfect for beginners!** Demonstrates the simplest possible way to use the Registry:
- **No RegistryHub required** - just call `createRegistry()`
- **No scopes needed** - pass empty array `[]` or omit entirely
- **Basic dependency injection** - register and retrieve services
- **Service dependencies** - shows how services can depend on each other

Great for simple applications that just need basic dependency injection without complexity.

### 2. `multi-level-keys.ts`
**Advanced usage with scopes and multi-level keys!** Demonstrates how Registry supports hierarchical key type arrays:
- **Single level**: `['user']`, `['task']` - SQL vs NoSQL implementations
- **Two levels**: `['user', 'profile']` - S3 vs Local storage implementations
- **Three levels**: `['user', 'profile', 'preference']` - Redis implementation
- **Real scopes**: Production vs development environments
- **Multiple implementations**: Same interface, different backends

Shows how each key path maps to different implementations via scopes using the real library.

### 3. `registry-hub-types.ts` 🏗️ **Enterprise Architecture**
**Large-scale application with service organization!** Demonstrates how RegistryHub manages multiple registries for different service types:
- **Service Categories**: Business logic, data access, infrastructure, communication
- **Type-based Organization**: Services organized by purpose and responsibility
- **Cross-Registry Workflows**: Services from different registries working together
- **Environment Configuration**: Production vs development implementations
- **Centralized Discovery**: Single hub for all service types

Perfect for enterprise applications that need clean separation of concerns and organized service architecture.

### 4. `registry-statistics-example.ts` 📊 **Usage Analytics**
**Track and monitor registry usage patterns with scope-aware analytics!** Demonstrates advanced statistics tracking:
- **Scope-Aware Tracking**: Separate statistics for each kta + scopes combination
- **Total Call Monitoring**: Track overall `get()` method usage
- **Detailed Coordinate Records**: Individual tracking for each service/scope pair
- **Environment Analysis**: Aggregate statistics by environment (prod/dev)
- **Most/Least Used Services**: Identify usage patterns and bottlenecks
- **Immutable Statistics**: Safe access to tracking data without affecting internal state
- **Normalized Scope Handling**: Consistent tracking regardless of scope order

Perfect for monitoring, optimization, understanding service usage patterns, and analyzing environment-specific behavior in production applications.

## Key Concepts Demonstrated

### Simple Usage (simple-example.ts)
```typescript
// Import the real registry functionality
import { createRegistry, createInstance } from '../src/Registry';

// Create a registry - no RegistryHub needed!
const registry = createRegistry('app');

// Register a service - no scopes needed!
registry.createInstance(['logger'], [], (coordinate, context) => {
  const service = new LoggerService();
  const instance = createInstance(context.registry, coordinate);
  (instance as any).log = service.log.bind(service);
  return instance;
});

// Get the service - no scopes needed!
const logger = registry.get(['logger']);
logger.log('Hello from the registry!');
```

### Multi-Level Key Arrays
```typescript
// Different key path levels
['user']                           // → UserService implementation
['user', 'profile']                // → UserProfileService implementation
['user', 'profile', 'preference']  // → UserPreferenceService implementation
['task']                           // → TaskService implementation
```

### RegistryHub Usage (registry-hub-types.ts)
```typescript
// Import RegistryHub functionality
import { createRegistryHub } from '../src/RegistryHub';
import { createRegistry } from '../src/Registry';

// Create a hub to manage multiple registries
const hub = createRegistryHub();

// Create specialized registries for different service types
const servicesRegistry = createRegistry('services');      // Business logic
const dataRegistry = createRegistry('data');              // Data access
const infraRegistry = createRegistry('infrastructure');   // Infrastructure
const commRegistry = createRegistry('communication');     // External services

// Register all registries in the hub
hub.registerRegistry(servicesRegistry);
hub.registerRegistry(dataRegistry);
hub.registerRegistry(infraRegistry);
hub.registerRegistry(commRegistry);

// Register services by type and scope
servicesRegistry.createInstance(['auth'], ['prod'], (coordinate, context) => {
  // JWT implementation for production
});

dataRegistry.createInstance(['user'], ['sql'], (coordinate, context) => {
  // PostgreSQL implementation
});

// Retrieve services by type and scope through the hub
const prodAuth = hub.get('services', ['auth'], { scopes: ['prod'] });
const sqlUser = hub.get('data', ['user'], { scopes: ['sql'] });
const cache = hub.get('infrastructure', ['cache'], { scopes: ['dev'] });
const email = hub.get('communication', ['email'], { scopes: ['prod'] });
```

### Scope-Based Implementation Selection
- Multiple implementations per key path
- Runtime selection via scopes
- Environment-based switching (prod/dev/test)
- Feature flags and A/B testing support

### Real-World Use Cases
- **Database Abstraction**: Different implementations for PostgreSQL, MongoDB, etc.
- **Environment Selection**: Different implementations for prod/dev
- **Testing**: Mock implementations with 'test' scope
- **Microservices**: Each key path represents a different service
- **Multi-Region**: Different implementations across regions

## Using the Registry

The registry provides a centralized way to manage instances in your application. Here are the main operations you can perform:

### Getting All Coordinates

You can retrieve a list of all coordinates currently registered in the registry:

```typescript
import { createRegistry } from '@fjell/registry';

const registry = createRegistry('myRegistry');

// Register some instances...
registry.createInstance(['service'], ['production'], factory1);
registry.createInstance(['cache', 'redis'], ['development'], factory2);

// Get all coordinates
const coordinates = registry.getCoordinates();
console.log(`Found ${coordinates.length} registered coordinates:`);
coordinates.forEach(coord => {
  console.log(`- ${coord.toString()}`);
});
```

This is useful for debugging, monitoring, or implementing discovery mechanisms in your application.

### Basic Instance Management

## Running Examples

```bash
# Start with the simple example (recommended)
npx tsx examples/simple-example.ts

# Run the multi-level keys example
npx tsx examples/multi-level-keys.ts

# Run the RegistryHub with service types example
npx tsx examples/registry-hub-types.ts

# Run the coordinate discovery and introspection example
npx tsx examples/coordinates-example.ts

# Run the RegistryHub cross-registry coordinate discovery example
npx tsx examples/registry-hub-coordinates-example.ts

# Run the registry statistics tracking example
npx tsx examples/registry-statistics-example.ts

# Or in Node.js
node -r esbuild-register examples/simple-example.ts
node -r esbuild-register examples/multi-level-keys.ts
node -r esbuild-register examples/registry-hub-types.ts
node -r esbuild-register examples/coordinates-example.ts
node -r esbuild-register examples/registry-hub-coordinates-example.ts
node -r esbuild-register examples/registry-statistics-example.ts
```

## Integration with Real Fjell Registry

Both examples now use the real library! In actual usage with the built package:

```typescript
import { createRegistry, createInstance } from '@fjell/registry';

// Simple usage - no RegistryHub, no scopes
const registry = createRegistry('app');

registry.createInstance(['user'], [], (coordinate, context) => {
  const service = new UserService();
  const instance = createInstance(context.registry, coordinate);
  (instance as any).save = service.save.bind(service);
  return instance;
});

const user = registry.get(['user']);

// Advanced usage - with scopes for multiple implementations
registry.createInstance(['user'], ['sql', 'prod'], (coordinate, context) => {
  const service = new SqlUserService();
  const instance = createInstance(context.registry, coordinate);
  (instance as any).save = service.save.bind(service);
  return instance;
});

const prodUser = registry.get(['user'], { scopes: ['prod'] });
```

## When to Use What

**Use `simple-example.ts` approach when:**
- You're just getting started
- You have a simple application
- You don't need multiple implementations per service
- You want basic dependency injection

**Use `multi-level-keys.ts` approach when:**
- You need multiple implementations (prod/dev/test)
- You have complex service hierarchies
- You need environment-based switching
- You're building a large, complex application

**Use `registry-hub-types.ts` approach when:**
- You're building enterprise-scale applications
- You need to organize services by type/category
- You have multiple teams working on different service layers
- You want clean separation between business logic, data, and infrastructure
- You need centralized service discovery across service types
- You're implementing microservices or modular architecture

This approach provides the foundation for the Fjell library's architecture pattern with swappable implementations and enterprise-scale service organization.

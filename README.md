# Fjell Registry

A comprehensive dependency injection and service location system for the Fjell ecosystem. The Registry provides a centralized way to register, scope, and retrieve service instances based on type hierarchies and contextual scopes.

## Core Concepts

### Instance
An `Instance` represents any registered service or component in the system. It consists of:
- **Coordinate**: Defines the service's identity (key types + scopes)
- **Registry**: Reference to the registry managing this instance

```typescript
interface Instance<S extends string, L1 extends string = never, ...> {
  coordinate: Coordinate<S, L1, L2, L3, L4, L5>;
  registry: Registry;
}
```

### Coordinate
A `Coordinate` uniquely identifies an instance using:
- **Key Type Array (KTA)**: Hierarchical type identifiers (e.g., `['User', 'Profile']`)
- **Scopes**: Context qualifiers (e.g., `['firestore']`, `['postgresql']`)

This allows multiple implementations of the same service:
```typescript
// Same User service, different storage backends
const firestoreUser = createCoordinate(['User'], ['firestore']);
const postgresUser = createCoordinate(['User'], ['postgresql']);
```

### Registry
The central service locator that:
- **Has a mandatory type identifier** (e.g., 'services', 'data', 'cache')
- Creates and registers instances atomically (no circular dependencies)
- Retrieves instances by type and scope
- Maintains a hierarchical tree of services

```typescript
interface Registry {
  readonly type: string; // Mandatory type identifier
  createInstance: <...>(...) => Instance<...>;
  register: (...) => void; // Deprecated
  get: (...) => Instance | null;
  instanceTree: InstanceTree;
}

// Create registries with their type
const serviceRegistry = createRegistry('services');
const dataRegistry = createRegistry('data');
const cacheRegistry = createRegistry('cache');
```

### RegistryHub
A higher-level registry that manages multiple Registry instances. The RegistryHub serves as a central hub where different registries can be organized automatically using their type property.

**Key Features:**
- **Automatic Registry Organization**: Registers registries using their built-in type property
- **Unified Access**: Single point of access to instances across all registries
- **Type Safety**: Maintains type safety while providing cross-registry access
- **Lifecycle Management**: Register, unregister, and manage multiple registries

```typescript
interface RegistryHub {
  registerRegistry: (registry: Registry) => void; // Uses registry.type automatically
  get: (type: string, kta: string[], options?: { scopes?: string[] }) => Instance | null;
  getRegistry: (type: string) => Registry | null;
  getRegisteredTypes: () => string[];
  unregisterRegistry: (type: string) => boolean;
}
```

**Architecture:**
```
RegistryHub
├── Registry (type: 'services') → Auth, User, Payment services
├── Registry (type: 'data') → Repositories, Data layers
├── Registry (type: 'cache') → Cache implementations
└── Registry (type: 'integrations') → External APIs, webhooks
```

### InstanceFactory
A factory function that creates instances:
```typescript
type InstanceFactory<S extends string, L1, L2, L3, L4, L5> = (
  registry: Registry,
  coordinate: Coordinate<S, L1, L2, L3, L4, L5>
) => Instance<S, L1, L2, L3, L4, L5>;
```

**Benefits:**
- ✅ No circular dependencies (factory receives populated registry + coordinate)
- ✅ Dependency injection friendly (factory can access other services)
- ✅ Atomic creation and registration
- ✅ Type-safe instance creation

## Architecture

```
createRegistry('services').createInstance(['User'], ['firestore'], factory)
                ↓
    1. Creates Coordinate { kta: ['User'], scopes: ['firestore'] }
    2. Calls factory(registry, coordinate)
    3. Validates returned instance
    4. Registers instance automatically
    5. Returns ready-to-use instance
```

**Registry Structure:**
```
Registry (type: 'services')
├── Instance Tree (by Key Types)
│   ├── User
│   │   ├── [ScopedInstance] scope: ['firestore'] ← Created via factory
│   │   └── [ScopedInstance] scope: ['postgresql'] ← Created via factory
│   └── User.Profile
│       ├── [ScopedInstance] scope: ['firestore']
│       └── [ScopedInstance] scope: ['postgresql']
└── Atomic Create+Register Logic
```

**RegistryHub Structure:**
```
RegistryHub
├── Registry (type: 'services')
│   ├── User (multiple scopes)
│   ├── Auth (multiple scopes)
│   └── Payment (multiple scopes)
├── Registry (type: 'data')
│   ├── UserRepository (multiple scopes)
│   └── OrderRepository (multiple scopes)
└── Registry (type: 'cache')
    ├── UserCache (multiple scopes)
    └── SessionCache (multiple scopes)
```

## Usage Patterns

### 1. **Recommended: Registry-Managed Creation** ✅
```typescript
const registry = createRegistry('services');

// Create and register instances atomically - no circular dependency!
const userService = registry.createInstance(['User'], ['firestore'], (registry, coordinate) => {
  // Your instance implementation here
  return {
    coordinate,
    registry,
    // ... your service implementation
  };
});

// Instance is automatically registered and ready to use
const retrievedService = registry.get(['User'], { scopes: ['firestore'] });
console.log(userService === retrievedService); // true
```

### 2. **RegistryHub: Managing Multiple Registries** ✅
```typescript
const hub = createRegistryHub();

// Create domain-specific registries with their types
const serviceRegistry = createRegistry('services');
const dataRegistry = createRegistry('data');
const cacheRegistry = createRegistry('cache');

// Register registries in the hub - no type parameter needed!
hub.registerRegistry(serviceRegistry);   // Uses 'services' from registry.type
hub.registerRegistry(dataRegistry);      // Uses 'data' from registry.type
hub.registerRegistry(cacheRegistry);     // Uses 'cache' from registry.type

// Create instances in specific registries
const authService = serviceRegistry.createInstance(['Auth'], ['jwt'], authFactory);
const userRepo = dataRegistry.createInstance(['User'], ['firestore'], repoFactory);
const userCache = cacheRegistry.createInstance(['User'], ['redis'], cacheFactory);

// Access instances through the hub - unified interface
const auth = hub.get('services', ['Auth'], { scopes: ['jwt'] });
const user = hub.get('data', ['User'], { scopes: ['firestore'] });
const cache = hub.get('cache', ['User'], { scopes: ['redis'] });

// Hub management
console.log(hub.getRegisteredTypes()); // ['services', 'data', 'cache']
const specificRegistry = hub.getRegistry('services');
hub.unregisterRegistry('cache'); // Remove if needed
```

### 3. Multiple Implementations with Scopes
```typescript
const registry = createRegistry('data');

// Firestore implementation
const firestoreUser = registry.createInstance(['User'], ['firestore'], (registry, coordinate) => ({
  coordinate,
  registry,
  save: async (user) => { /* firestore logic */ },
  find: async (query) => { /* firestore logic */ }
}));

// PostgreSQL implementation
const postgresUser = registry.createInstance(['User'], ['postgresql'], (registry, coordinate) => ({
  coordinate,
  registry,
  save: async (user) => { /* postgresql logic */ },
  find: async (query) => { /* postgresql logic */ }
}));

// Context-aware retrieval
const prodService = registry.get(['User'], { scopes: ['firestore'] });
const devService = registry.get(['User'], { scopes: ['postgresql'] });
```

### 4. Hierarchical Services
```typescript
const registry = createRegistry('services');

// Register nested services
const profileService = registry.createInstance(['User', 'Profile'], ['firestore'], factoryFunction);
const settingsService = registry.createInstance(['User', 'Settings'], ['postgresql'], factoryFunction);

// Retrieve nested services
const userProfile = registry.get(['User', 'Profile'], { scopes: ['firestore'] });
```

### 5. **Cross-Registry Dependencies with RegistryHub**
```typescript
const hub = createRegistryHub();
const serviceRegistry = createRegistry('services');
const dataRegistry = createRegistry('data');

// Registries automatically use their type property
hub.registerRegistry(serviceRegistry);  // → 'services'
hub.registerRegistry(dataRegistry);     // → 'data'

// Service that depends on data layer
const orderService = serviceRegistry.createInstance(['Order'], ['business'], (registry, coordinate) => {
  // Access data layer through hub
  const userRepo = hub.get('data', ['User'], { scopes: ['firestore'] });
  const orderRepo = hub.get('data', ['Order'], { scopes: ['firestore'] });

  return {
    coordinate,
    registry,
    createOrder: async (orderData) => {
      const user = await userRepo.operations.findOne(orderData.userId);
      return orderRepo.operations.create({ ...orderData, user });
    }
  };
});
```

### 6. ~~Legacy Registration~~ (Deprecated)
```typescript
// OLD WAY - has circular dependency issue
const registry = createRegistry('legacy');
const userService = createInstance(registry, createCoordinate(['User'], ['firestore'])); // ❌ Circular!
registry.register(['User'], userService, { scopes: ['firestore'] });

// Use registry.createInstance() instead! ✅
```

### 7. Cascade Pattern
The Registry enables automatic service discovery:
```typescript
// System receives an item and automatically finds the right service
function saveItem(item: Item) {
  const registry = createRegistry('services');
  const service = registry.get(item.getKeyTypes(), {
    scopes: ['cache', 'fast']
  }) || registry.get(item.getKeyTypes(), {
    scopes: ['database']
  });

  return service.operations.save(item);
}
```

## RegistryHub Patterns

### 1. **Domain-Driven Registry Organization**
```typescript
const hub = createRegistryHub();

// Domain registries with explicit types
const userDomainRegistry = createRegistry('user-domain');
const orderDomainRegistry = createRegistry('order-domain');
const paymentDomainRegistry = createRegistry('payment-domain');
const notificationDomainRegistry = createRegistry('notification-domain');

// Register using their built-in types
hub.registerRegistry(userDomainRegistry);        // → 'user-domain'
hub.registerRegistry(orderDomainRegistry);       // → 'order-domain'
hub.registerRegistry(paymentDomainRegistry);     // → 'payment-domain'
hub.registerRegistry(notificationDomainRegistry); // → 'notification-domain'

// Each domain manages its own services
const userService = hub.get('user-domain', ['User'], { scopes: ['api'] });
const orderService = hub.get('order-domain', ['Order'], { scopes: ['business'] });
const paymentGateway = hub.get('payment-domain', ['Gateway'], { scopes: ['stripe'] });
```

### 2. **Environment-Based Registry Management**
```typescript
const hub = createRegistryHub();

if (process.env.NODE_ENV === 'production') {
  const prodDataRegistry = createRegistry('data');
  const redisRegistry = createRegistry('cache');
  hub.registerRegistry(prodDataRegistry);
  hub.registerRegistry(redisRegistry);
} else {
  const devDataRegistry = createRegistry('data');
  const memoryRegistry = createRegistry('cache');
  hub.registerRegistry(devDataRegistry);
  hub.registerRegistry(memoryRegistry);
}

// Same code works across environments
const userRepo = hub.get('data', ['User']);
const userCache = hub.get('cache', ['User']);
```

### 3. **Module-Based Registry Organization**
```typescript
// Each module/library provides its own typed registry
import { createUserModuleRegistry } from '@myapp/user-module';
import { createOrderModuleRegistry } from '@myapp/order-module';
import { createPaymentModuleRegistry } from '@myapp/payment-module';

const hub = createRegistryHub();

// These functions return registries with proper types
const userRegistry = createUserModuleRegistry();    // Registry with type 'users'
const orderRegistry = createOrderModuleRegistry();  // Registry with type 'orders'
const paymentRegistry = createPaymentModuleRegistry(); // Registry with type 'payments'

// Auto-register using their types
hub.registerRegistry(userRegistry);     // → 'users'
hub.registerRegistry(orderRegistry);    // → 'orders'
hub.registerRegistry(paymentRegistry);  // → 'payments'

// Cross-module integration
const orderService = hub.get('orders', ['OrderService']);
const paymentProcessor = hub.get('payments', ['Processor'], { scopes: ['stripe'] });
```

## Library Integration Patterns

### fjell-lib Integration
```typescript
// In fjell-lib
export const createServiceRegistry = () => createRegistry('fjell-lib');

// In applications
import { createServiceRegistry } from '@fjell/lib';
const hub = createRegistryHub();
hub.registerRegistry(createServiceRegistry()); // → 'fjell-lib'
```

### fjell-cache Integration
```typescript
// In fjell-cache
export const createCacheRegistry = () => createRegistry('fjell-cache');

// In applications
import { createCacheRegistry } from '@fjell/cache';
const hub = createRegistryHub();
hub.registerRegistry(createCacheRegistry()); // → 'fjell-cache'
```

### fjell-client-api Integration
```typescript
// In fjell-client-api
export const createClientApiRegistry = () => createRegistry('fjell-client-api');

// In applications
import { createClientApiRegistry } from '@fjell/client-api';
const hub = createRegistryHub();
hub.registerRegistry(createClientApiRegistry()); // → 'fjell-client-api'
```

## Design Benefits

1. **Unified Service Location**: Single pattern across all Fjell libraries
2. **Multiple Implementations**: Support Firestore, PostgreSQL, etc. for same types
3. **Contextual Scoping**: Environment-aware service selection
4. **Hierarchical Organization**: Natural type hierarchy support
5. **Dependency Injection**: Clean separation of configuration and usage
6. **Self-Documenting Registries**: Registry type is built-in, no external tracking needed
7. **Cross-Registry Access**: Unified interface for accessing instances across multiple registries
8. **Error Prevention**: Impossible to register a registry under the wrong type

## Migration Strategy

### Phase 1: Core Libraries
- ✅ fjell-registry (base implementation + RegistryHub with typed registries)
- 🔄 fjell-lib (create registry with type 'fjell-lib')
- 🔄 fjell-lib-sequelize (create registry with type 'fjell-lib-sequelize')
- 🔄 fjell-lib-firestore (create registry with type 'fjell-lib-firestore')

### Phase 2: Service Libraries
- 🔄 fjell-cache (create registry with type 'fjell-cache')
- 🔄 fjell-client-api (create registry with type 'fjell-client-api')

### Phase 3: UI Libraries (Future)
- fjell-express-router (create registry with type 'fjell-express-router')
- fjell-providers (create registry with type 'fjell-providers')

### Phase 4: RegistryHub Integration
- Applications use RegistryHub to organize all typed registries
- Libraries export factory functions that create properly typed registries
- Cross-module dependency management through hub

## Configuration Examples

### Multi-Database Setup with RegistryHub
```typescript
const hub = createRegistryHub();

// Create typed registries
const servicesRegistry = createRegistry('services');
const firestoreDataRegistry = createRegistry('firestore-data');
const postgresDataRegistry = createRegistry('postgres-data');

// Register Firestore services
firestoreDataRegistry.createInstance(['User'], ['production'], firestoreUserFactory);
firestoreDataRegistry.createInstance(['Order'], ['production'], firestoreOrderFactory);

// Register PostgreSQL services
postgresDataRegistry.createInstance(['User'], ['development'], postgresUserFactory);
postgresDataRegistry.createInstance(['Analytics'], [], postgresAnalyticsFactory);

// Register business services
servicesRegistry.createInstance(['UserService'], ['business'], userServiceFactory);
servicesRegistry.createInstance(['OrderService'], ['business'], orderServiceFactory);

// Register all typed registries
hub.registerRegistry(servicesRegistry);       // → 'services'
hub.registerRegistry(firestoreDataRegistry);  // → 'firestore-data'
hub.registerRegistry(postgresDataRegistry);   // → 'postgres-data'

// Context-aware retrieval through hub
const userService = hub.get('services', ['UserService']);
const userRepo = hub.get('firestore-data', ['User'], { scopes: ['production'] });
const analyticsRepo = hub.get('postgres-data', ['Analytics']);
```

### Service Composition with RegistryHub
```typescript
const hub = createRegistryHub();

// Create and register typed registries
const dataRegistry = createRegistry('data');
const servicesRegistry = createRegistry('services');
const integrationsRegistry = createRegistry('integrations');

hub.registerRegistry(dataRegistry);        // → 'data'
hub.registerRegistry(servicesRegistry);    // → 'services'
hub.registerRegistry(integrationsRegistry); // → 'integrations'

// Complex service with cross-registry dependencies
const orderService = servicesRegistry.createInstance(['Order'], ['business'], (registry, coordinate) => {
  return {
    coordinate,
    registry,
    createOrder: async (orderData) => {
      const userRepo = hub.get('data', ['User']);
      const paymentService = hub.get('integrations', ['Payment']);
      const inventoryService = hub.get('services', ['Inventory']);

      // Business logic using services from different typed registries
      const user = await userRepo.operations.findOne(orderData.userId);
      const payment = await paymentService.processPayment(orderData.payment);
      const inventory = await inventoryService.reserveItems(orderData.items);

      return { user, payment, inventory };
    }
  };
});
```

This architecture provides the foundation for a scalable, maintainable service ecosystem where components can be developed independently but work together seamlessly. The RegistryHub with typed registries extends this capability by enabling better organization and automatic management of multiple registries across different domains or modules.

## Memory Profiling and Performance

### Memory Overhead Testing

The Fjell Registry includes comprehensive memory profiling to ensure optimal performance in production environments. The memory tests measure the actual memory footprint of core infrastructure components and provide automated documentation.

#### Running Memory Tests

```bash
# Run memory tests and generate documentation
pnpm run test:memory
```

#### Memory Test Coverage

The memory tests analyze:

- **Registry Infrastructure**: Memory overhead of creating Registry and RegistryHub instances
- **Instance Creation**: Memory cost per instance including coordinates and storage
- **Tree Structure**: Memory efficiency of the instance tree data structures
- **Scoped Instances**: Additional memory overhead for scoped instance management
- **Scaling Behavior**: Memory usage from 10 to 100,000 instances with detailed scaling analysis

#### Comprehensive Scaling Tests

Memory tests include scaling analysis across multiple instance counts:

- **Small Scale**: 10, 20, 50, 100, 200 instances
- **Medium Scale**: 500, 1,000, 2,000, 5,000 instances
- **Large Scale**: 10,000, 20,000, 50,000, 100,000 instances

#### Memory Constraints

Current memory constraints ensure optimal performance:

- **Registry Creation**: ≤ 83 kB per registry
- **Instance Creation**: ≤ 2.4 kB per instance
- **Coordinate Objects**: ≤ 1.5 kB per coordinate
- **Tree Nodes**: ≤ 3.9 kB per tree node
- **Complex Instances**: ≤ 4.9 kB for multi-level instances

#### Generated Documentation

Memory tests automatically generate `./docs/memory.md` with:

- Detailed memory usage analysis with human-readable units (kB, MB)
- Comprehensive scaling analysis from 10 to 100,000 instances
- Performance characteristics and scaling efficiency metrics
- Memory growth patterns and per-instance consistency analysis
- Efficiency metrics and optimization recommendations
- Troubleshooting guide for memory issues
- Constraint definitions and thresholds

#### Key Performance Characteristics

- **Linear Scaling**: Memory usage scales predictably from 10 to 100,000 instances
- **Consistent Per-Instance Cost**: ~1.9-2.4 kB per instance across all scales
- **Efficient Storage**: Optimized tree structures minimize overhead
- **High-Volume Performance**: 100,000 instances use only ~189 MB (excellent memory efficiency)
- **Scope Efficiency**: Minimal additional memory for scoped instances
- **Fast Creation**: Instance creation remains fast even at large scales
- **Human-Readable Reporting**: All memory measurements displayed in kB/MB format

Use these metrics to monitor memory usage in production and ensure the registry infrastructure remains performant as your application scales from prototype to enterprise levels.

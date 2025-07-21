/**
 * RegistryHub Coordinates Discovery Example
 *
 * This example demonstrates how to use the getAllCoordinates() method on RegistryHub to:
 * - Discover all registered instances across multiple registries
 * - See which registry type contains each coordinate
 * - Analyze cross-registry service architecture
 * - Implement system-wide monitoring and discovery
 * - Validate service deployment across different domains
 *
 * Run this example with: npx tsx examples/registry-hub-coordinates-example.ts
 *
 * Note: In a real application, import from the built package:
 * import { createRegistryHub, createRegistry, createInstance } from '@fjell/registry';
 */

// Import the actual registry functionality
import { createRegistryHub } from '../src/RegistryHub';
import { createRegistry } from '../src/Registry';
import { createInstance } from '../src/Instance';

// ===== Service Examples =====

class AuthService {
  constructor(private provider: string, private environment: string) { }

  authenticate(token: string) { // eslint-disable-line @typescript-eslint/no-unused-vars
    console.log(`Authenticating with ${this.provider} in ${this.environment}`);
    return { userId: 'user123', provider: this.provider };
  }

  getInfo() {
    return `${this.provider} Auth (${this.environment})`;
  }
}

class DataRepository {
  constructor(private database: string, private table: string) { }

  save(data: any) {
    console.log(`Saving to ${this.database}.${this.table}:`, data);
    return { id: 'saved123', database: this.database };
  }

  getInfo() {
    return `${this.database} Repository for ${this.table}`;
  }
}

class CacheStore {
  constructor(private type: string, private ttl: number) { }

  set(key: string, value: any) { // eslint-disable-line @typescript-eslint/no-unused-vars
    console.log(`Caching ${key} in ${this.type} for ${this.ttl}s`);
    return { cached: true, type: this.type };
  }

  getInfo() {
    return `${this.type} Cache (TTL: ${this.ttl}s)`;
  }
}

class IntegrationService {
  constructor(private provider: string, private version: string) { }

  call(endpoint: string, data: any) { // eslint-disable-line @typescript-eslint/no-unused-vars
    console.log(`Calling ${this.provider} v${this.version} at ${endpoint}`);
    return { success: true, provider: this.provider };
  }

  getInfo() {
    return `${this.provider} Integration v${this.version}`;
  }
}

// ===== Main Example =====

async function runRegistryHubCoordinatesExample() {
  console.log('🌐 RegistryHub Coordinates Discovery Example\n');

  // Step 1: Create RegistryHub and multiple registries
  console.log('1. Creating RegistryHub and domain-specific registries...');
  const hub = createRegistryHub();

  const authRegistry = createRegistry('auth');
  const dataRegistry = createRegistry('data');
  const cacheRegistry = createRegistry('cache');
  const integrationsRegistry = createRegistry('integrations');

  console.log('   ✅ RegistryHub created');
  console.log('   ✅ 4 domain registries created\n');

  // Step 2: Register all registries in the hub
  console.log('2. Registering registries in the hub...');
  hub.registerRegistry(authRegistry);
  hub.registerRegistry(dataRegistry);
  hub.registerRegistry(cacheRegistry);
  hub.registerRegistry(integrationsRegistry);

  console.log('   ✅ All registries registered in hub');
  console.log(`   📊 Registered registry types: ${hub.getRegisteredTypes().join(', ')}\n`);

  // Step 3: Create instances across different registries and environments
  console.log('3. Creating instances across multiple registries and environments...\n');

  // Auth Registry - Different authentication providers
  authRegistry.createInstance(
    ['Auth', 'JWT'],
    ['production', 'oauth'],
    (coordinate, context) => {
      const service = new AuthService('JWT', 'production');
      const instance = createInstance(context.registry, coordinate);
      (instance as any).authenticate = service.authenticate.bind(service);
      (instance as any).getInfo = service.getInfo.bind(service);
      return instance;
    }
  );
  console.log('   ✅ JWT Auth (production) registered in auth registry');

  authRegistry.createInstance(
    ['Auth', 'SAML'],
    ['production', 'enterprise'],
    (coordinate, context) => {
      const service = new AuthService('SAML', 'production');
      const instance = createInstance(context.registry, coordinate);
      (instance as any).authenticate = service.authenticate.bind(service);
      (instance as any).getInfo = service.getInfo.bind(service);
      return instance;
    }
  );
  console.log('   ✅ SAML Auth (production) registered in auth registry');

  authRegistry.createInstance(
    ['Auth', 'Local'],
    ['development', 'testing'],
    (coordinate, context) => {
      const service = new AuthService('Local', 'development');
      const instance = createInstance(context.registry, coordinate);
      (instance as any).authenticate = service.authenticate.bind(service);
      (instance as any).getInfo = service.getInfo.bind(service);
      return instance;
    }
  );
  console.log('   ✅ Local Auth (development) registered in auth registry');

  // Data Registry - Different databases and entities
  dataRegistry.createInstance(
    ['Repository', 'User'],
    ['production', 'firestore'],
    (coordinate, context) => {
      const repo = new DataRepository('Firestore', 'users');
      const instance = createInstance(context.registry, coordinate);
      (instance as any).save = repo.save.bind(repo);
      (instance as any).getInfo = repo.getInfo.bind(repo);
      return instance;
    }
  );
  console.log('   ✅ User Repository (Firestore/production) registered in data registry');

  dataRegistry.createInstance(
    ['Repository', 'User'],
    ['development', 'postgresql'],
    (coordinate, context) => {
      const repo = new DataRepository('PostgreSQL', 'users');
      const instance = createInstance(context.registry, coordinate);
      (instance as any).save = repo.save.bind(repo);
      (instance as any).getInfo = repo.getInfo.bind(repo);
      return instance;
    }
  );
  console.log('   ✅ User Repository (PostgreSQL/development) registered in data registry');

  dataRegistry.createInstance(
    ['Repository', 'Order'],
    ['production', 'firestore'],
    (coordinate, context) => {
      const repo = new DataRepository('Firestore', 'orders');
      const instance = createInstance(context.registry, coordinate);
      (instance as any).save = repo.save.bind(repo);
      (instance as any).getInfo = repo.getInfo.bind(repo);
      return instance;
    }
  );
  console.log('   ✅ Order Repository (Firestore/production) registered in data registry');

  // Cache Registry - Different cache implementations
  cacheRegistry.createInstance(
    ['Cache', 'Session'],
    ['production', 'redis'],
    (coordinate, context) => {
      const cache = new CacheStore('Redis', 3600);
      const instance = createInstance(context.registry, coordinate);
      (instance as any).set = cache.set.bind(cache);
      (instance as any).getInfo = cache.getInfo.bind(cache);
      return instance;
    }
  );
  console.log('   ✅ Session Cache (Redis/production) registered in cache registry');

  cacheRegistry.createInstance(
    ['Cache', 'Query'],
    ['production', 'memcached'],
    (coordinate, context) => {
      const cache = new CacheStore('Memcached', 1800);
      const instance = createInstance(context.registry, coordinate);
      (instance as any).set = cache.set.bind(cache);
      (instance as any).getInfo = cache.getInfo.bind(cache);
      return instance;
    }
  );
  console.log('   ✅ Query Cache (Memcached/production) registered in cache registry');

  cacheRegistry.createInstance(
    ['Cache', 'Memory'],
    ['development', 'local'],
    (coordinate, context) => {
      const cache = new CacheStore('In-Memory', 300);
      const instance = createInstance(context.registry, coordinate);
      (instance as any).set = cache.set.bind(cache);
      (instance as any).getInfo = cache.getInfo.bind(cache);
      return instance;
    }
  );
  console.log('   ✅ Memory Cache (local/development) registered in cache registry');

  // Integrations Registry - External service integrations
  integrationsRegistry.createInstance(
    ['Payment', 'Stripe'],
    ['production', 'live'],
    (coordinate, context) => {
      const integration = new IntegrationService('Stripe', '2023-10');
      const instance = createInstance(context.registry, coordinate);
      (instance as any).call = integration.call.bind(integration);
      (instance as any).getInfo = integration.getInfo.bind(integration);
      return instance;
    }
  );
  console.log('   ✅ Stripe Payment (production) registered in integrations registry');

  integrationsRegistry.createInstance(
    ['Email', 'SendGrid'],
    ['production', 'v3'],
    (coordinate, context) => {
      const integration = new IntegrationService('SendGrid', '3.0');
      const instance = createInstance(context.registry, coordinate);
      (instance as any).call = integration.call.bind(integration);
      (instance as any).getInfo = integration.getInfo.bind(integration);
      return instance;
    }
  );
  console.log('   ✅ SendGrid Email (production) registered in integrations registry');

  // Step 4: Demonstrate getAllCoordinates functionality
  console.log('\n4. Discovering all coordinates across the entire system...\n');

  const allCoordinates = hub.getAllCoordinates();
  console.log(`🔍 Total coordinates discovered: ${allCoordinates.length}`);
  console.log(`📦 Across ${hub.getRegisteredTypes().length} registry types\n`);

  // Display all coordinates grouped by registry type
  console.log('📍 All Registered Coordinates by Registry Type:');
  console.log('═'.repeat(80));

  const coordinatesByRegistry = allCoordinates.reduce((acc, item) => {
    if (!acc[item.registryType]) acc[item.registryType] = [];
    acc[item.registryType].push(item);
    return acc;
  }, {} as Record<string, typeof allCoordinates>);

  Object.entries(coordinatesByRegistry).forEach(([registryType, coords]) => {
    console.log(`\n📋 ${registryType.toUpperCase()} REGISTRY (${coords.length} instances):`);
    console.log('─'.repeat(60));
    coords.forEach((item, index) => {
      const coord = item.coordinate;
      console.log(`  ${index + 1}. ${coord.kta.join(' → ')}`);
      console.log(`     Scopes: ${coord.scopes.length > 0 ? coord.scopes.join(', ') : 'none'}`);
      console.log(`     Full: ${coord.toString()}`);
      console.log('');
    });
  });

  // Step 5: Demonstrate cross-registry analysis
  console.log('5. Cross-Registry Architecture Analysis...\n');

  // Environment analysis
  const environments = ['production', 'development', 'testing'];
  console.log('🌍 Environment Distribution:');
  environments.forEach(env => {
    const envCoords = allCoordinates.filter(c => c.coordinate.scopes.includes(env));
    console.log(`   ${env}: ${envCoords.length} service(s) across ${new Set(envCoords.map(c => c.registryType)).size} registry type(s)`);

    const registryBreakdown = envCoords.reduce((acc, c) => {
      acc[c.registryType] = (acc[c.registryType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(registryBreakdown).forEach(([regType, count]) => {
      console.log(`     - ${regType}: ${count}`);
    });
  });

  // Service type analysis
  console.log('\n🔧 Service Architecture Overview:');
  const serviceTypes = [...new Set(allCoordinates.map(c => c.coordinate.kta[0]))];
  serviceTypes.forEach(serviceType => {
    const serviceCoords = allCoordinates.filter(c => c.coordinate.kta[0] === serviceType);
    const registries = [...new Set(serviceCoords.map(c => c.registryType))];
    console.log(`   ${serviceType}: ${serviceCoords.length} implementation(s) in ${registries.join(', ')} registr${registries.length === 1 ? 'y' : 'ies'}`);
  });

  // Step 6: Demonstrate practical usage scenarios
  console.log('\n6. Practical Usage Scenarios...\n');

  // Scenario 1: System health check
  console.log('🏥 System Health Check:');
  const criticalServices = ['Auth', 'Repository', 'Cache', 'Payment'];
  criticalServices.forEach(service => {
    const implementations = allCoordinates.filter(c => c.coordinate.kta.includes(service));
    const status = implementations.length > 0 ? '✅ Available' : '❌ Missing';
    const details = implementations.length > 0 ? `(${implementations.length} implementation(s))` : '';
    console.log(`   ${service}: ${status} ${details}`);
  });

  // Scenario 2: Production readiness check
  console.log('\n🚀 Production Readiness Check:');
  const productionCoords = allCoordinates.filter(c => c.coordinate.scopes.includes('production'));
  const productionByRegistry = productionCoords.reduce((acc, c) => {
    acc[c.registryType] = (acc[c.registryType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log(`   Total production services: ${productionCoords.length}`);
  Object.entries(productionByRegistry).forEach(([regType, count]) => {
    console.log(`   - ${regType}: ${count} production service(s)`);
  });

  // Scenario 3: Development environment completeness
  console.log('\n💻 Development Environment Check:');
  const devCoords = allCoordinates.filter(c => c.coordinate.scopes.includes('development'));
  console.log(`   Development services available: ${devCoords.length}`);

  // Check if we have dev equivalents for production services
  const prodServiceKeys = productionCoords.map(c => c.coordinate.kta.join('.'));
  const devServiceKeys = devCoords.map(c => c.coordinate.kta.join('.'));

  const missingDevServices = prodServiceKeys.filter(key => !devServiceKeys.includes(key));
  if (missingDevServices.length > 0) {
    console.log('   ⚠️  Missing development equivalents for:');
    missingDevServices.forEach(service => console.log(`     - ${service}`));
  } else {
    console.log('   ✅ All production services have development equivalents');
  }

  console.log('\n✨ RegistryHub coordinates discovery example completed!');

  return {
    totalCoordinates: allCoordinates.length,
    coordinatesByRegistry,
    registryTypes: hub.getRegisteredTypes(),
    allCoordinates
  };
}

// Export for testing
export { runRegistryHubCoordinatesExample };

// Run the example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runRegistryHubCoordinatesExample().catch(console.error);
}

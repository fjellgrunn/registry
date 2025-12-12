/**
 * Coordinates Discovery Example
 *
 * This example demonstrates how to use the getCoordinates() method to:
 * - Discover all registered instances in a registry
 * - Inspect coordinates and their scopes
 * - Monitor registry state for debugging
 * - Implement discovery mechanisms
 *
 * Run this example with: npx tsx examples/coordinates-example.ts
 *
 * Note: In a real application, import from the built package:
 * import { createRegistry, createInstance } from '@fjell/registry';
 */

// Import the actual registry functionality
import { createRegistry } from '../src/Registry';
import { createInstance } from '../src/Instance';

// ===== Service Examples =====

class DatabaseService {
  constructor(private type: string, private environment: string) { }

  connect() {
    console.log(`Connected to ${this.type} database in ${this.environment}`);
  }

  getInfo() {
    return `${this.type} (${this.environment})`;
  }
}

class CacheService {
  constructor(private type: string) { }

  get(key: string) {
    console.log(`Getting ${key} from ${this.type} cache`);
    return `cached_${key}`;
  }

  getInfo() {
    return this.type;
  }
}

class LoggingService {
  constructor(private level: string) { }

  log(message: string) {
    console.log(`[${this.level.toUpperCase()}] ${message}`);
  }

  getInfo() {
    return `Logging at ${this.level} level`;
  }
}

// ===== Main Example =====

async function runCoordinatesExample() {
  console.log('🔍 Registry Coordinates Discovery Example\n');

  // Step 1: Create a registry
  console.log('1. Creating registry...');
  const registry = createRegistry('services');
  console.log('   ✅ Registry created\n');

  // Step 2: Register multiple instances with different scopes
  console.log('2. Registering instances with various configurations...\n');

  // Database services for different environments
  registry.createInstance(
    ['database'],
    ['production', 'postgres'],
    (coordinate, context) => {
      const service = new DatabaseService('PostgreSQL', 'production');
      const instance = createInstance(context.registry, coordinate);
      (instance as any).connect = service.connect.bind(service);
      (instance as any).getInfo = service.getInfo.bind(service);
      return instance;
    }
  );
  console.log('   ✅ PostgreSQL database (production) registered');

  registry.createInstance(
    ['database'],
    ['development', 'sqlite'],
    (coordinate, context) => {
      const service = new DatabaseService('SQLite', 'development');
      const instance = createInstance(context.registry, coordinate);
      (instance as any).connect = service.connect.bind(service);
      (instance as any).getInfo = service.getInfo.bind(service);
      return instance;
    }
  );
  console.log('   ✅ SQLite database (development) registered');

  // Cache services
  registry.createInstance(
    ['cache', 'redis'],
    ['production'],
    (coordinate, context) => {
      const service = new CacheService('Redis');
      const instance = createInstance(context.registry, coordinate);
      (instance as any).get = service.get.bind(service);
      (instance as any).getInfo = service.getInfo.bind(service);
      return instance;
    }
  );
  console.log('   ✅ Redis cache (production) registered');

  registry.createInstance(
    ['cache', 'memory'],
    ['development', 'testing'],
    (coordinate, context) => {
      const service = new CacheService('In-Memory');
      const instance = createInstance(context.registry, coordinate);
      (instance as any).get = service.get.bind(service);
      (instance as any).getInfo = service.getInfo.bind(service);
      return instance;
    }
  );
  console.log('   ✅ Memory cache (development/testing) registered');

  // Logging services
  registry.createInstance(
    ['logging'],
    ['production'],
    (coordinate, context) => {
      const service = new LoggingService('error');
      const instance = createInstance(context.registry, coordinate);
      (instance as any).log = service.log.bind(service);
      (instance as any).getInfo = service.getInfo.bind(service);
      return instance;
    }
  );
  console.log('   ✅ Error logging (production) registered');

  registry.createInstance(
    ['logging'],
    ['development'],
    (coordinate, context) => {
      const service = new LoggingService('debug');
      const instance = createInstance(context.registry, coordinate);
      (instance as any).log = service.log.bind(service);
      (instance as any).getInfo = service.getInfo.bind(service);
      return instance;
    }
  );
  console.log('   ✅ Debug logging (development) registered\n');

  // Step 3: Demonstrate getCoordinates functionality
  console.log('3. Discovering all registered coordinates...\n');

  const coordinates = registry.getCoordinates();
  console.log(`📊 Total registered coordinates: ${coordinates.length}\n`);

  // Display all coordinates with their details
  console.log('📍 Registered Coordinates:');
  console.log('─'.repeat(60));
  coordinates.forEach((coord, index) => {
    console.log(`${index + 1}. ${coord.toString()}`);
    console.log(`   Key Path: [${coord.kta.join(' → ')}]`);
    console.log(`   Scopes: ${coord.scopes.length > 0 ? coord.scopes.join(', ') : 'none'}`);
    console.log('');
  });

  // Step 4: Demonstrate filtering and analysis
  console.log('4. Analyzing coordinate patterns...\n');

  // Group by environment
  const byEnvironment = {
    production: coordinates.filter(c => c.scopes.includes('production')),
    development: coordinates.filter(c => c.scopes.includes('development')),
    testing: coordinates.filter(c => c.scopes.includes('testing')),
    unscoped: coordinates.filter(c => c.scopes.length === 0)
  };

  console.log('🏢 Coordinates by Environment:');
  Object.entries(byEnvironment).forEach(([env, coords]) => {
    if (coords.length > 0) {
      console.log(`   ${env}: ${coords.length} instance(s)`);
      coords.forEach(coord => {
        console.log(`     - ${coord.kta.join('.')}`);
      });
    }
  });

  // Group by service type (first element of kta)
  const byServiceType = coordinates.reduce((acc, coord) => {
    const serviceType = coord.kta[0];
    if (!acc[serviceType]) acc[serviceType] = [];
    acc[serviceType].push(coord);
    return acc;
  }, {} as Record<string, typeof coordinates>);

  console.log('\n🔧 Coordinates by Service Type:');
  Object.entries(byServiceType).forEach(([type, coords]) => {
    console.log(`   ${type}: ${coords.length} instance(s)`);
    coords.forEach(coord => {
      const scopeInfo = coord.scopes.length > 0 ? ` (${coord.scopes.join(', ')})` : '';
      console.log(`     - ${coord.kta.join('.')}${scopeInfo}`);
    });
  });

  // Step 5: Demonstrate practical usage scenarios
  console.log('\n5. Practical usage scenarios...\n');

  // Scenario 1: Health check - verify all expected services are registered
  console.log('🏥 Health Check Example:');
  const expectedServices = ['database', 'cache', 'logging'];
  const registeredServices = [...new Set(coordinates.map(c => c.kta[0]))];

  expectedServices.forEach(service => {
    const isRegistered = registeredServices.includes(service);
    console.log(`   ${service}: ${isRegistered ? '✅ Registered' : '❌ Missing'}`);
  });

  // Scenario 2: Environment validation
  console.log('\n🌍 Environment Validation:');
  const productionServices = coordinates.filter(c => c.scopes.includes('production'));
  const developmentServices = coordinates.filter(c => c.scopes.includes('development'));

  console.log(`   Production environment has ${productionServices.length} service(s) registered`);
  console.log(`   Development environment has ${developmentServices.length} service(s) registered`);

  // Scenario 3: Discovery mechanism
  console.log('\n🔍 Service Discovery Example:');
  console.log('   Available cache services:');
  coordinates
    .filter(c => c.kta.includes('cache'))
    .forEach(coord => {
      console.log(`     - ${coord.kta.join('.')} (${coord.scopes.join(', ') || 'any scope'})`);
    });

  console.log('\n✨ Coordinates discovery example completed!');

  return {
    totalCoordinates: coordinates.length,
    coordinates: coordinates,
    byEnvironment,
    byServiceType
  };
}

// Export for testing
export { runCoordinatesExample };

// Run the example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCoordinatesExample().catch(console.error);
}

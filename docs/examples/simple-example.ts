/**
 * Simple Registry Example - No RegistryHub, No Scopes
 *
 * This example demonstrates the simplest possible way to use the Registry library:
 * - Create a registry without a RegistryHub
 * - Register instances without any scopes
 * - Retrieve instances without any scopes
 * - Perfect for simple applications that just need basic dependency injection
 *
 * Run this example with: npx tsx examples/simple-example.ts
 *
 * Note: In a real application, import from the built package:
 * import { createRegistry, createInstance } from '@fjell/registry';
 */

// Import the actual registry functionality
import { createRegistry } from '../src/Registry';
import { createInstance } from '../src/Instance';

// ===== Simple Service Examples =====

// Example 1: A simple logger service
class SimpleLogger {
  log(message: string) {
    console.log(`[LOG] ${new Date().toISOString()}: ${message}`);
  }

  error(message: string) {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`);
  }
}

// Example 2: A simple configuration service
class SimpleConfig {
  private config = {
    appName: 'My Simple App',
    version: '1.0.0',
    debugMode: true
  };

  get(key: string): any {
    return this.config[key as keyof typeof this.config];
  }

  set(key: string, value: any): void {
    (this.config as any)[key] = value;
  }
}

// Example 3: A simple data service
class SimpleDataService {
  private data: string[] = [];

  add(item: string): void {
    this.data.push(item);
  }

  getAll(): string[] {
    return [...this.data];
  }

  count(): number {
    return this.data.length;
  }
}

// ===== Main Example =====

async function runSimpleExample() {
  console.log('🚀 Simple Registry Example - No RegistryHub, No Scopes\n');

  // Step 1: Create a simple registry (no RegistryHub needed!)
  console.log('1. Creating a simple registry...');
  const registry = createRegistry('app');
  console.log('   ✅ Registry created with type: "app"\n');

  // Step 2: Create instances using factories (no scopes needed!)
  console.log('2. Creating and registering instances...');

  // Logger instance
  registry.createInstance(
    ['logger'],
    [], // Empty scopes array - we don't need scopes!
    (coordinate, context) => {
      // Create the actual service
      const service = new SimpleLogger();

      // Create and return an instance that wraps the service
      const instance = createInstance(context.registry, coordinate);
      // Attach service methods to the instance for easy access
      (instance as any).log = service.log.bind(service);
      (instance as any).error = service.error.bind(service);
      return instance;
    }
  );
  console.log('   ✅ Logger instance created and registered');

  // Config instance
  registry.createInstance(
    ['config'],
    [], // No scopes needed
    (coordinate, context) => {
      const service = new SimpleConfig();
      const instance = createInstance(context.registry, coordinate);
      (instance as any).get = service.get.bind(service);
      (instance as any).set = service.set.bind(service);
      return instance;
    }
  );
  console.log('   ✅ Config instance created and registered');

  // Data service instance
  registry.createInstance(
    ['data'],
    [], // No scopes needed
    (coordinate, context) => {
      const service = new SimpleDataService();
      const instance = createInstance(context.registry, coordinate);
      (instance as any).add = service.add.bind(service);
      (instance as any).getAll = service.getAll.bind(service);
      (instance as any).count = service.count.bind(service);
      return instance;
    }
  );
  console.log('   ✅ Data service instance created and registered\n');

  // Step 3: Retrieve instances (no scopes needed!)
  console.log('3. Retrieving instances from registry...');

  const retrievedLogger = registry.get(['logger']); // No scopes parameter needed!
  const retrievedConfig = registry.get(['config']); // No scopes parameter needed!
  const retrievedData = registry.get(['data']); // No scopes parameter needed!

  console.log('   ✅ All instances retrieved successfully\n');

  // Step 4: Verify everything works
  console.log('4. Verifying the registry works...');

  if (retrievedLogger && retrievedConfig && retrievedData) {
    console.log('   ✅ All instances found in registry');
    console.log(`   📋 Logger coordinate: ${JSON.stringify(retrievedLogger.coordinate)}`);
    console.log(`   📋 Config coordinate: ${JSON.stringify(retrievedConfig.coordinate)}`);
    console.log(`   📋 Data coordinate: ${JSON.stringify(retrievedData.coordinate)}\n`);
  } else {
    console.log('   ❌ Some instances were not found');
    return;
  }

  // Step 5: Show practical usage
  console.log('5. Practical usage example...');
  console.log('   In a real app, you would extend the instances with your actual services:');
  console.log('   - Attach your service methods to the instance');
  console.log('   - Use the registry to get dependencies between services');
  console.log('   - Access instances from anywhere in your app\n');

  // Step 6: Demonstrate the services actually work!
  console.log('6. Testing the services...');

  // Test the logger
  const logger = registry.get(['logger']);
  if (logger) {
    (logger as any).log('This is a test log message from the registry!');
  }

  // Test the config
  const config = registry.get(['config']);
  if (config) {
    console.log(`   📋 App name from config: ${(config as any).get('appName')}`);
    (config as any).set('newProperty', 'This was set dynamically!');
    console.log(`   📋 New property: ${(config as any).get('newProperty')}`);
  }

  // Test the data service
  const dataService = registry.get(['data']);
  if (dataService) {
    (dataService as any).add('Item 1');
    (dataService as any).add('Item 2');
    (dataService as any).add('Item 3');
    console.log(`   📋 Data service has ${(dataService as any).count()} items`);
    console.log(`   📋 All items: ${JSON.stringify((dataService as any).getAll())}`);
  }

  console.log('   ✅ All services working correctly!\n');

  console.log('✨ Simple Registry Example Complete!');
  console.log('\n📝 Key Takeaways:');
  console.log('   • No RegistryHub required - just call createRegistry()');
  console.log('   • No scopes required - pass empty array [] or omit entirely');
  console.log('   • Perfect for simple dependency injection needs');
  console.log('   • You can always add RegistryHub and scopes later as your app grows');
}

// ===== Advanced Simple Example =====

async function runAdvancedSimpleExample() {
  console.log('\n' + '='.repeat(60));
  console.log('🔥 Advanced Simple Example - Service Dependencies');
  console.log('='.repeat(60) + '\n');

  const registry = createRegistry('advanced-app');

  // Create a notification service that depends on the logger
  class NotificationService {
    constructor(private logger: any) { }

    sendNotification(message: string) {
      this.logger.log(`Sending notification: ${message}`);
      // In a real app, this would send actual notifications
      console.log(`📢 Notification sent: ${message}`);
    }
  }

  // Register logger first
  registry.createInstance(['logger'], [], (coordinate, context) => {
    const service = new SimpleLogger();
    const instance = createInstance(context.registry, coordinate);
    // Attach service methods to instance for easy access
    (instance as any).log = service.log.bind(service);
    (instance as any).error = service.error.bind(service);
    return instance;
  });

  // Register notification service that uses the logger
  registry.createInstance(['notification'], [], (coordinate, context) => {
    // Get the logger dependency from the registry
    const logger = context.registry.get(['logger']);
    const service = new NotificationService(logger);
    const instance = createInstance(context.registry, coordinate);
    (instance as any).sendNotification = service.sendNotification.bind(service);
    return instance;
  });

  // Use the services
  const notificationService = registry.get(['notification']);
  if (notificationService) {
    (notificationService as any).sendNotification('Welcome to the simple registry!');
  }

  console.log('\n✨ This shows how services can depend on each other');
  console.log('   even in the simple, no-scopes approach!');
}

// Run the examples
// Note: In ES modules, we can't use require.main === module
// So we'll just run the examples directly when this file is executed
runSimpleExample()
  .then(() => runAdvancedSimpleExample())
  .catch(console.error);

export { runSimpleExample, runAdvancedSimpleExample };

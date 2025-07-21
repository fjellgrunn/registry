import { createRegistry, Instance } from '../src';
import { ServiceClient } from '../src/RegistryStats';

export async function runRegistryStatisticsExample() {
  // Example demonstrating Registry statistics tracking with scopes
  console.log('=== Registry Statistics Tracking with Scopes Example ===\n');

  // Create a registry
  const registry = createRegistry('services');

  // Create some mock instances for different environments
  const authProdService: Instance<'auth'> = {
    coordinate: { kta: ['auth'], scopes: ['production'] } as any,
    registry: registry as any,
  } as any;

  const authDevService: Instance<'auth'> = {
    coordinate: { kta: ['auth'], scopes: ['development'] } as any,
    registry: registry as any,
  } as any;

  const userProdService: Instance<'user'> = {
    coordinate: { kta: ['user'], scopes: ['production', 'sql'] } as any,
    registry: registry as any,
  } as any;

  const userDevService: Instance<'user'> = {
    coordinate: { kta: ['user'], scopes: ['development', 'nosql'] } as any,
    registry: registry as any,
  } as any;

  const cacheService: Instance<'cache', 'redis'> = {
    coordinate: { kta: ['cache', 'redis'], scopes: [] } as any,
    registry: registry as any,
  } as any;

  // Register the services with different scopes
  registry.register(['auth'], authProdService, { scopes: ['production'] });
  registry.register(['auth'], authDevService, { scopes: ['development'] });
  registry.register(['user'], userProdService, { scopes: ['production', 'sql'] });
  registry.register(['user'], userDevService, { scopes: ['development', 'nosql'] });
  registry.register(['cache', 'redis'], cacheService); // No scopes

  // Check initial statistics
  let stats = registry.getStatistics();
  console.log('Initial statistics:');
  console.log(`Total get calls: ${stats.totalGetCalls}`);
  console.log(`Coordinate call records: ${stats.coordinateCallRecords.length} entries`);
  console.log('');

  // Use the services with different scope combinations and clients
  console.log('Making service calls with different scopes and clients...');

  // Application calls (direct calls from the application)
  registry.get(['auth'], { scopes: ['production'], client: 'MyWebApp' });
  registry.get(['auth'], { scopes: ['development'], client: 'MyWebApp' });
  registry.get(['auth'], { scopes: ['production'], client: 'MyWebApp' }); // Same app, second call

  // Service-to-service calls (simulated by specifying service clients)
  const orderServiceClient: ServiceClient = {
    registryType: 'services',
    coordinate: { kta: ['order'], scopes: ['business'] }
  };

  const paymentServiceClient: ServiceClient = {
    registryType: 'services',
    coordinate: { kta: ['payment'], scopes: ['stripe'] }
  };

  registry.get(['user'], { scopes: ['production', 'sql'], client: orderServiceClient });
  registry.get(['user'], { scopes: ['sql', 'production'], client: orderServiceClient }); // Same service, scope order normalized
  registry.get(['user'], { scopes: ['development', 'nosql'], client: paymentServiceClient });

  // Mixed calls - some with no client specified
  registry.get(['cache', 'redis']); // No client specified
  registry.get(['cache', 'redis'], { client: 'CacheUtility' }); // Application client

  // More service-to-service calls
  registry.get(['auth'], { scopes: ['production'], client: orderServiceClient });
  registry.get(['cache', 'redis'], { client: paymentServiceClient });

  // Check updated statistics
  stats = registry.getStatistics();
  console.log('\nStatistics after service calls:');
  console.log(`Total get calls: ${stats.totalGetCalls}`);
  console.log('\nClient Summary:');
  console.log(`  Service-to-service calls: ${stats.clientSummary.serviceCalls}`);
  console.log(`  Application calls: ${stats.clientSummary.applicationCalls}`);
  console.log(`  Unidentified calls: ${stats.clientSummary.unidentifiedCalls}`);
  console.log('\nDetailed coordinate call records:');

  // Display statistics for each coordinate/scope combination with client breakdown
  stats.coordinateCallRecords.forEach((record, index) => {
    const ktaDisplay = record.kta.join(' → ');
    const scopesDisplay = record.scopes.length > 0 ? record.scopes.join(', ') : 'no scopes';
    console.log(`  ${index + 1}. ${ktaDisplay} [${scopesDisplay}]: ${record.count} calls`);

    // Show client breakdown
    record.clientCalls.forEach((clientCall, clientIndex) => {
      if (typeof clientCall.client === 'string') {
        console.log(`    ${clientIndex + 1}a. App "${clientCall.client}": ${clientCall.count} calls`);
      } else if (clientCall.client) {
        const serviceDisplay = clientCall.client.coordinate.kta.join('.');
        const serviceScopeDisplay = clientCall.client.coordinate.scopes.join(', ');
        console.log(`    ${clientIndex + 1}b. Service ${clientCall.client.registryType}/${serviceDisplay}[${serviceScopeDisplay}]: ${clientCall.count} calls`);
      } else {
        console.log(`    ${clientIndex + 1}c. Unidentified client: ${clientCall.count} calls`);
      }
    });
  });

  // Analysis by coordinate (aggregating across scopes)
  console.log('\nAggregated analysis by coordinate:');
  const coordinateMap = new Map<string, number>();

  stats.coordinateCallRecords.forEach(record => {
    const ktaKey = record.kta.join('.');
    coordinateMap.set(ktaKey, (coordinateMap.get(ktaKey) || 0) + record.count);
  });

  for (const [coordinate, totalCalls] of coordinateMap) {
    console.log(`  ${coordinate}: ${totalCalls} total calls`);
  }

  // Find the most accessed coordinate/scope combination
  let mostAccessedRecord = stats.coordinateCallRecords[0];
  for (const record of stats.coordinateCallRecords) {
    if (record.count > mostAccessedRecord.count) {
      mostAccessedRecord = record;
    }
  }

  if (mostAccessedRecord) {
    const ktaDisplay = mostAccessedRecord.kta.join(' → ');
    const scopesDisplay = mostAccessedRecord.scopes.length > 0
      ? mostAccessedRecord.scopes.join(', ')
      : 'no scopes';
    console.log(`\nMost accessed: ${ktaDisplay} [${scopesDisplay}] (${mostAccessedRecord.count} calls)`);
  }

  // Environment-based analysis with client types
  console.log('\nEnvironment-based analysis:');
  let prodCalls = 0;
  let devCalls = 0;
  let noScopeCalls = 0;
  let prodAppCalls = 0;
  let prodServiceCalls = 0;
  let devAppCalls = 0;
  let devServiceCalls = 0;

  stats.coordinateCallRecords.forEach(record => {
    if (record.scopes.includes('production')) {
      prodCalls += record.count;
      record.clientCalls.forEach(clientCall => {
        if (typeof clientCall.client === 'string') {
          prodAppCalls += clientCall.count;
        } else if (clientCall.client) {
          prodServiceCalls += clientCall.count;
        }
      });
    } else if (record.scopes.includes('development')) {
      devCalls += record.count;
      record.clientCalls.forEach(clientCall => {
        if (typeof clientCall.client === 'string') {
          devAppCalls += clientCall.count;
        } else if (clientCall.client) {
          devServiceCalls += clientCall.count;
        }
      });
    } else if (record.scopes.length === 0) {
      noScopeCalls += record.count;
    }
  });

  console.log(`  Production services: ${prodCalls} calls (${prodAppCalls} from apps, ${prodServiceCalls} from services)`);
  console.log(`  Development services: ${devCalls} calls (${devAppCalls} from apps, ${devServiceCalls} from services)`);
  console.log(`  Unscoped services: ${noScopeCalls} calls`);

  // Demonstrate immutability
  console.log('\nTesting immutability of returned statistics...');
  const stats1 = registry.getStatistics();
  const stats2 = registry.getStatistics();

  console.log(`Are record arrays the same object? ${stats1.coordinateCallRecords === stats2.coordinateCallRecords}`);
  console.log('(Should be false - each call returns a new array to prevent external mutation)');

  // Try to modify the returned records (this won't affect the internal tracking)
  if (stats1.coordinateCallRecords.length > 0) {
    const originalCount = stats1.coordinateCallRecords[0].count;
    stats1.coordinateCallRecords[0].count = 999;

    const stats3 = registry.getStatistics();
    console.log(`After trying to modify returned data, original count preserved? ${stats3.coordinateCallRecords[0].count === originalCount}`);
    console.log('(Should be true - internal tracking is protected from external mutation)');
  }

  console.log('\n=== Advanced Statistics Example Complete ===');

  // Demonstration of automatic service-to-service tracking via factory Registry
  console.log('\n=== Automatic Service-to-Service Tracking Demo ===');

  // Create a service that uses other services through the Registry passed to its factory
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const orderProcessorService = registry.createInstance(['order', 'processor'], ['business'], (coordinate, context) => {
    // The registry passed here is proxied to automatically track this service as the client

    // When this service calls get() on the registry, it will automatically be tracked
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const authService = context.registry.get(['auth'], { scopes: ['production'] });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const userService = context.registry.get(['user'], { scopes: ['production', 'sql'] });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cacheService = context.registry.get(['cache', 'redis']);

    console.log('Order processor created and retrieved dependencies automatically tracked!');

    return {
      coordinate,
      registry: context.registry,
      processOrder: (orderId: string) => {
        console.log(`Processing order ${orderId} with dependencies`);
        return { success: true, orderId };
      }
    };
  });

  // Get final statistics to show the automatic tracking
  const finalStats = registry.getStatistics();
  console.log(`\nAfter service creation with automatic tracking:`);
  console.log(`Total get calls: ${finalStats.totalGetCalls}`);
  console.log(`Service-to-service calls: ${finalStats.clientSummary.serviceCalls}`);

  // Show the new automatically tracked calls
  console.log('\nNew automatically tracked service calls:');
  finalStats.coordinateCallRecords.forEach(record => {
    record.clientCalls.forEach(clientCall => {
      if (clientCall.client && typeof clientCall.client !== 'string' &&
        clientCall.client.coordinate.kta.includes('order') &&
        clientCall.client.coordinate.kta.includes('processor')) {
        const ktaDisplay = record.kta.join(' → ');
        const scopesDisplay = record.scopes.length > 0 ? record.scopes.join(', ') : 'no scopes';
        console.log(`  ${ktaDisplay} [${scopesDisplay}] called by order.processor service: ${clientCall.count} calls`);
      }
    });
  });

  console.log('\n=== Automatic Tracking Demo Complete ===');

  // Return key statistics for testing
  return {
    totalGetCalls: finalStats.totalGetCalls,
    coordinateCallRecords: finalStats.coordinateCallRecords.length,
    mostAccessedCount: mostAccessedRecord ? mostAccessedRecord.count : 0,
    prodCalls,
    devCalls,
    noScopeCalls,
    clientSummary: finalStats.clientSummary
  };
}

// Run the example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runRegistryStatisticsExample().catch(console.error);
}

#!/usr/bin/env npx tsx

/**
 * RegistryHub with Different Service Types Example
 *
 * This example demonstrates how to use a RegistryHub to organize and retrieve
 * services of different types. Perfect for large applications that need to
 * categorize services by their purpose (data access, business logic, infrastructure, etc.)
 */

import { createRegistryHub } from '../src/RegistryHub';
import { createRegistry } from '../src/Registry';
import { createInstance } from '../src/Instance';

// ===================================================================
// Service Interfaces - Different types of services
// ===================================================================

interface AuthService {
  login(username: string, password: string): Promise<string>;
  logout(token: string): Promise<void>;
  validateToken(token: string): boolean;
}

interface UserRepository {
  findById(id: string): Promise<any>;
  save(user: any): Promise<void>;
  delete(id: string): Promise<void>;
}

interface CacheService {
  get(key: string): Promise<any>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  invalidate(key: string): Promise<void>;
}

interface EmailService {
  sendEmail(to: string, subject: string, body: string): Promise<boolean>;
  sendTemplate(template: string, data: any): Promise<boolean>;
}

interface LoggerService {
  info(message: string): void;
  error(message: string, error?: Error): void;
  debug(message: string): void;
}

// ===================================================================
// Service Implementations - Multiple implementations per type
// ===================================================================

class JwtAuthService implements AuthService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async login(username: string, password: string): Promise<string> {
    console.log(`🔐 JWT Auth: Logging in ${username}`);
    return `jwt-token-${username}-${Date.now()}`;
  }

  async logout(token: string): Promise<void> {
    console.log(`🔐 JWT Auth: Logging out token ${token.substring(0, 10)}...`);
  }

  validateToken(token: string): boolean {
    console.log(`🔐 JWT Auth: Validating token ${token.substring(0, 10)}...`);
    return token.startsWith('jwt-token-');
  }
}

class OAuth2AuthService implements AuthService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async login(username: string, password: string): Promise<string> {
    console.log(`🔒 OAuth2 Auth: Logging in ${username}`);
    return `oauth2-token-${username}-${Date.now()}`;
  }

  async logout(token: string): Promise<void> {
    console.log(`🔒 OAuth2 Auth: Logging out token ${token.substring(0, 10)}...`);
  }

  validateToken(token: string): boolean {
    console.log(`🔒 OAuth2 Auth: Validating token ${token.substring(0, 10)}...`);
    return token.startsWith('oauth2-token-');
  }
}

class PostgreSqlUserRepository implements UserRepository {
  async findById(id: string): Promise<any> {
    console.log(`🐘 PostgreSQL: Finding user ${id}`);
    return { id, name: `User ${id}`, source: 'postgresql' };
  }

  async save(user: any): Promise<void> {
    console.log(`🐘 PostgreSQL: Saving user ${user.id}`);
  }

  async delete(id: string): Promise<void> {
    console.log(`🐘 PostgreSQL: Deleting user ${id}`);
  }
}

class MongoUserRepository implements UserRepository {
  async findById(id: string): Promise<any> {
    console.log(`🍃 MongoDB: Finding user ${id}`);
    return { id, name: `User ${id}`, source: 'mongodb' };
  }

  async save(user: any): Promise<void> {
    console.log(`🍃 MongoDB: Saving user ${user.id}`);
  }

  async delete(id: string): Promise<void> {
    console.log(`🍃 MongoDB: Deleting user ${id}`);
  }
}

class RedisCacheService implements CacheService {
  async get(key: string): Promise<any> {
    console.log(`🔴 Redis Cache: Getting ${key}`);
    return `cached-value-${key}`;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    console.log(`🔴 Redis Cache: Setting ${key} (TTL: ${ttl || 'none'})`);
  }

  async invalidate(key: string): Promise<void> {
    console.log(`🔴 Redis Cache: Invalidating ${key}`);
  }
}

class MemoryCacheService implements CacheService {
  private cache = new Map<string, any>();

  async get(key: string): Promise<any> {
    console.log(`💾 Memory Cache: Getting ${key}`);
    return this.cache.get(key) || null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    console.log(`💾 Memory Cache: Setting ${key} (TTL: ${ttl || 'none'})`);
    this.cache.set(key, value);
  }

  async invalidate(key: string): Promise<void> {
    console.log(`💾 Memory Cache: Invalidating ${key}`);
    this.cache.delete(key);
  }
}

class SmtpEmailService implements EmailService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    console.log(`📧 SMTP Email: Sending to ${to} - ${subject}`);
    return true;
  }

  async sendTemplate(template: string, data: any): Promise<boolean> {
    console.log(`📧 SMTP Email: Sending template ${template} with data:`, data);
    return true;
  }
}

class SendGridEmailService implements EmailService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    console.log(`📨 SendGrid Email: Sending to ${to} - ${subject}`);
    return true;
  }

  async sendTemplate(template: string, data: any): Promise<boolean> {
    console.log(`📨 SendGrid Email: Sending template ${template} with data:`, data);
    return true;
  }
}

class ConsoleLoggerService implements LoggerService {
  info(message: string): void {
    console.log(`ℹ️  INFO: ${message}`);
  }

  error(message: string, error?: Error): void {
    console.log(`❌ ERROR: ${message}`, error);
  }

  debug(message: string): void {
    console.log(`🐛 DEBUG: ${message}`);
  }
}

class FileLoggerService implements LoggerService {
  info(message: string): void {
    console.log(`📝 FILE INFO: ${message}`);
  }

  error(message: string, error?: Error): void {
    console.log(`📝 FILE ERROR: ${message}`, error);
  }

  debug(message: string): void {
    console.log(`📝 FILE DEBUG: ${message}`);
  }
}

// ===================================================================
// Main Example
// ===================================================================

async function demonstrateRegistryHub() {
  console.log('🚀 Registry Hub with Different Service Types Example\n');

  // ================================================================
  // Step 1: Create the RegistryHub
  // ================================================================
  console.log('1️⃣  Creating RegistryHub...');
  const hub = createRegistryHub();

  // ================================================================
  // Step 2: Create different registries for different service types
  // ================================================================
  console.log('\n2️⃣  Creating specialized registries...');

  // Business logic services
  const servicesRegistry = createRegistry('services');
  hub.registerRegistry(servicesRegistry);

  // Data access layer
  const dataRegistry = createRegistry('data');
  hub.registerRegistry(dataRegistry);

  // Infrastructure services
  const infraRegistry = createRegistry('infrastructure');
  hub.registerRegistry(infraRegistry);

  // Communication services
  const communicationRegistry = createRegistry('communication');
  hub.registerRegistry(communicationRegistry);

  console.log('✅ Created registries:', hub.getRegisteredTypes().join(', '));

  // ================================================================
  // Step 3: Register services in their appropriate registries
  // ================================================================
  console.log('\n3️⃣  Registering services by type and scope...');

  // SERVICES REGISTRY - Business logic with different implementations by environment
  servicesRegistry.createInstance(['auth'], ['prod'], (coordinate, context) => {
    const service = new JwtAuthService();
    const instance = createInstance(context.registry, coordinate);
    (instance as any).login = service.login.bind(service);
    (instance as any).logout = service.logout.bind(service);
    (instance as any).validateToken = service.validateToken.bind(service);
    return instance;
  });

  servicesRegistry.createInstance(['auth'], ['dev'], (coordinate, context) => {
    const service = new OAuth2AuthService();
    const instance = createInstance(context.registry, coordinate);
    (instance as any).login = service.login.bind(service);
    (instance as any).logout = service.logout.bind(service);
    (instance as any).validateToken = service.validateToken.bind(service);
    return instance;
  });

  // DATA REGISTRY - Data access with different backends
  dataRegistry.createInstance(['user'], ['sql'], (coordinate, context) => {
    const service = new PostgreSqlUserRepository();
    const instance = createInstance(context.registry, coordinate);
    (instance as any).findById = service.findById.bind(service);
    (instance as any).save = service.save.bind(service);
    (instance as any).delete = service.delete.bind(service);
    return instance;
  });

  dataRegistry.createInstance(['user'], ['nosql'], (coordinate, context) => {
    const service = new MongoUserRepository();
    const instance = createInstance(context.registry, coordinate);
    (instance as any).findById = service.findById.bind(service);
    (instance as any).save = service.save.bind(service);
    (instance as any).delete = service.delete.bind(service);
    return instance;
  });

  // INFRASTRUCTURE REGISTRY - Infrastructure services
  infraRegistry.createInstance(['cache'], ['prod'], (coordinate, context) => {
    const service = new RedisCacheService();
    const instance = createInstance(context.registry, coordinate);
    (instance as any).get = service.get.bind(service);
    (instance as any).set = service.set.bind(service);
    (instance as any).invalidate = service.invalidate.bind(service);
    return instance;
  });

  infraRegistry.createInstance(['cache'], ['dev'], (coordinate, context) => {
    const service = new MemoryCacheService();
    const instance = createInstance(context.registry, coordinate);
    (instance as any).get = service.get.bind(service);
    (instance as any).set = service.set.bind(service);
    (instance as any).invalidate = service.invalidate.bind(service);
    return instance;
  });

  infraRegistry.createInstance(['logger'], ['prod'], (coordinate, context) => {
    const service = new FileLoggerService();
    const instance = createInstance(context.registry, coordinate);
    (instance as any).info = service.info.bind(service);
    (instance as any).error = service.error.bind(service);
    (instance as any).debug = service.debug.bind(service);
    return instance;
  });

  infraRegistry.createInstance(['logger'], ['dev'], (coordinate, context) => {
    const service = new ConsoleLoggerService();
    const instance = createInstance(context.registry, coordinate);
    (instance as any).info = service.info.bind(service);
    (instance as any).error = service.error.bind(service);
    (instance as any).debug = service.debug.bind(service);
    return instance;
  });

  // COMMUNICATION REGISTRY - External communication services
  communicationRegistry.createInstance(['email'], ['prod'], (coordinate, context) => {
    const service = new SendGridEmailService();
    const instance = createInstance(context.registry, coordinate);
    (instance as any).sendEmail = service.sendEmail.bind(service);
    (instance as any).sendTemplate = service.sendTemplate.bind(service);
    return instance;
  });

  communicationRegistry.createInstance(['email'], ['dev'], (coordinate, context) => {
    const service = new SmtpEmailService();
    const instance = createInstance(context.registry, coordinate);
    (instance as any).sendEmail = service.sendEmail.bind(service);
    (instance as any).sendTemplate = service.sendTemplate.bind(service);
    return instance;
  });

  console.log('✅ All services registered successfully');

  // ================================================================
  // Step 4: Retrieve services by type and demonstrate usage
  // ================================================================
  console.log('\n4️⃣  Retrieving services by type...\n');

  // Production environment setup
  console.log('🏭 PRODUCTION ENVIRONMENT:');
  console.log('─'.repeat(50));

  const prodAuth = hub.get('services', ['auth'], { scopes: ['prod'] }) as any;
  const sqlUserRepo = hub.get('data', ['user'], { scopes: ['sql'] }) as any;
  const prodCache = hub.get('infrastructure', ['cache'], { scopes: ['prod'] }) as any;
  const prodLogger = hub.get('infrastructure', ['logger'], { scopes: ['prod'] }) as any;
  const prodEmail = hub.get('communication', ['email'], { scopes: ['prod'] }) as any;

  // Demonstrate production workflow
  const token = await prodAuth.login('john_doe', 'password123');
  console.log(`✅ Production token received: ${token.substring(0, 20)}...`);
  const user = await sqlUserRepo.findById('user123');
  await prodCache.set('user:user123', user, 3600);
  prodLogger.info('User logged in successfully');
  await prodEmail.sendEmail('john@example.com', 'Welcome!', 'Welcome to our service!');

  console.log('\n🧪 DEVELOPMENT ENVIRONMENT:');
  console.log('─'.repeat(50));

  const devAuth = hub.get('services', ['auth'], { scopes: ['dev'] }) as any;
  const mongoUserRepo = hub.get('data', ['user'], { scopes: ['nosql'] }) as any;
  const devCache = hub.get('infrastructure', ['cache'], { scopes: ['dev'] }) as any;
  const devLogger = hub.get('infrastructure', ['logger'], { scopes: ['dev'] }) as any;
  const devEmail = hub.get('communication', ['email'], { scopes: ['dev'] }) as any;

  // Demonstrate development workflow
  const devToken = await devAuth.login('jane_doe', 'devpassword');
  console.log(`✅ Development token received: ${devToken.substring(0, 20)}...`);
  const devUser = await mongoUserRepo.findById('user456');
  await devCache.set('user:user456', devUser);
  devLogger.debug('Development user logged in');
  await devEmail.sendTemplate('welcome', { name: 'Jane', email: 'jane@example.com' });

  // ================================================================
  // Step 5: Demonstrate cross-registry service interactions
  // ================================================================
  console.log('\n5️⃣  Cross-registry service interactions...\n');

  // Get services from different registries and show they can work together
  const logger = hub.get('infrastructure', ['logger'], { scopes: ['dev'] }) as any;
  const cache = hub.get('infrastructure', ['cache'], { scopes: ['dev'] }) as any;
  const userRepo = hub.get('data', ['user'], { scopes: ['nosql'] }) as any;
  const auth = hub.get('services', ['auth'], { scopes: ['dev'] }) as any;

  logger.info('Starting complex workflow...');

  // Simulate a complex workflow using services from different registries
  const workflowToken = await auth.login('workflow_user', 'workflow_pass');
  logger.info(`User authenticated for workflow with token: ${workflowToken.substring(0, 15)}...`);

  const workflowUser = await userRepo.findById('workflow123');
  logger.info('User data retrieved');

  await cache.set('workflow:user123', workflowUser, 1800);
  logger.info('User data cached');

  const cachedUser = await cache.get('workflow:user123');
  logger.info(`Retrieved user from cache: ${JSON.stringify(cachedUser).substring(0, 50)}...`);

  // ================================================================
  // Step 6: Show registry type management
  // ================================================================
  console.log('\n6️⃣  Registry management...\n');

  console.log('📋 Available registry types:', hub.getRegisteredTypes());

  // Get specific registries for direct access if needed
  const servicesReg = hub.getRegistry('services');
  const dataReg = hub.getRegistry('data');

  console.log('🔧 Direct registry access available for:',
    servicesReg ? 'services' : 'none',
    dataReg ? 'data' : 'none'
  );

  console.log('\n✨ RegistryHub example completed successfully!');
  console.log('\n📚 Key Benefits Demonstrated:');
  console.log('   • Service organization by type/category');
  console.log('   • Environment-specific implementations');
  console.log('   • Clean separation of concerns');
  console.log('   • Centralized service discovery');
  console.log('   • Easy testing with different implementations');
}

// Run the example when executed directly
if (typeof process !== 'undefined' && process.argv?.[1]?.includes('registry-hub-types')) {
  demonstrateRegistryHub().catch(console.error);
}

export default {
  demonstrateRegistryHub
};

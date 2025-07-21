/**
 * Multi-Level Key Type Arrays - Working Example
 *
 * This example demonstrates how Registry supports hierarchical key paths with actual implementations:
 * - ['user'] - Single level (SQL vs NoSQL implementations)
 * - ['user', 'profile'] - Two levels (S3 vs Local storage implementations)
 * - ['user', 'profile', 'preference'] - Three levels (Redis implementation)
 * - ['task'] - Another single level (PostgreSQL vs MongoDB implementations)
 *
 * Run this example with: npx tsx examples/multi-level-keys.ts
 *
 * Note: In a real application, import from the built package:
 * import { createRegistry, createInstance } from '@fjell/registry';
 */

// Import the actual registry functionality
import { createRegistry } from '../src/Registry';
import { createInstance } from '../src/Instance';
import type { Registry } from '../src/types';

// Helper function to require a service (throw if not found)
function requireService(registry: Registry, keyPath: string[], options?: { scopes?: string[] }): any {
  const result = registry.get(keyPath, options);
  if (!result) {
    throw new Error(`Required service '${keyPath.join('.')}' not found`);
  }
  return result;
}

// ===== Service Interface Definitions =====

interface UserService {
  id: string;
  name: string;
  email: string;
  save(): Promise<void>;
  findById(id: string): Promise<UserService | null>;
}

interface UserProfileService {
  userId: string;
  avatar: string;
  bio: string;
  updateProfile(data: Partial<UserProfileService>): Promise<void>;
}

interface UserPreferenceService {
  userId: string;
  theme: 'light' | 'dark';
  notifications: boolean;
  updatePreferences(prefs: Partial<UserPreferenceService>): Promise<void>;
}

interface TaskService {
  id: string;
  title: string;
  completed: boolean;
  markComplete(): Promise<void>;
  createTask(data: { title: string; completed?: boolean }): Promise<TaskService>;
}

// ===== Service Interface Map (for documentation) =====
// In a real app, these would map key paths to their interface types:
// ['user'] -> UserService
// ['user', 'profile'] -> UserProfileService
// ['user', 'profile', 'preference'] -> UserPreferenceService
// ['task'] -> TaskService

// ===== Service Implementations =====

class SqlUserService implements UserService {
  constructor(public id: string, public name: string, public email: string) { }

  async save(): Promise<void> {
    console.log(`[SQL] Saving user ${this.name} to database`);
  }

  async findById(id: string): Promise<UserService | null> {
    console.log(`[SQL] Finding user by ID: ${id}`);
    if (id === this.id) return this;
    return null;
  }
}

class NoSqlUserService implements UserService {
  constructor(public id: string, public name: string, public email: string) { }

  async save(): Promise<void> {
    console.log(`[NoSQL] Saving user ${this.name} to document store`);
  }

  async findById(id: string): Promise<UserService | null> {
    console.log(`[NoSQL] Finding user by ID: ${id}`);
    if (id === this.id) return this;
    return null;
  }
}

class S3ProfileService implements UserProfileService {
  constructor(public userId: string, public avatar: string, public bio: string) { }

  async updateProfile(data: Partial<UserProfileService>): Promise<void> {
    console.log(`[S3] Updating profile for user ${this.userId}:`, data);
    Object.assign(this, data);
  }
}

class LocalProfileService implements UserProfileService {
  constructor(public userId: string, public avatar: string, public bio: string) { }

  async updateProfile(data: Partial<UserProfileService>): Promise<void> {
    console.log(`[Local] Updating profile for user ${this.userId}:`, data);
    Object.assign(this, data);
  }
}

class RedisPreferenceService implements UserPreferenceService {
  constructor(
    public userId: string,
    public theme: 'light' | 'dark' = 'light',
    public notifications: boolean = true
  ) { }

  async updatePreferences(prefs: Partial<UserPreferenceService>): Promise<void> {
    console.log(`[Redis] Updating preferences for user ${this.userId}:`, prefs);
    Object.assign(this, prefs);
  }
}

class PostgreSqlTaskService implements TaskService {
  constructor(public id: string, public title: string, public completed: boolean = false) { }

  async markComplete(): Promise<void> {
    console.log(`[PostgreSQL] Marking task "${this.title}" as complete`);
    this.completed = true;
  }

  async createTask(data: { title: string; completed?: boolean }): Promise<TaskService> {
    console.log(`[PostgreSQL] Creating new task: ${data.title}`);
    const newId = Math.random().toString(36).substr(2, 9);
    return new PostgreSqlTaskService(newId, data.title, data.completed ?? false);
  }
}

class MongoTaskService implements TaskService {
  constructor(public id: string, public title: string, public completed: boolean = false) { }

  async markComplete(): Promise<void> {
    console.log(`[MongoDB] Marking task "${this.title}" as complete`);
    this.completed = true;
  }

  async createTask(data: { title: string; completed?: boolean }): Promise<TaskService> {
    console.log(`[MongoDB] Creating new task: ${data.title}`);
    const newId = Math.random().toString(36).substr(2, 9);
    return new MongoTaskService(newId, data.title, data.completed ?? false);
  }
}

// ===== Working Example =====

export async function runMultiLevelKeysExample(): Promise<void> {
  console.log('🚀 Registry Multi-Level Keys - Working Example');
  console.log('');

  // Create real registry for demonstration
  const registry = createRegistry('multi-level-demo');

  // ===== Register implementations with different scopes =====

  console.log('📝 Registering services...');
  console.log('');

  // Single level - User service with different database implementations
  registry.createInstance(['user'], ['sql', 'prod'], (coordinate, context) => {
    const service = new SqlUserService('1', 'John Doe', 'john@example.com');
    const instance = createInstance(context.registry, coordinate);
    (instance as any).save = service.save.bind(service);
    (instance as any).findById = service.findById.bind(service);
    (instance as any).id = service.id;
    (instance as any).name = service.name;
    (instance as any).email = service.email;
    return instance;
  });

  registry.createInstance(['user'], ['nosql', 'dev'], (coordinate, context) => {
    const service = new NoSqlUserService('1', 'John Doe', 'john@example.com');
    const instance = createInstance(context.registry, coordinate);
    (instance as any).save = service.save.bind(service);
    (instance as any).findById = service.findById.bind(service);
    (instance as any).id = service.id;
    (instance as any).name = service.name;
    (instance as any).email = service.email;
    return instance;
  });

  // Two levels - Profile service with different storage implementations
  registry.createInstance(['user', 'profile'], ['s3', 'prod'], (coordinate, context) => {
    const service = new S3ProfileService('1', 'avatar.jpg', 'Software developer');
    const instance = createInstance(context.registry, coordinate);
    (instance as any).updateProfile = service.updateProfile.bind(service);
    (instance as any).userId = service.userId;
    (instance as any).avatar = service.avatar;
    (instance as any).bio = service.bio;
    return instance;
  });

  registry.createInstance(['user', 'profile'], ['local', 'dev'], (coordinate, context) => {
    const service = new LocalProfileService('1', 'avatar.jpg', 'Software developer');
    const instance = createInstance(context.registry, coordinate);
    (instance as any).updateProfile = service.updateProfile.bind(service);
    (instance as any).userId = service.userId;
    (instance as any).avatar = service.avatar;
    (instance as any).bio = service.bio;
    return instance;
  });

  // Three levels - Preferences (single implementation)
  registry.createInstance(['user', 'profile', 'preference'], [], (coordinate, context) => {
    const service = new RedisPreferenceService('1', 'dark', true);
    const instance = createInstance(context.registry, coordinate);
    (instance as any).updatePreferences = service.updatePreferences.bind(service);
    (instance as any).userId = service.userId;
    (instance as any).theme = service.theme;
    (instance as any).notifications = service.notifications;
    return instance;
  });

  // Single level - Task service with different database implementations
  registry.createInstance(['task'], ['postgresql'], (coordinate, context) => {
    const service = new PostgreSqlTaskService('task-1', 'Write documentation', false);
    const instance = createInstance(context.registry, coordinate);
    (instance as any).markComplete = service.markComplete.bind(service);
    (instance as any).createTask = service.createTask.bind(service);
    (instance as any).id = service.id;
    (instance as any).title = service.title;
    (instance as any).completed = service.completed;
    return instance;
  });

  registry.createInstance(['task'], ['mongodb'], (coordinate, context) => {
    const service = new MongoTaskService('task-1', 'Write documentation', false);
    const instance = createInstance(context.registry, coordinate);
    (instance as any).markComplete = service.markComplete.bind(service);
    (instance as any).createTask = service.createTask.bind(service);
    (instance as any).id = service.id;
    (instance as any).title = service.title;
    (instance as any).completed = service.completed;
    return instance;
  });

  console.log('✅ All services registered successfully!');
  console.log('');

  // ===== Demonstrate environment-based selection =====

  console.log('🔄 Environment-based service selection:');
  console.log('');

  // Production environment
  const prodUser = registry.get(['user'], { scopes: ['prod'] });
  const prodProfile = registry.get(['user', 'profile'], { scopes: ['prod'] });

  if (prodUser && prodProfile) {
    console.log('🏭 Production Environment:');
    await (prodUser as any).save();
    await (prodProfile as any).updateProfile({ bio: 'Senior developer' });
    console.log('');
  }

  // Development environment
  const devUser = registry.get(['user'], { scopes: ['dev'] });
  const devProfile = registry.get(['user', 'profile'], { scopes: ['dev'] });

  if (devUser && devProfile) {
    console.log('🧪 Development Environment:');
    await (devUser as any).save();
    await (devProfile as any).updateProfile({ bio: 'Junior developer' });
    console.log('');
  }

  // ===== Demonstrate multi-level access =====

  console.log('🏗️ Multi-level service access:');
  console.log('');

  // Three-level access - preferences (no scope needed, single implementation)
  const preferences = requireService(registry, ['user', 'profile', 'preference']);
  console.log('📱 User preferences:');
  console.log(`   Theme: ${(preferences as any).theme}, Notifications: ${(preferences as any).notifications}`);
  await (preferences as any).updatePreferences({ theme: 'light' });
  console.log('');

  // ===== Demonstrate different implementations for same interface =====

  console.log('💾 Database implementation selection:');
  console.log('');

  const pgTask = registry.get(['task'], { scopes: ['postgresql'] });
  const mongoTask = registry.get(['task'], { scopes: ['mongodb'] });

  if (pgTask) {
    console.log('🐘 PostgreSQL Task Implementation:');
    await (pgTask as any).markComplete();
    const newTask = await (pgTask as any).createTask({ title: 'Add tests', completed: false });
    console.log(`   Created task: ${(newTask as any).title} (ID: ${(newTask as any).id})`);
    console.log('');
  }

  if (mongoTask) {
    console.log('🍃 MongoDB Task Implementation:');
    await (mongoTask as any).markComplete();
    const newTask = await (mongoTask as any).createTask({ title: 'Deploy app', completed: false });
    console.log(`   Created task: ${(newTask as any).title} (ID: ${(newTask as any).id})`);
    console.log('');
  }

  // ===== Demonstrate type safety =====

  console.log('🔒 Type Safety in Action:');
  console.log('');

  // In a real app, TypeScript would know the exact return types
  const typedUser = registry.get(['user'], { scopes: ['sql'] });
  const typedProfile = registry.get(['user', 'profile'], { scopes: ['s3'] });
  const typedPrefs = requireService(registry, ['user', 'profile', 'preference']);
  const typedTask = registry.get(['task'], { scopes: ['postgresql'] });

  console.log('✅ All services retrieved successfully!');
  console.log(`   User service type: ${typedUser?.constructor.name}`);
  console.log(`   Profile service type: ${typedProfile?.constructor.name}`);
  console.log(`   Preference service type: ${typedPrefs.constructor.name}`);
  console.log(`   Task service type: ${typedTask?.constructor.name}`);
  console.log('');

  // ===== Demonstrate error handling =====

  console.log('⚠️ Error handling:');
  console.log('');

  // This will throw an error (not found)
  try {
    const missingService = registry.get(['user'], { scopes: ['nonexistent'] });
    console.log(`Missing service with wrong scope: ${missingService}`);
  } catch (error: any) {
    console.log(`❌ Service with wrong scope throws error: ${error.message}`);
  }

  // This will throw an error
  try {
    requireService(registry, ['nonexistent', 'service']);
  } catch (error: any) {
    console.log(`❌ Caught expected error: ${error.message}`);
  }

  console.log('');
  console.log('🎉 Multi-level keys example completed successfully!');
  console.log('');
  console.log('Key takeaways:');
  console.log('• Each key path has its own consistent interface type');
  console.log('• Scopes allow multiple implementations of the same interface');
  console.log('• TypeScript provides full type safety for all operations');
  console.log('• Services can be organized hierarchically while remaining independent');
  console.log('• Perfect for microservices, A/B testing, and environment-specific implementations');
}

// Run the example when executed directly
if (typeof process !== 'undefined' && process.argv?.[1]?.includes('multi-level-keys')) {
  runMultiLevelKeysExample().catch(console.error);
}

export default {
  runMultiLevelKeysExample
};

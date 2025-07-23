# Fjell Core API Reference

Complete API documentation for all Fjell Core modules and utilities.

## Overview

Fjell Core provides essential item management, key utilities, and service coordination for the entire Fjell ecosystem. This reference covers all public APIs, interfaces, and utilities.

## Core Modules

### IFactory - Item Factory

The IFactory provides type-safe item creation with validation and configuration support.

#### Methods

##### `create<T>(type: string, data: Partial<T>): T`

Creates a new item of the specified type with type safety.

**Parameters:**
- `type` - String identifier for the item type
- `data` - Partial item data to initialize the item

**Returns:** Fully constructed item of type T

**Example:**
```typescript
import { IFactory } from '@fjell/core'

interface User {
  id: string
  name: string
  email: string
}

const user = IFactory.create<User>('user', {
  id: 'user-123',
  name: 'John Doe',
  email: 'john@example.com'
})
```

##### `createWithDefaults<T>(type: string, data: Partial<T>, defaults: Partial<T>): T`

Creates an item with default values applied when properties are missing.

**Parameters:**
- `type` - String identifier for the item type
- `data` - Partial item data
- `defaults` - Default values to apply for missing properties

**Returns:** Constructed item with defaults applied

---

### KUtils - Key Utilities

Utilities for hierarchical key generation, parsing, and manipulation.

#### Methods

##### `generateKey(components: string[]): string`

Generates a hierarchical key from an array of components.

**Parameters:**
- `components` - Array of string components to join

**Returns:** Generated key string with proper separators

**Example:**
```typescript
import { KUtils } from '@fjell/core'

const userKey = KUtils.generateKey(['users', 'user-123'])
// Returns: "users:user-123"

const profileKey = KUtils.generateKey(['users', 'user-123', 'profile'])
// Returns: "users:user-123:profile"
```

##### `parseKey(key: string): string[]`

Parses a hierarchical key back into its component parts.

**Parameters:**
- `key` - Key string to parse

**Returns:** Array of key components

**Example:**
```typescript
const components = KUtils.parseKey('users:user-123:profile')
// Returns: ['users', 'user-123', 'profile']
```

##### `isValidKey(key: string): boolean`

Validates whether a key is properly formatted according to Fjell standards.

**Parameters:**
- `key` - Key string to validate

**Returns:** Boolean indicating if the key is valid

##### `getParentKey(key: string): string | null`

Gets the parent key by removing the last component.

**Parameters:**
- `key` - Child key

**Returns:** Parent key string or null if no parent exists

**Example:**
```typescript
const parentKey = KUtils.getParentKey('users:user-123:profile')
// Returns: "users:user-123"
```

---

### AItemService - Abstract Service Base

Abstract base class for building domain-specific services with common patterns.

#### Properties

##### `logger: Logger`
Logger instance for the service (when logging is configured).

#### Methods

##### `validate<T>(item: T): Promise<void>`

Validates an item according to service-specific rules. Override in subclasses.

**Parameters:**
- `item` - Item to validate

**Throws:** ValidationError if validation fails

##### `save<T>(item: T): Promise<T>`

Saves an item to the underlying storage. Override in subclasses.

**Parameters:**
- `item` - Item to save

**Returns:** Promise resolving to the saved item

##### `findById<T>(id: string): Promise<T | null>`

Finds an item by its identifier. Override in subclasses.

**Parameters:**
- `id` - Item identifier

**Returns:** Promise resolving to the found item or null

##### `delete(id: string): Promise<void>`

Deletes an item by its identifier. Override in subclasses.

**Parameters:**
- `id` - Item identifier to delete

**Example:**
```typescript
import { AItemService, IFactory } from '@fjell/core'

class UserService extends AItemService {
  private users = new Map<string, User>()

  async save<User>(user: User): Promise<User> {
    // Custom save logic
    this.users.set(user.id, user)
    return user
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null
  }

  async validate(user: User): Promise<void> {
    if (!user.email?.includes('@')) {
      throw new Error('Valid email required')
    }
  }
}
```

---

### IQFactory - Query Factory

Factory for building complex queries for data retrieval.

#### Methods

##### `create(type: string): QueryBuilder`

Creates a new query builder for the specified entity type.

**Parameters:**
- `type` - Entity type to query

**Returns:** QueryBuilder instance for method chaining

**Example:**
```typescript
import { IQFactory } from '@fjell/core'

const query = IQFactory.create('user')
  .where('status', 'active')
  .where('age', '>', 18)
  .orderBy('createdAt', 'desc')
  .limit(10)
```

---

### QueryBuilder

Fluent interface for constructing queries with filters, sorting, and pagination.

#### Methods

##### `where(field: string, value: any): QueryBuilder`
##### `where(field: string, operator: string, value: any): QueryBuilder`

Adds a where condition to the query.

**Parameters:**
- `field` - Field name to filter on
- `operator` - Comparison operator ('=', '>', '<', '>=', '<=', '!=', 'like', 'in')
- `value` - Value to compare against

**Returns:** QueryBuilder for method chaining

##### `orderBy(field: string, direction?: 'asc' | 'desc'): QueryBuilder`

Adds ordering to the query results.

**Parameters:**
- `field` - Field to order by
- `direction` - Sort direction (default: 'asc')

**Returns:** QueryBuilder for method chaining

##### `limit(count: number): QueryBuilder`

Limits the number of results returned.

**Parameters:**
- `count` - Maximum number of results

**Returns:** QueryBuilder for method chaining

##### `offset(count: number): QueryBuilder`

Sets the number of results to skip (for pagination).

**Parameters:**
- `count` - Number of results to skip

**Returns:** QueryBuilder for method chaining

---

### IQUtils - Query Utilities

Utilities for executing and manipulating queries.

#### Methods

##### `execute<T>(query: QueryBuilder): Promise<T[]>`

Executes a query and returns the matching results.

**Parameters:**
- `query` - Query to execute

**Returns:** Promise resolving to array of matching items

##### `count(query: QueryBuilder): Promise<number>`

Counts the number of results that would be returned by a query.

**Parameters:**
- `query` - Query to count

**Returns:** Promise resolving to the count

##### `exists(query: QueryBuilder): Promise<boolean>`

Checks if any results exist for the given query.

**Parameters:**
- `query` - Query to check

**Returns:** Promise resolving to boolean indicating existence

---

## Core Interfaces

### Item

Base interface that all items should extend.

```typescript
interface Item {
  id: string
  type?: string
  createdAt?: string
  updatedAt?: string
}
```

### ServiceConfig

Configuration options for services.

```typescript
interface ServiceConfig {
  name: string
  version?: string
  logger?: Logger
  enableMetrics?: boolean
  timeout?: number
}
```

### ValidationResult

Result of item validation operations.

```typescript
interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings?: ValidationWarning[]
}
```

### WhereCondition

Represents a query filter condition.

```typescript
interface WhereCondition {
  field: string
  operator: string
  value: any
}
```

### OrderByClause

Represents a query ordering specification.

```typescript
interface OrderByClause {
  field: string
  direction: 'asc' | 'desc'
}
```

---

## Error Types

### CoreValidationError

Thrown when item validation fails.

```typescript
class CoreValidationError extends Error {
  details: ValidationDetail[]
  itemType?: string
}
```

### CoreNotFoundError

Thrown when a requested item cannot be found.

```typescript
class CoreNotFoundError extends Error {
  id: string
  itemType?: string
}
```

### CoreOperationError

Thrown when a core operation fails.

```typescript
class CoreOperationError extends Error {
  operation: string
  context?: any
}
```

---

## Usage Patterns

### Repository Pattern

```typescript
import { AItemService, IFactory, KUtils } from '@fjell/core'

class UserRepository extends AItemService {
  private storage = new Map<string, User>()

  async create(userData: Partial<User>): Promise<User> {
    const user = IFactory.create<User>('user', {
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      ...userData
    })

    await this.validate(user)
    return this.save(user)
  }

  async save(user: User): Promise<User> {
    const key = KUtils.generateKey(['users', user.id])
    this.storage.set(key, user)
    return user
  }

  async findById(id: string): Promise<User | null> {
    const key = KUtils.generateKey(['users', id])
    return this.storage.get(key) || null
  }

  private generateId(): string {
    return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}
```

### Query Building

```typescript
import { IQFactory, IQUtils } from '@fjell/core'

// Find active adult users, ordered by creation date
const activeAdults = await IQUtils.execute(
  IQFactory.create('user')
    .where('status', 'active')
    .where('age', '>=', 18)
    .orderBy('createdAt', 'desc')
    .limit(50)
)

// Check if any admin users exist
const hasAdmins = await IQUtils.exists(
  IQFactory.create('user')
    .where('role', 'admin')
)

// Count users by status
const activeCount = await IQUtils.count(
  IQFactory.create('user')
    .where('status', 'active')
)
```

### Service Composition

```typescript
class UserManagementService extends AItemService {
  constructor(
    private userRepo: UserRepository,
    private emailService: EmailService,
    private auditService: AuditService
  ) {
    super()
  }

  async registerUser(userData: Partial<User>): Promise<User> {
    // Create user
    const user = await this.userRepo.create(userData)

    // Send welcome email
    await this.emailService.sendWelcome(user.email)

    // Log the registration
    await this.auditService.log('user_registered', {
      userId: user.id,
      email: user.email
    })

    return user
  }
}
```

---

## Testing Utilities

Fjell Core provides testing utilities to help with unit and integration tests.

### TestUtils

```typescript
import { TestUtils } from '@fjell/core/testing'

// Create mock instances for testing
const mockFactory = TestUtils.createMockFactory()
const mockService = TestUtils.createMockService()

// Test helpers
expect(TestUtils.isValidKey('users:123')).toBe(true)
expect(TestUtils.getKeyComponents('users:123:profile')).toEqual(['users', '123', 'profile'])
```

---

This API reference provides comprehensive coverage of all Fjell Core functionality. For practical examples and usage patterns, see the Examples section of the documentation.

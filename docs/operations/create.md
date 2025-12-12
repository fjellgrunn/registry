# `create` Operation

Create new items with validation, error handling, and automatic retry logic.

## Syntax

### Primary Items (PItemApi)
```typescript
async create(item: Partial<Item<S>>): Promise<V>
```

### Contained Items (CItemApi)
```typescript
async create(item: Partial<Item<S>>, locations?: LocKeyArray<L1, L2, L3, L4, L5>): Promise<V>
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `item` | `Partial<Item<S>>` | Yes | Item data to create (partial object) |
| `locations` | `LocKeyArray` | No | Location context for contained items |

## Examples

### Basic Usage

```typescript
// Create a new user
const user = await userApi.create({
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user'
});

console.log('Created user:', user.id);
```

### Contained Items

```typescript
// Create a task for a specific user
const task = await taskApi.create({
  title: 'Complete project proposal',
  description: 'Draft and review the Q1 project proposal',
  priority: 'high',
  dueDate: '2024-02-15'
}, [userId]);

// Create an order item for a specific order
const orderItem = await orderItemApi.create({
  productId: 'prod-123',
  quantity: 2,
  price: 29.99
}, [customerId, orderId]);
```

### Complex Data Structures

```typescript
// Create user with nested data
const user = await userApi.create({
  name: 'Alice Johnson',
  email: 'alice@example.com',
  profile: {
    bio: 'Software engineer with 5 years experience',
    avatar: 'https://example.com/avatars/alice.jpg',
    preferences: {
      theme: 'dark',
      notifications: true
    }
  },
  tags: ['developer', 'full-stack', 'react'],
  metadata: {
    source: 'registration-form',
    campaign: 'spring-2024'
  }
});
```

### Batch Creation

```typescript
// Create multiple users efficiently
const userPromises = userData.map(data =>
  userApi.create(data).catch(error => ({ error, data }))
);

const results = await Promise.allSettled(userPromises);

results.forEach((result, index) => {
  if (result.status === 'fulfilled') {
    console.log(`User ${index + 1} created:`, result.value.id);
  } else {
    console.error(`Failed to create user ${index + 1}:`, result.reason);
  }
});
```

## Error Handling

The `create` operation includes comprehensive error handling with automatic retry:

```typescript
try {
  const user = await userApi.create({
    name: 'John Doe',
    email: 'john@example.com'
  });

  console.log('User created successfully:', user.id);

} catch (error) {
  if (error.code === 'VALIDATION_ERROR') {
    console.error('Validation failed:', error.validationErrors);
    // Handle specific validation errors
    error.validationErrors.forEach(err => {
      console.log(`${err.field}: ${err.message}`);
    });

  } else if (error.code === 'CONFLICT_ERROR') {
    console.error('User already exists or conflict detected');

  } else if (error.code === 'NETWORK_ERROR') {
    console.error('Network issue - operation was automatically retried');

  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

### Automatic Retry Behavior

Network and server errors are automatically retried with exponential backoff:

```typescript
// Configuration affects retry behavior
const config = {
  baseUrl: 'https://api.example.com',
  retryConfig: {
    maxRetries: 3,
    initialDelayMs: 1000,
    backoffMultiplier: 2
  }
};

const userApi = createPItemApi<User, 'user'>('user', ['users'], config);

// This will automatically retry on transient failures
const user = await userApi.create({ name: 'John', email: 'john@example.com' });
```

## Validation

### Client-side Validation

```typescript
function validateUserData(userData: Partial<User>): string[] {
  const errors: string[] = [];

  if (!userData.name || userData.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!userData.email || !isValidEmail(userData.email)) {
    errors.push('Valid email is required');
  }

  if (userData.age && (userData.age < 0 || userData.age > 150)) {
    errors.push('Age must be between 0 and 150');
  }

  return errors;
}

// Use validation before creating
const userData = { name: 'John', email: 'invalid-email' };
const validationErrors = validateUserData(userData);

if (validationErrors.length > 0) {
  console.error('Validation errors:', validationErrors);
  return;
}

const user = await userApi.create(userData);
```

### Server-side Validation Handling

```typescript
try {
  const user = await userApi.create({
    name: '',  // Invalid: empty name
    email: 'not-an-email',  // Invalid: bad email format
    age: -5  // Invalid: negative age
  });
} catch (error) {
  if (error.code === 'VALIDATION_ERROR') {
    // Server returned detailed validation errors
    console.log('Server validation errors:');
    error.validationErrors.forEach(err => {
      console.log(`- ${err.field}: ${err.message}`);
    });

    // Example output:
    // - name: Name cannot be empty
    // - email: Email format is invalid
    // - age: Age must be a positive number
  }
}
```

## Performance Considerations

### Efficient Creation Patterns

```typescript
// Use batch operations when possible
async function createUsersEfficiently(usersData: Partial<User>[]) {
  // Option 1: Parallel creation (faster but less control)
  const users = await Promise.all(
    usersData.map(data => userApi.create(data))
  );

  // Option 2: Sequential with error handling (more reliable)
  const results = [];
  for (const userData of usersData) {
    try {
      const user = await userApi.create(userData);
      results.push({ success: true, user });
    } catch (error) {
      results.push({ success: false, error, data: userData });
    }
  }

  return results;
}
```

### Large Object Optimization

```typescript
// For large objects, consider streaming or chunking
async function createLargeDocument(documentData: LargeDocument) {
  try {
    // Option 1: Direct creation
    return await documentApi.create(documentData);

  } catch (error) {
    if (error.code === 'PAYLOAD_TOO_LARGE_ERROR') {
      // Option 2: Create with minimal data, then update
      const doc = await documentApi.create({
        title: documentData.title,
        type: documentData.type
      });

      // Update with full content
      return await documentApi.update(doc.id, documentData);
    }
    throw error;
  }
}
```

## Return Value

Returns a Promise that resolves to the created item with generated fields:

```typescript
const user = await userApi.create({
  name: 'John Doe',
  email: 'john@example.com'
});

// Created user includes generated fields:
console.log(user);
// {
//   id: 'user-abc123',           // Generated ID
//   name: 'John Doe',            // Provided data
//   email: 'john@example.com',   // Provided data
//   active: true,                // Default value
//   createdAt: '2024-01-15T10:30:00Z',  // Generated timestamp
//   updatedAt: '2024-01-15T10:30:00Z',  // Generated timestamp
//   keyType: 'user'              // Generated metadata
// }
```

## Advanced Patterns

### Optimistic Creation

```typescript
// Create locally first, then sync with server
class OptimisticUserManager {
  private localUsers: User[] = [];

  async createUserOptimistically(userData: Partial<User>): Promise<User> {
    // Generate temporary ID
    const tempUser: User = {
      ...userData,
      id: `temp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      keyType: 'user',
      pending: true
    };

    // Add to local state immediately
    this.localUsers.push(tempUser);
    this.notifyUI(tempUser);

    try {
      // Create on server
      const serverUser = await userApi.create(userData);

      // Replace temp user with server user
      const index = this.localUsers.findIndex(u => u.id === tempUser.id);
      if (index >= 0) {
        this.localUsers[index] = serverUser;
        this.notifyUI(serverUser);
      }

      return serverUser;

    } catch (error) {
      // Remove temp user on failure
      this.localUsers = this.localUsers.filter(u => u.id !== tempUser.id);
      this.notifyError(error);
      throw error;
    }
  }
}
```

### Conditional Creation

```typescript
// Create only if item doesn't exist
async function createUserIfNotExists(userData: Partial<User>): Promise<User> {
  try {
    // Try to find existing user
    const existingUsers = await userApi.find('by-email', {
      email: userData.email
    });

    if (existingUsers.length > 0) {
      console.log('User already exists:', existingUsers[0].id);
      return existingUsers[0];
    }

    // Create new user
    return await userApi.create(userData);

  } catch (error) {
    if (error.code === 'CONFLICT_ERROR') {
      // Handle race condition - user was created between check and create
      console.log('User created by another process');
      const users = await userApi.find('by-email', { email: userData.email });
      return users[0];
    }
    throw error;
  }
}
```

### Transaction-like Creation

```typescript
// Create related items atomically
async function createUserWithProfile(
  userData: Partial<User>,
  profileData: Partial<UserProfile>
): Promise<{ user: User; profile: UserProfile }> {
  try {
    // Create user first
    const user = await userApi.create(userData);

    try {
      // Create profile linked to user
      const profile = await profileApi.create({
        ...profileData,
        userId: user.id
      });

      return { user, profile };

    } catch (profileError) {
      // Cleanup user if profile creation fails
      try {
        await userApi.remove({ id: user.id, keyType: 'user' });
      } catch (cleanupError) {
        console.error('Failed to cleanup user after profile error:', cleanupError);
      }
      throw profileError;
    }

  } catch (userError) {
    throw userError;
  }
}
```

## Related Operations

- [`update`](./update.md) - Update existing items
- [`get`](./get.md) - Retrieve created items
- [`all`](./all.md) - List created items
- [`remove`](./remove.md) - Delete items

## Next Steps

- Learn about [Validation Patterns](../guides/validation.md)
- Explore [Error Handling](../error-handling/README.md) for robust creation
- Review [Performance Optimization](../guides/performance.md) for efficient creation

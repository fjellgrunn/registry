# `get` Operation

Retrieve a single item by its key with automatic error handling and retry logic.

## Syntax

### Primary Items (PItemApi)
```typescript
async get(key: PriKey<S>): Promise<V | null>
```

### Contained Items (CItemApi)
```typescript
async get(key: ComKey<S, L1, L2, L3, L4, L5> | PriKey<S>): Promise<V | null>
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | `PriKey<S>` or `ComKey<S, ...>` | Yes | Key identifying the item to retrieve |

### Key Types

```typescript
// Primary Key (for PItemApi)
interface PriKey<S> {
  keyType: S;
  pk: string;
}

// Composite Key (for CItemApi)
interface ComKey<S, L1, L2, L3, L4, L5> {
  keyType: S;
  pk: string;
  l1?: LocKey<L1>;
  l2?: LocKey<L2>;
  // ... up to l5
}
```

## Examples

### Basic Usage

```typescript
// Get a user by ID
const userKey = { keyType: 'user', pk: 'user-123' };
const user = await userApi.get(userKey);

if (user) {
  console.log('Found user:', user.name);
} else {
  console.log('User not found');
}
```

### Contained Items

```typescript
// Get a task with composite key
const taskKey = {
  keyType: 'task',
  pk: 'task-456',
  l1: { lkType: 'user', lk: 'user-123' }
};

const task = await taskApi.get(taskKey);
```

### Error Handling

```typescript
try {
  const user = await userApi.get(userKey);

  if (!user) {
    console.log('User not found - this is normal');
    return;
  }

  console.log('User found:', user.name);

} catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    console.error('Network issue - operation was automatically retried');
  } else if (error.code === 'AUTHENTICATION_ERROR') {
    console.error('Authentication failed - check credentials');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

### Null Handling Patterns

```typescript
// Pattern 1: Explicit null check
const user = await userApi.get(userKey);
if (user === null) {
  throw new Error('User not found');
}
// user is now typed as V (not null)

// Pattern 2: Default fallback
const user = await userApi.get(userKey) ?? createDefaultUser();

// Pattern 3: Optional chaining
const userName = (await userApi.get(userKey))?.name ?? 'Unknown';
```

## Return Value

Returns `Promise<V | null>`:
- **V**: The found item with all its properties
- **null**: When item is not found (404 response)

```typescript
// Found item structure
const user = await userApi.get(userKey);
// {
//   id: 'user-123',
//   name: 'John Doe',
//   email: 'john@example.com',
//   active: true,
//   createdAt: '2024-01-15T10:30:00Z',
//   updatedAt: '2024-01-20T14:22:00Z',
//   keyType: 'user'
// }

// Not found
const missingUser = await userApi.get({ keyType: 'user', pk: 'nonexistent' });
// null
```

## Performance Optimization

### Caching Strategies

```typescript
// Simple memory cache
const userCache = new Map<string, User>();

async function getCachedUser(userKey: PriKey<'user'>): Promise<User | null> {
  const cacheKey = `user:${userKey.pk}`;

  // Check cache first
  if (userCache.has(cacheKey)) {
    return userCache.get(cacheKey)!;
  }

  // Fetch from API
  const user = await userApi.get(userKey);

  // Cache the result (including null)
  if (user) {
    userCache.set(cacheKey, user);
  }

  return user;
}
```

### Batch Loading

```typescript
// Load multiple items efficiently
async function getUsersBatch(userKeys: PriKey<'user'>[]): Promise<(User | null)[]> {
  // Use Promise.all for parallel requests
  const promises = userKeys.map(key =>
    userApi.get(key).catch(error => {
      console.error(`Failed to load user ${key.pk}:`, error.message);
      return null;
    })
  );

  return Promise.all(promises);
}
```

## Advanced Patterns

### Safe Get with Type Guards

```typescript
// Type-safe retrieval with validation
async function getValidUser(userKey: PriKey<'user'>): Promise<User> {
  const user = await userApi.get(userKey);

  if (!user) {
    throw new Error(`User ${userKey.pk} not found`);
  }

  if (!user.active) {
    throw new Error(`User ${userKey.pk} is inactive`);
  }

  return user;
}
```

### Retry with Custom Logic

```typescript
// Get with custom retry behavior
async function getWithRetry<T>(
  apiCall: () => Promise<T | null>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T | null> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      if (attempt === maxAttempts) throw error;

      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
  return null;
}

// Usage
const user = await getWithRetry(() => userApi.get(userKey));
```

### Get with Fallback Chain

```typescript
// Try multiple sources for data
async function getUserWithFallbacks(userId: string): Promise<User | null> {
  const userKey = { keyType: 'user' as const, pk: userId };

  // Try primary API
  try {
    const user = await userApi.get(userKey);
    if (user) return user;
  } catch (error) {
    console.warn('Primary API failed:', error.message);
  }

  // Try backup API
  try {
    const user = await backupUserApi.get(userKey);
    if (user) return user;
  } catch (error) {
    console.warn('Backup API failed:', error.message);
  }

  // Try cache
  try {
    const cachedUser = await getUserFromCache(userId);
    if (cachedUser) return cachedUser;
  } catch (error) {
    console.warn('Cache failed:', error.message);
  }

  return null;
}
```

## Common Use Cases

### User Profile Loading

```typescript
// Load user with profile data
async function loadUserProfile(userId: string) {
  const userKey = { keyType: 'user' as const, pk: userId };
  const user = await userApi.get(userKey);

  if (!user) {
    throw new Error('User not found');
  }

  // Load related data
  const [profile, preferences, activity] = await Promise.all([
    profileApi.get({ keyType: 'profile', pk: userId }),
    preferencesApi.get({ keyType: 'preferences', pk: userId }),
    activityApi.allFacet('recent-activity', { limit: 10 }, [userId])
  ]);

  return {
    user,
    profile,
    preferences,
    activity
  };
}
```

### Resource Validation

```typescript
// Validate resource exists before operation
async function updateUserIfExists(
  userKey: PriKey<'user'>,
  updates: Partial<User>
): Promise<User | null> {
  const user = await userApi.get(userKey);

  if (!user) {
    console.log('User not found, skipping update');
    return null;
  }

  // User exists, proceed with update
  return await userApi.update(userKey, updates);
}
```

### Conditional Operations

```typescript
// Perform operation based on item state
async function processUserBasedOnState(userKey: PriKey<'user'>) {
  const user = await userApi.get(userKey);

  if (!user) {
    console.log('User not found');
    return;
  }

  switch (user.status) {
    case 'pending':
      await userApi.action(userKey, 'send-welcome-email');
      break;

    case 'active':
      await userApi.action(userKey, 'update-last-seen');
      break;

    case 'suspended':
      console.log('User is suspended, no action taken');
      break;

    default:
      console.log('Unknown user status:', user.status);
  }
}
```

## Error Scenarios

### Network Issues

```typescript
// Automatic retry handles network issues
try {
  const user = await userApi.get(userKey);
  // Network errors are automatically retried
} catch (error) {
  // Only non-retryable errors reach here
  if (error.code === 'NETWORK_ERROR') {
    // All retries exhausted
    console.error('Network completely unavailable');
  }
}
```

### Authorization

```typescript
// Handle permission issues
try {
  const user = await userApi.get(userKey);
} catch (error) {
  if (error.code === 'AUTHORIZATION_ERROR') {
    console.error('Insufficient permissions to access user');
    // Redirect to login or show error message
  }
}
```

## Related Operations

- [`all`](./all.md) - Get multiple items
- [`one`](./one.md) - Get single item with query
- [`find`](./find.md) - Find items with custom finders
- [`create`](./create.md) - Create new items
- [`update`](./update.md) - Update existing items

## Next Steps

- Explore [Caching Strategies](../guides/caching.md)
- Learn about [Error Handling](../error-handling/README.md)
- Review [Performance Optimization](../guides/performance.md)

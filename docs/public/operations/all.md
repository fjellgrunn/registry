# `all` Operation

Retrieve multiple items with query support, filtering, sorting, and pagination.

## Syntax

### Primary Items (PItemApi)
```typescript
async all(query?: ItemQuery): Promise<V[]>
```

### Contained Items (CItemApi)
```typescript
async all(query?: ItemQuery, locations?: LocKeyArray<L1, L2, L3, L4, L5>): Promise<V[]>
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | `ItemQuery` | No | Query parameters for filtering, sorting, and pagination |
| `locations` | `LocKeyArray` | No | Location context for contained items |

### Query Parameters

```typescript
interface ItemQuery {
  limit?: number;           // Maximum number of items to return
  offset?: number;          // Number of items to skip
  sort?: string;            // Sort specification (e.g., 'name:asc', 'createdAt:desc')
  filter?: string;          // Filter criteria
  search?: string;          // Search terms
  [key: string]: any;       // Additional query parameters
}
```

## Examples

### Basic Usage

```typescript
// Get all users
const users = await userApi.all();

// Get all tasks for a specific user (contained items)
const userTasks = await taskApi.all({}, [userId]);
```

### Pagination

```typescript
// Get first 20 users
const firstPage = await userApi.all({
  limit: 20,
  offset: 0
});

// Get next 20 users
const secondPage = await userApi.all({
  limit: 20,
  offset: 20
});
```

### Filtering

```typescript
// Get active users only
const activeUsers = await userApi.all({
  filter: 'active:true'
});

// Get users created in the last week
const recentUsers = await userApi.all({
  filter: 'createdAt:>:2024-01-01'
});

// Multiple filters
const filteredUsers = await userApi.all({
  filter: 'active:true AND role:admin'
});
```

### Sorting

```typescript
// Sort by name (ascending)
const sortedUsers = await userApi.all({
  sort: 'name:asc'
});

// Sort by creation date (newest first)
const newestUsers = await userApi.all({
  sort: 'createdAt:desc'
});

// Multiple sort criteria
const users = await userApi.all({
  sort: 'role:asc,name:asc'
});
```

### Search

```typescript
// Search users by name or email
const searchResults = await userApi.all({
  search: 'john@example.com'
});

// Combined search with filters
const results = await userApi.all({
  search: 'developer',
  filter: 'active:true',
  sort: 'relevance:desc'
});
```

### Complex Queries

```typescript
// Production-grade query with all parameters
const users = await userApi.all({
  limit: 50,
  offset: 0,
  sort: 'lastLoginAt:desc',
  filter: 'active:true AND role:in:[admin,moderator]',
  search: 'john',
  includeMetadata: true,
  timezone: 'UTC'
});
```

### Contained Items with Location Context

```typescript
// Get all orders for a specific customer
const customerOrders = await orderApi.all({
  sort: 'createdAt:desc',
  limit: 10
}, [customerId]);

// Get all comments for a specific post
const postComments = await commentApi.all({
  filter: 'approved:true',
  sort: 'createdAt:asc'
}, [postId]);

// Multi-level containment
const departmentEmployees = await employeeApi.all({
  filter: 'active:true'
}, [organizationId, departmentId]);
```

## Error Handling

The `all` operation includes comprehensive error handling:

```typescript
try {
  const users = await userApi.all({
    limit: 50,
    filter: 'active:true'
  });

  console.log(`Retrieved ${users.length} users`);
} catch (error) {
  if (error.code === 'VALIDATION_ERROR') {
    console.error('Invalid query parameters:', error.validationErrors);
  } else if (error.code === 'NETWORK_ERROR') {
    console.error('Network issue, operation was retried automatically');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

### Automatic Retry

Network errors and server errors are automatically retried:

```typescript
// This will automatically retry on network failures
const users = await userApi.all({ limit: 100 });
```

## Performance Optimization

### Pagination Best Practices

```typescript
// Use appropriate page sizes
const OPTIMAL_PAGE_SIZE = 50;

async function getAllUsersWithPagination() {
  let allUsers = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const batch = await userApi.all({
      limit: OPTIMAL_PAGE_SIZE,
      offset,
      sort: 'id:asc' // Consistent ordering
    });

    allUsers.push(...batch);
    hasMore = batch.length === OPTIMAL_PAGE_SIZE;
    offset += OPTIMAL_PAGE_SIZE;
  }

  return allUsers;
}
```

### Efficient Filtering

```typescript
// Server-side filtering is more efficient than client-side
const users = await userApi.all({
  filter: 'role:admin AND active:true',  // Server-side filter
  limit: 20
});
// Instead of fetching all and filtering client-side
```

### Caching Strategies

```typescript
// Cache frequently accessed data
const cacheKey = 'active-users';
let users = await cache.get(cacheKey);

if (!users) {
  users = await userApi.all({ filter: 'active:true' });
  await cache.set(cacheKey, users, { ttl: 300 }); // 5 minute cache
}
```

## Return Value

Returns a Promise that resolves to an array of items matching the query criteria.

```typescript
// Each item includes the full object with metadata
const users: User[] = await userApi.all();

// Example return structure
[
  {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    active: true,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:22:00Z',
    keyType: 'user'
  },
  // ... more users
]
```

## Common Patterns

### Load More Pattern

```typescript
class UserList {
  private users: User[] = [];
  private offset = 0;
  private readonly limit = 20;

  async loadMore(): Promise<User[]> {
    const newUsers = await userApi.all({
      limit: this.limit,
      offset: this.offset,
      sort: 'createdAt:desc'
    });

    this.users.push(...newUsers);
    this.offset += newUsers.length;

    return newUsers;
  }

  hasMore(): boolean {
    return this.users.length % this.limit === 0;
  }
}
```

### Real-time Updates

```typescript
// Combining with WebSocket updates
async function getLatestUsers() {
  const users = await userApi.all({
    sort: 'updatedAt:desc',
    limit: 50
  });

  // Set up real-time updates
  websocket.on('user-updated', (updatedUser) => {
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index >= 0) {
      users[index] = updatedUser;
    }
  });

  return users;
}
```

## Related Operations

- [`one`](./one.md) - Get single item with query
- [`find`](./find.md) - Find items using custom finders
- [`get`](./get.md) - Get single item by key
- [`allFacet`](./allFacet.md) - Get analytics for collections

## Next Steps

- Learn about [Query Optimization](../guides/query-optimization.md)
- Explore [Pagination Patterns](../guides/pagination.md)
- Review [Error Handling](../error-handling/README.md) for resilience

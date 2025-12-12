# API Operations

This section provides comprehensive documentation for all available operations in the Fjell Client API. Each operation supports both Primary Items (PItemApi) and Contained Items (CItemApi) with location-aware variants.

## Quick Reference

### Core CRUD Operations
- **[`all`](./all.md)** - Retrieve multiple items with query support
- **[`create`](./create.md)** - Create new items with validation
- **[`get`](./get.md)** - Retrieve single items by key
- **[`update`](./update.md)** - Update existing items with partial data
- **[`remove`](./remove.md)** - Delete items safely
- **[`one`](./one.md)** - Find single item with query conditions

### Business Logic Operations
- **[`action`](./action.md)** - Execute business actions on items
- **[`allAction`](./allAction.md)** - Execute batch actions on collections
- **[`facet`](./facet.md)** - Retrieve analytics and computed data for items
- **[`allFacet`](./allFacet.md)** - Retrieve analytics for collections

### Query Operations
- **[`find`](./find.md)** - Find items using custom finders
- **[`findOne`](./findOne.md)** - Find single item using custom finders

## Operation Categories

### Primary Item Operations (PItemApi)
Operations for independent entities that exist at the top level of your API hierarchy:

```typescript
const userApi = createPItemApi<User, 'user'>('user', ['users'], config);

// Basic CRUD
const users = await userApi.all({ active: true });
const user = await userApi.create({ name: 'John', email: 'john@example.com' });
const foundUser = await userApi.get(userKey);
const updatedUser = await userApi.update(userKey, { name: 'John Smith' });
await userApi.remove(userKey);

// Business logic
await userApi.action(userKey, 'activate', { reason: 'manual' });
const analytics = await userApi.facet(userKey, 'activity-stats');
```

### Contained Item Operations (CItemApi)
Operations for hierarchical entities that require location context:

```typescript
const taskApi = createCItemApi<Task, 'task', 'user'>('task', ['users', 'tasks'], config);

// Location-aware CRUD
const userTasks = await taskApi.all({ status: 'pending' }, [userId]);
const newTask = await taskApi.create({ title: 'Complete project' }, [userId]);

// Location-aware business logic
await taskApi.allAction('bulk-update', { priority: 'high' }, [userId]);
const taskMetrics = await taskApi.allFacet('completion-metrics', {}, [userId]);
```

## Error Handling

All operations include comprehensive error handling with:
- **Automatic retry logic** for transient failures
- **Custom error types** for different scenarios
- **Enhanced error context** for debugging
- **Configurable retry behavior**

See the [Error Handling Documentation](../error-handling/README.md) for complete details.

## Performance Considerations

### Pagination
Use `limit` and `offset` in queries for large datasets:

```typescript
const users = await userApi.all({
  limit: 50,
  offset: 100,
  sort: 'createdAt:desc'
});
```

### Batch Operations
Use `allAction` and `allFacet` for efficient batch processing:

```typescript
// Efficient batch update
await userApi.allAction('bulk-update', {
  lastLoginAt: new Date()
}, { filter: 'active:true' });
```

### Caching Strategies
Implement client-side caching for frequently accessed data:

```typescript
const cachedUser = await cache.get(userKey) || await userApi.get(userKey);
```

## Type Safety

All operations are fully typed with TypeScript generics:

```typescript
interface User extends Item<'user'> {
  name: string;
  email: string;
  active: boolean;
}

// Type-safe operations
const userApi = createPItemApi<User, 'user'>('user', ['users'], config);
const user: User = await userApi.create({ name: 'John', email: 'john@example.com' });
```

## Next Steps

- Review individual operation documentation for detailed examples
- Check the [Configuration Guide](../configuration.md) for setup options
- Explore [Error Handling](../error-handling/README.md) for resilience patterns
- See [Examples](../../examples-README.md) for complete usage scenarios

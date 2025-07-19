# Fjell Registry Errors

This directory contains standardized error classes for the fjell-registry library. These errors provide detailed diagnostic information to help with debugging and error handling.

## Error Hierarchy

All errors extend from the base `RegistryError` class, which provides:
- Structured error messages
- Registry type context
- Additional diagnostic context
- Stack trace preservation
- A `getDetails()` method for comprehensive error information

## Error Categories

### RegistryError (Base Class)
- `RegistryCreationError` - Registry creation failures
- `InvalidFactoryResultError` - Factory functions returning invalid instances
- `InvalidInstanceRegistrationError` - Attempting to register non-instance objects

### InstanceError
- `InstanceNotFoundError` - Instance lookup failures
- `NoInstancesRegisteredError` - Empty instance arrays for existing keys
- `NoInstancesAvailableError` - Internal state issues with instance availability
- `ScopeNotFoundError` - Scope-based instance lookup failures
- `NoChildrenAvailableError` - Tree traversal failures

### CoordinateError
- `InvalidCoordinateError` - Coordinate creation failures
- `InvalidKTAError` - Invalid Key Type Array parameters
- `InvalidScopesError` - Invalid scope array values

### RegistryHubError
- `DuplicateRegistryTypeError` - Registry type conflicts
- `RegistryTypeNotFoundError` - Missing registry types
- `RegistryFactoryError` - Factory function failures
- `InvalidRegistryFactoryResultError` - Invalid factory results

## Usage Examples

### Catching Specific Errors

```typescript
import { InstanceNotFoundError, ScopeNotFoundError } from '@fjell/registry';

try {
  const instance = registry.get(['User'], { scopes: ['firestore'] });
} catch (error) {
  if (error instanceof InstanceNotFoundError) {
    console.log(`Missing key: ${error.missingKey}`);
    console.log(`Key path: ${error.keyPath.join('.')}`);
  } else if (error instanceof ScopeNotFoundError) {
    console.log(`Requested scopes: ${error.requestedScopes.join(', ')}`);
    console.log(`Available scopes: ${error.availableScopes.map(s => s.join(', ')).join(' | ')}`);
  }
}
```

### Using Error Details

```typescript
import { RegistryError } from '@fjell/registry';

try {
  // ... registry operations
} catch (error) {
  if (error instanceof RegistryError) {
    console.log(error.getDetails());
    // Outputs:
    // Error message
    // Registry Type: services
    // Context: { "keyPath": ["User"], "scopes": ["firestore"] }
  }
}
```

### Hub-Level Error Handling

```typescript
import { DuplicateRegistryTypeError, RegistryTypeNotFoundError } from '@fjell/registry';

try {
  hub.registerRegistry(serviceRegistry);
} catch (error) {
  if (error instanceof DuplicateRegistryTypeError) {
    console.log(`Duplicate type: ${error.duplicateType}`);
  }
}

try {
  const instance = hub.get('unknown-type', ['User']);
} catch (error) {
  if (error instanceof RegistryTypeNotFoundError) {
    console.log(`Available types: ${error.availableTypes.join(', ')}`);
  }
}
```

## Benefits

1. **Consistent Error Format** - All errors follow the same structure
2. **Rich Diagnostic Information** - Errors include context like key paths, scopes, and available alternatives
3. **Type Safety** - Specific error types enable precise error handling
4. **Debugging Support** - Detailed error messages with actionable information
5. **Backward Compatibility** - Can be gradually adopted without breaking existing code

## Future Enhancements

The error system can be extended to include:
- Performance metrics in error context
- Suggested fixes or alternatives
- Error codes for programmatic handling
- Integration with logging systems
- Custom error formatting for different environments

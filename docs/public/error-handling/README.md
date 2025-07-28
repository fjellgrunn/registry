# Error Handling

Comprehensive error handling and resilience features for production-ready applications.

## Overview

The Fjell Client API includes a robust error handling system designed for production environments. It provides automatic retry logic, custom error types, enhanced context, and configurable recovery strategies.

## Key Features

### 🔄 **Automatic Retry Logic**
- Exponential backoff with jitter
- Smart error classification (retryable vs non-retryable)
- Configurable retry strategies
- Rate limiting respect

### 🎯 **Custom Error Types**
- Specific error classes for different scenarios
- Enhanced error context and debugging information
- Structured error data for programmatic handling
- Business-friendly error messages

### 🛡️ **Production Resilience**
- Circuit breaker patterns
- Graceful degradation strategies
- Custom error handlers for monitoring integration
- Business workflow error recovery

## Error Types

| Error Type | Code | Retryable | Description |
|------------|------|-----------|-------------|
| **NetworkError** | `NETWORK_ERROR` | ✅ | Connection failures, DNS issues |
| **TimeoutError** | `TIMEOUT_ERROR` | ✅ | Request timeouts |
| **ServerError** | `SERVER_ERROR` | ✅ | 5xx HTTP status codes |
| **RateLimitError** | `RATE_LIMIT_ERROR` | ✅ | 429 Too Many Requests |
| **AuthenticationError** | `AUTHENTICATION_ERROR` | ❌ | 401 Unauthorized |
| **AuthorizationError** | `AUTHORIZATION_ERROR` | ❌ | 403 Forbidden |
| **NotFoundError** | `NOT_FOUND_ERROR` | ❌ | 404 Not Found |
| **ValidationError** | `VALIDATION_ERROR` | ❌ | 400 Bad Request |
| **ConflictError** | `CONFLICT_ERROR` | ❌ | 409 Conflict |
| **PayloadTooLargeError** | `PAYLOAD_TOO_LARGE_ERROR` | ❌ | 413 Request Too Large |

## Error Scenarios

### [Network Errors and Timeouts](./network-errors.md)
Handle connection failures, DNS issues, and request timeouts:
```typescript
try {
  const user = await userApi.get(userKey);
} catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    // Automatically retried with exponential backoff
    console.log('Network recovered after retries');
  }
}
```

### [Authentication and Authorization](./auth-errors.md)
Manage authentication failures and permission issues:
```typescript
try {
  const data = await api.get(key);
} catch (error) {
  if (error.code === 'AUTHENTICATION_ERROR') {
    // Redirect to login
    redirectToLogin();
  }
}
```

### [Validation Errors](./validation-errors.md)
Handle request validation and data format issues:
```typescript
try {
  const user = await userApi.create(userData);
} catch (error) {
  if (error.code === 'VALIDATION_ERROR') {
    // Display field-specific errors
    error.validationErrors.forEach(err => {
      showFieldError(err.field, err.message);
    });
  }
}
```

### [Server Errors and Retry Logic](./server-errors.md)
Automatic retry for server-side failures:
```typescript
// Server errors (5xx) are automatically retried
const user = await userApi.create(userData);
// Will retry up to configured maximum on 500, 502, 503 errors
```

### [Rate Limiting](./rate-limiting.md)
Respect API rate limits with appropriate delays:
```typescript
try {
  const results = await api.all(query);
} catch (error) {
  if (error.code === 'RATE_LIMIT_ERROR') {
    // Automatically retried after rate limit period
    console.log('Rate limit recovered');
  }
}
```

### [Custom Error Handling](./custom-errors.md)
Implement custom error handlers for monitoring and business logic:
```typescript
const config = {
  errorHandler: (error, context) => {
    // Send to monitoring service
    monitoring.recordError(error, context);

    // Business-specific error handling
    if (error.code === 'PAYMENT_FAILED') {
      sendPaymentFailureNotification(context.customerId);
    }
  }
};
```

## Configuration

### Basic Configuration

```typescript
const config = {
  baseUrl: 'https://api.example.com',
  retryConfig: {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    enableJitter: true
  },
  enableErrorHandling: true
};

const userApi = createPItemApi<User, 'user'>('user', ['users'], config);
```

### Advanced Configuration

```typescript
const enterpriseConfig = {
  baseUrl: 'https://api.enterprise.com',
  retryConfig: {
    maxRetries: 5,
    initialDelayMs: 500,
    maxDelayMs: 60000,
    backoffMultiplier: 1.5,
    enableJitter: true,

    // Custom retry logic
    shouldRetry: (error, attemptNumber) => {
      if (error.code === 'PAYMENT_ERROR') {
        return attemptNumber < 2; // Limited retries for payments
      }
      return error.isRetryable && attemptNumber < 5;
    },

    // Custom retry callback
    onRetry: (error, attemptNumber, delay) => {
      logger.warn(`Retrying API call (attempt ${attemptNumber + 1})`, {
        errorCode: error.code,
        delay
      });
    }
  },

  // Custom error handler
  errorHandler: (error, context) => {
    // Centralized error logging
    logger.error('API Operation Failed', {
      error: error.message,
      code: error.code,
      operation: context.operation,
      duration: context.duration
    });

    // Send to error tracking
    errorTracking.captureException(error, { extra: context });

    // Business logic
    if (error.code === 'RATE_LIMIT_ERROR') {
      circuitBreaker.recordFailure();
    }
  }
};
```

## Best Practices

### 1. **Handle Specific Error Types**

```typescript
try {
  const result = await api.operation();
} catch (error) {
  switch (error.code) {
    case 'VALIDATION_ERROR':
      handleValidationErrors(error.validationErrors);
      break;
    case 'AUTHENTICATION_ERROR':
      redirectToLogin();
      break;
    case 'NETWORK_ERROR':
      showNetworkErrorMessage();
      break;
    default:
      showGenericErrorMessage(error.message);
  }
}
```

### 2. **Implement Graceful Degradation**

```typescript
async function getUserWithFallback(userKey: PriKey<'user'>): Promise<User | null> {
  try {
    return await userApi.get(userKey);
  } catch (error) {
    if (error.code === 'NETWORK_ERROR') {
      // Use cached data
      return await getCachedUser(userKey);
    }

    if (error.code === 'NOT_FOUND_ERROR') {
      // Return null gracefully
      return null;
    }

    // Re-throw unexpected errors
    throw error;
  }
}
```

### 3. **Monitor Error Patterns**

```typescript
const errorMetrics = {
  recordError: (error: ClientApiError, context: any) => {
    metrics.increment('api.errors.total', {
      error_code: error.code,
      operation: context.operation
    });

    if (error.isRetryable) {
      metrics.increment('api.errors.retryable');
    }
  }
};
```

### 4. **Business Workflow Recovery**

```typescript
async function createOrderWithRecovery(orderData: OrderData) {
  const transaction = await beginTransaction();

  try {
    const order = await orderApi.create(orderData);
    const payment = await paymentApi.create({ orderId: order.id });

    await transaction.commit();
    return order;

  } catch (error) {
    await transaction.rollback();

    // Compensating actions
    if (error.code === 'PAYMENT_FAILED') {
      await notificationService.sendPaymentFailure(orderData.customerId);
    }

    throw error;
  }
}
```

## Testing Error Scenarios

### Unit Testing

```typescript
describe('Error Handling', () => {
  it('should retry on network errors', async () => {
    const mockApi = createMockApi();
    mockApi.httpGet.mockRejectedValueOnce(new NetworkError('Connection failed'));
    mockApi.httpGet.mockResolvedValueOnce({ id: 'user-123' });

    const user = await userApi.get(userKey);
    expect(user.id).toBe('user-123');
    expect(mockApi.httpGet).toHaveBeenCalledTimes(2);
  });

  it('should not retry on validation errors', async () => {
    const mockApi = createMockApi();
    mockApi.httpPost.mockRejectedValue(new ValidationError('Invalid data'));

    await expect(userApi.create({})).rejects.toThrow('Invalid data');
    expect(mockApi.httpPost).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Testing

```typescript
describe('Error Recovery', () => {
  it('should handle server downtime gracefully', async () => {
    // Simulate server being down then recovering
    server.use(
      rest.get('/api/users/:id', (req, res, ctx) => {
        return res.once(ctx.status(500));
      }),
      rest.get('/api/users/:id', (req, res, ctx) => {
        return res(ctx.json({ id: 'user-123' }));
      })
    );

    const user = await userApi.get(userKey);
    expect(user.id).toBe('user-123');
  });
});
```

## Production Checklist

- [ ] Configure appropriate retry strategies for your use case
- [ ] Implement custom error handlers for monitoring and alerting
- [ ] Set up error tracking (Sentry, Datadog, etc.)
- [ ] Add business-specific error recovery logic
- [ ] Implement graceful degradation for critical paths
- [ ] Monitor error rates and patterns
- [ ] Test error scenarios in staging environments
- [ ] Document error handling procedures for your team
- [ ] Set up alerts for critical error patterns
- [ ] Implement circuit breakers for external services

## Related Documentation

- [Configuration Guide](../configuration.md) - Configure error handling behavior
- [Operations](../operations/README.md) - Error handling in specific operations
- [Examples](../../examples-README.md) - Error handling examples and patterns

## Next Steps

1. Review specific error scenario documentation
2. Configure error handling for your environment
3. Implement custom error handlers for your monitoring stack
4. Test error scenarios in your application
5. Set up monitoring and alerting for production

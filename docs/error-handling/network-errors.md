# Network Errors and Timeouts

Handle connection failures, DNS issues, and request timeouts with automatic retry logic.

## Overview

Network errors are among the most common issues in distributed systems. The Fjell Client API automatically handles these transient failures with intelligent retry logic and exponential backoff.

## Error Types

### NetworkError
- **Code**: `NETWORK_ERROR`
- **Retryable**: ✅ Yes
- **Common Causes**: Connection refused, DNS resolution failure, network unreachable
- **HTTP Equivalents**: Connection timeouts, DNS errors, network unavailable

### TimeoutError
- **Code**: `TIMEOUT_ERROR`
- **Retryable**: ✅ Yes
- **Common Causes**: Request takes longer than configured timeout
- **HTTP Equivalents**: Request timeout, gateway timeout

## Automatic Retry Behavior

Network errors are automatically retried with exponential backoff:

```typescript
// This will automatically retry on network failures
try {
  const user = await userApi.get(userKey);
  console.log('Success (possibly after retries):', user.name);
} catch (error) {
  // Only reaches here after all retry attempts failed
  console.error('Network completely unavailable:', error.message);
}
```

### Default Retry Configuration

```typescript
const defaultRetryConfig = {
  maxRetries: 3,                // Maximum retry attempts
  initialDelayMs: 1000,         // Initial delay: 1 second
  maxDelayMs: 30000,           // Maximum delay: 30 seconds
  backoffMultiplier: 2,        // Double delay each time
  enableJitter: true           // Add randomness to prevent thundering herd
};
```

### Retry Sequence Example

For a network error with default configuration:

1. **Initial attempt**: Fails with `ECONNREFUSED`
2. **Retry 1**: Wait ~1000ms (with jitter: 500-1000ms), retry
3. **Retry 2**: Wait ~2000ms (with jitter: 1000-2000ms), retry
4. **Retry 3**: Wait ~4000ms (with jitter: 2000-4000ms), retry
5. **Final failure**: If still failing, throw error

## Configuration

### Basic Network Resilience

```typescript
const config = {
  baseUrl: 'https://api.example.com',
  retryConfig: {
    maxRetries: 5,           // More retries for critical operations
    initialDelayMs: 500,     // Faster initial retry
    maxDelayMs: 60000,      // Allow longer delays
    enableJitter: true       // Prevent retry storms
  }
};

const userApi = createPItemApi<User, 'user'>('user', ['users'], config);
```

### Custom Network Error Handling

```typescript
const networkResilientConfig = {
  baseUrl: 'https://api.example.com',
  retryConfig: {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    enableJitter: true,

    // Custom retry logic for network errors
    shouldRetry: (error, attemptNumber) => {
      // Always retry network and timeout errors
      if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT_ERROR') {
        return attemptNumber < 5; // Allow up to 5 retries for network issues
      }

      // Default retry logic for other errors
      return error.isRetryable && attemptNumber < 3;
    },

    // Monitor retry attempts
    onRetry: (error, attemptNumber, delay) => {
      console.log(`Network retry ${attemptNumber + 1}: ${error.message} (delay: ${delay}ms)`);

      // Send metrics to monitoring service
      metrics.increment('api.network.retry', {
        error_code: error.code,
        attempt: attemptNumber + 1
      });
    }
  }
};
```

## Error Handling Patterns

### Basic Network Error Handling

```typescript
async function fetchUserSafely(userKey: PriKey<'user'>): Promise<User | null> {
  try {
    return await userApi.get(userKey);
  } catch (error) {
    if (error.code === 'NETWORK_ERROR') {
      console.log('Network issue resolved automatically or exhausted retries');

      // Could show user-friendly message
      showNotification('Network connection issues. Please try again later.');
      return null;
    }

    if (error.code === 'TIMEOUT_ERROR') {
      console.log('Request timed out after retries');

      // Could suggest checking connection
      showNotification('Request timed out. Please check your connection.');
      return null;
    }

    // Re-throw unexpected errors
    throw error;
  }
}
```

### Graceful Degradation

```typescript
async function getUserWithFallback(userKey: PriKey<'user'>): Promise<User | null> {
  try {
    // Try primary API with retry
    return await userApi.get(userKey);

  } catch (error) {
    if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT_ERROR') {
      console.log('Primary API unavailable, trying alternatives...');

      // Try cached data
      try {
        const cachedUser = await cache.get(`user:${userKey.pk}`);
        if (cachedUser) {
          console.log('Serving from cache');
          return cachedUser;
        }
      } catch (cacheError) {
        console.warn('Cache also unavailable:', cacheError.message);
      }

      // Try backup API
      try {
        const backupUser = await backupUserApi.get(userKey);
        console.log('Served from backup API');
        return backupUser;
      } catch (backupError) {
        console.warn('Backup API also failed:', backupError.message);
      }

      // All sources failed
      console.error('All data sources unavailable');
      return null;
    }

    // Non-network errors
    throw error;
  }
}
```

### Circuit Breaker Pattern

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private failureThreshold = 5,
    private recoveryTimeMs = 30000
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeMs) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();

      // Success - reset circuit breaker
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
        this.failures = 0;
      }

      return result;

    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();

      if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT_ERROR') {
        if (this.failures >= this.failureThreshold) {
          this.state = 'OPEN';
          console.log('Circuit breaker opened due to network failures');
        }
      }

      throw error;
    }
  }
}

// Usage
const circuitBreaker = new CircuitBreaker(3, 10000); // 3 failures, 10s recovery

async function resilientApiCall(userKey: PriKey<'user'>): Promise<User | null> {
  try {
    return await circuitBreaker.execute(() => userApi.get(userKey));
  } catch (error) {
    if (error.message === 'Circuit breaker is OPEN') {
      console.log('Circuit breaker preventing calls, using fallback');
      return await getFallbackUser(userKey);
    }
    throw error;
  }
}
```

## Monitoring and Observability

### Network Error Metrics

```typescript
const networkMetrics = {
  // Track network error rates
  recordNetworkError: (error: NetworkError, context: any) => {
    metrics.increment('api.network.errors', {
      error_type: error.code,
      endpoint: context.url,
      method: context.method
    });
  },

  // Track retry success rates
  recordRetrySuccess: (attemptNumber: number, context: any) => {
    metrics.increment('api.network.retry_success', {
      attempt_number: attemptNumber,
      endpoint: context.url
    });

    metrics.timing('api.network.recovery_time', context.duration, {
      attempts: attemptNumber
    });
  },

  // Track connection health
  recordConnectionHealth: (isHealthy: boolean) => {
    metrics.gauge('api.network.health', isHealthy ? 1 : 0);
  }
};

// Custom error handler with metrics
const config = {
  errorHandler: (error, context) => {
    if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT_ERROR') {
      networkMetrics.recordNetworkError(error, context);

      // Alert on high network error rates
      if (context.totalAttempts >= 3) {
        alerting.sendAlert({
          severity: 'warning',
          message: `High network error rate: ${error.message}`,
          context
        });
      }
    }
  }
};
```

### Health Checks

```typescript
async function performHealthCheck(): Promise<boolean> {
  try {
    // Simple health check endpoint
    await healthApi.get({ keyType: 'health', pk: 'status' });
    networkMetrics.recordConnectionHealth(true);
    return true;
  } catch (error) {
    if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT_ERROR') {
      networkMetrics.recordConnectionHealth(false);
      console.warn('Health check failed:', error.message);
      return false;
    }

    // API is reachable but returned an error
    networkMetrics.recordConnectionHealth(true);
    return true;
  }
}

// Run health checks periodically
setInterval(performHealthCheck, 30000); // Every 30 seconds
```

## Testing Network Errors

### Unit Testing

```typescript
describe('Network Error Handling', () => {
  it('should retry on network errors', async () => {
    const mockApi = createMockApi();

    // First call fails, second succeeds
    mockApi.httpGet
      .mockRejectedValueOnce(new NetworkError('ECONNREFUSED'))
      .mockResolvedValueOnce({ id: 'user-123' });

    const user = await userApi.get(userKey);

    expect(user.id).toBe('user-123');
    expect(mockApi.httpGet).toHaveBeenCalledTimes(2);
  });

  it('should respect max retries', async () => {
    const mockApi = createMockApi();
    mockApi.httpGet.mockRejectedValue(new NetworkError('ECONNREFUSED'));

    const config = { retryConfig: { maxRetries: 2 } };
    const api = createPItemApi<User, 'user'>('user', ['users'], config);

    await expect(api.get(userKey)).rejects.toThrow('ECONNREFUSED');
    expect(mockApi.httpGet).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });

  it('should apply exponential backoff', async () => {
    const delays: number[] = [];
    const mockSetTimeout = jest.spyOn(global, 'setTimeout').mockImplementation((fn, delay) => {
      delays.push(delay);
      return setTimeout(fn, 0); // Execute immediately for testing
    });

    const mockApi = createMockApi();
    mockApi.httpGet.mockRejectedValue(new NetworkError('ECONNREFUSED'));

    try {
      await userApi.get(userKey);
    } catch (error) {
      // Expected to fail after retries
    }

    expect(delays).toHaveLength(3);
    expect(delays[1]).toBeGreaterThan(delays[0]); // Exponential increase
    expect(delays[2]).toBeGreaterThan(delays[1]);

    mockSetTimeout.mockRestore();
  });
});
```

### Integration Testing

```typescript
describe('Network Resilience Integration', () => {
  it('should handle intermittent network issues', async () => {
    let callCount = 0;

    server.use(
      rest.get('/api/users/:id', (req, res, ctx) => {
        callCount++;

        // Fail first two calls, succeed on third
        if (callCount <= 2) {
          return res.networkError('Connection failed');
        }

        return res(ctx.json({ id: 'user-123' }));
      })
    );

    const user = await userApi.get(userKey);
    expect(user.id).toBe('user-123');
    expect(callCount).toBe(3);
  });
});
```

## Best Practices

### 1. **Configure Appropriate Timeouts**

```typescript
const config = {
  baseUrl: 'https://api.example.com',
  timeout: 10000, // 10 second timeout
  retryConfig: {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 15000
  }
};
```

### 2. **Implement Progressive Degradation**

```typescript
async function getDataWithDegradation(key: string) {
  try {
    // Try full data
    return await api.getFullData(key);
  } catch (error) {
    if (error.code === 'NETWORK_ERROR') {
      try {
        // Try summary data (smaller payload)
        return await api.getSummaryData(key);
      } catch (summaryError) {
        // Use cached minimal data
        return await cache.getMinimalData(key);
      }
    }
    throw error;
  }
}
```

### 3. **User Experience Considerations**

```typescript
async function fetchDataWithUI(key: string) {
  const loadingIndicator = showLoadingSpinner();

  try {
    const data = await api.getData(key);
    hideLoadingSpinner(loadingIndicator);
    return data;

  } catch (error) {
    hideLoadingSpinner(loadingIndicator);

    if (error.code === 'NETWORK_ERROR') {
      showNotification('Connection issue. Retrying automatically...', 'info');

      // Give user option to retry manually
      showRetryButton(() => fetchDataWithUI(key));
    } else if (error.code === 'TIMEOUT_ERROR') {
      showNotification('Request timed out. Please try again.', 'warning');
    }

    throw error;
  }
}
```

## Related Documentation

- [Error Handling Overview](./README.md) - Complete error handling guide
- [Server Errors](./server-errors.md) - Handle 5xx server errors
- [Configuration](../configuration.md) - Configure retry behavior

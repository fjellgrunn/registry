# Configuration Guide

Complete guide to configuring the Fjell Client API for development and production environments.

## Overview

The Fjell Client API provides extensive configuration options for authentication, error handling, retry logic, monitoring, and performance optimization. This guide covers all available options with practical examples.

## Basic Configuration

### Minimal Setup

```typescript
import { createPItemApi, createCItemApi } from '@fjell/client-api';

// Minimal configuration for development
const config = {
  baseUrl: 'http://localhost:3000/api'
};

const userApi = createPItemApi<User, 'user'>('user', ['users'], config);
const taskApi = createCItemApi<Task, 'task', 'user'>('task', ['users', 'tasks'], config);
```

### Standard Development Configuration

```typescript
const devConfig = {
  baseUrl: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Version': '1.0.0'
  },
  timeout: 10000,
  enableErrorHandling: true,
  retryConfig: {
    maxRetries: 2,
    initialDelayMs: 500,
    maxDelayMs: 5000
  }
};
```

## Configuration Options

### ClientApiOptions Interface

```typescript
interface ClientApiOptions {
  // Required
  baseUrl: string;                                    // API base URL

  // HTTP Configuration
  headers?: Record<string, string>;                   // Default headers
  timeout?: number;                                   // Request timeout (ms)

  // Authentication
  readAuthenticated?: boolean;                        // Authenticate read operations
  writeAuthenticated?: boolean;                       // Authenticate write operations
  getOptions?: RequestOptions;                        // GET request options
  postOptions?: RequestOptions;                       // POST request options
  putOptions?: RequestOptions;                        // PUT request options
  deleteOptions?: RequestOptions;                     // DELETE request options

  // Error Handling
  enableErrorHandling?: boolean;                      // Enable comprehensive error handling
  retryConfig?: RetryConfig;                          // Retry behavior configuration
  errorHandler?: (error: any, context?: Record<string, any>) => void;  // Custom error handler

  // Advanced
  transformRequest?: (data: any) => any;              // Transform request data
  transformResponse?: (data: any) => any;             // Transform response data
}
```

### RetryConfig Interface

```typescript
interface RetryConfig {
  maxRetries: number;                                 // Maximum retry attempts
  initialDelayMs: number;                             // Initial delay between retries
  maxDelayMs: number;                                 // Maximum delay between retries
  backoffMultiplier: number;                          // Exponential backoff multiplier
  enableJitter: boolean;                              // Add randomness to delays

  // Advanced retry logic
  shouldRetry?: (error: any, attemptNumber: number) => boolean;  // Custom retry decision
  onRetry?: (error: any, attemptNumber: number, delay: number) => void;  // Retry callback
}
```

## Authentication Configuration

### Basic Authentication

```typescript
const authConfig = {
  baseUrl: 'https://api.example.com',
  headers: {
    'Authorization': 'Bearer your-api-token',
    'Content-Type': 'application/json'
  },
  readAuthenticated: true,
  writeAuthenticated: true
};
```

### Dynamic Authentication

```typescript
// Token that updates automatically
let authToken = 'initial-token';

const dynamicAuthConfig = {
  baseUrl: 'https://api.example.com',
  headers: {
    get 'Authorization'() {
      return `Bearer ${authToken}`;
    },
    'Content-Type': 'application/json'
  }
};

// Update token when needed
function updateAuthToken(newToken: string) {
  authToken = newToken;
}
```

### Per-Operation Authentication

```typescript
const mixedAuthConfig = {
  baseUrl: 'https://api.example.com',

  // Default headers (no auth)
  headers: {
    'Content-Type': 'application/json'
  },

  // Authenticate only write operations
  writeAuthenticated: true,

  // Custom options for different operations
  postOptions: {
    headers: {
      'Authorization': 'Bearer write-token',
      'X-Write-Permission': 'true'
    }
  },

  putOptions: {
    headers: {
      'Authorization': 'Bearer write-token',
      'X-Write-Permission': 'true'
    }
  },

  deleteOptions: {
    headers: {
      'Authorization': 'Bearer admin-token',
      'X-Admin-Permission': 'true'
    }
  }
};
```

## Retry Configuration

### Development Retry Settings

```typescript
const devRetryConfig = {
  maxRetries: 2,
  initialDelayMs: 500,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
  enableJitter: true
};
```

### Production Retry Settings

```typescript
const prodRetryConfig = {
  maxRetries: 5,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 1.5,
  enableJitter: true,

  // Custom retry logic for production
  shouldRetry: (error, attemptNumber) => {
    // Always retry network and server errors
    if (error.code === 'NETWORK_ERROR' || error.code === 'SERVER_ERROR') {
      return attemptNumber < 5;
    }

    // Limited retries for rate limiting
    if (error.code === 'RATE_LIMIT_ERROR') {
      return attemptNumber < 3;
    }

    // No retries for client errors
    if (error.status >= 400 && error.status < 500) {
      return false;
    }

    return error.isRetryable && attemptNumber < 3;
  },

  // Monitor retry attempts
  onRetry: (error, attemptNumber, delay) => {
    console.log(`Retry attempt ${attemptNumber + 1} for ${error.code} (delay: ${delay}ms)`);

    // Send metrics to monitoring service
    metrics.increment('api.retry', {
      error_code: error.code,
      attempt: attemptNumber + 1
    });
  }
};
```

### Operation-Specific Retry Configuration

```typescript
// Different retry strategies for different operations
const adaptiveRetryConfig = {
  shouldRetry: (error, attemptNumber, context) => {
    // More aggressive retries for read operations
    if (context?.operation === 'get' || context?.operation === 'all') {
      return error.isRetryable && attemptNumber < 5;
    }

    // Conservative retries for write operations
    if (context?.operation === 'create' || context?.operation === 'update') {
      return error.isRetryable && attemptNumber < 2;
    }

    // No retries for delete operations
    if (context?.operation === 'remove') {
      return false;
    }

    return error.isRetryable && attemptNumber < 3;
  }
};
```

## Error Handling Configuration

### Basic Error Handler

```typescript
const basicErrorHandler = (error: any, context?: Record<string, any>) => {
  console.error('API Error:', {
    message: error.message,
    code: error.code,
    operation: context?.operation,
    url: context?.url
  });
};

const config = {
  baseUrl: 'https://api.example.com',
  enableErrorHandling: true,
  errorHandler: basicErrorHandler
};
```

### Production Error Handler

```typescript
const productionErrorHandler = (error: any, context?: Record<string, any>) => {
  // Structured logging
  logger.error('API Operation Failed', {
    error: {
      message: error.message,
      code: error.code,
      stack: error.stack
    },
    context: {
      operation: context?.operation,
      url: context?.url,
      method: context?.method,
      duration: context?.duration,
      attempts: context?.attempts
    },
    timestamp: new Date().toISOString(),
    requestId: context?.requestId || generateRequestId()
  });

  // Error tracking service
  errorTracking.captureException(error, {
    tags: {
      service: 'fjell-client-api',
      operation: context?.operation,
      environment: process.env.NODE_ENV
    },
    extra: context,
    user: {
      id: getCurrentUserId()
    }
  });

  // Business logic based on error type
  if (error.code === 'AUTHENTICATION_ERROR') {
    // Redirect to login
    authService.redirectToLogin();
  } else if (error.code === 'RATE_LIMIT_ERROR') {
    // Implement circuit breaker
    circuitBreaker.recordFailure();
  } else if (error.code === 'PAYMENT_ERROR') {
    // Send business notification
    notificationService.sendPaymentFailure({
      userId: context?.userId,
      orderId: context?.orderId,
      error: error.message
    });
  }

  // Metrics collection
  metrics.increment('api.errors.total', {
    error_code: error.code,
    operation: context?.operation,
    environment: process.env.NODE_ENV
  });

  // Alerting for critical errors
  if (error.code === 'SERVER_ERROR' && context?.attempts >= 3) {
    alerting.sendAlert({
      severity: 'high',
      title: 'API Server Error After Multiple Retries',
      description: `Operation ${context.operation} failed with ${error.message} after ${context.attempts} attempts`,
      context
    });
  }
};
```

## Environment-Specific Configuration

### Development Environment

```typescript
const developmentConfig = {
  baseUrl: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
    'X-Environment': 'development'
  },
  timeout: 10000,
  enableErrorHandling: true,

  retryConfig: {
    maxRetries: 2,
    initialDelayMs: 500,
    maxDelayMs: 5000,
    backoffMultiplier: 2,
    enableJitter: false  // Consistent timing for development
  },

  errorHandler: (error, context) => {
    // Detailed logging for development
    console.group('🚨 API Error Details');
    console.error('Error:', error);
    console.log('Context:', context);
    console.groupEnd();
  }
};
```

### Staging Environment

```typescript
const stagingConfig = {
  baseUrl: 'https://api-staging.example.com',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.STAGING_API_TOKEN}`,
    'X-Environment': 'staging'
  },
  timeout: 15000,
  enableErrorHandling: true,

  retryConfig: {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 15000,
    backoffMultiplier: 2,
    enableJitter: true
  },

  errorHandler: (error, context) => {
    // Same as production but with additional debugging
    productionErrorHandler(error, context);

    // Extra staging-specific logging
    if (process.env.STAGING_DEBUG === 'true') {
      console.log('Staging Debug Info:', {
        error,
        context,
        environment: 'staging'
      });
    }
  }
};
```

### Production Environment

```typescript
const productionConfig = {
  baseUrl: 'https://api.example.com',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.PRODUCTION_API_TOKEN}`,
    'X-Environment': 'production',
    'X-Service-Version': process.env.SERVICE_VERSION,
    'X-Request-Source': 'fjell-client-api'
  },
  timeout: 30000,
  enableErrorHandling: true,

  retryConfig: {
    maxRetries: 5,
    initialDelayMs: 1000,
    maxDelayMs: 60000,
    backoffMultiplier: 1.5,
    enableJitter: true,

    shouldRetry: (error, attemptNumber) => {
      // Production-optimized retry logic
      if (error.code === 'NETWORK_ERROR') return attemptNumber < 5;
      if (error.code === 'SERVER_ERROR') return attemptNumber < 3;
      if (error.code === 'RATE_LIMIT_ERROR') return attemptNumber < 3;
      if (error.code === 'TIMEOUT_ERROR') return attemptNumber < 2;
      return false;
    },

    onRetry: (error, attemptNumber, delay) => {
      // Production retry monitoring
      metrics.increment('api.retries', {
        error_code: error.code,
        attempt: attemptNumber + 1
      });
    }
  },

  errorHandler: productionErrorHandler
};
```

## Advanced Configuration Patterns

### Multi-Environment Configuration Factory

```typescript
interface EnvironmentConfig {
  api: {
    baseUrl: string;
    token: string;
  };
  retry: {
    maxRetries: number;
    timeout: number;
  };
  monitoring: {
    enabled: boolean;
    endpoint?: string;
  };
}

const environments: Record<string, EnvironmentConfig> = {
  development: {
    api: {
      baseUrl: 'http://localhost:3000/api',
      token: 'dev-token'
    },
    retry: {
      maxRetries: 2,
      timeout: 10000
    },
    monitoring: {
      enabled: false
    }
  },

  production: {
    api: {
      baseUrl: 'https://api.example.com',
      token: process.env.PROD_API_TOKEN!
    },
    retry: {
      maxRetries: 5,
      timeout: 30000
    },
    monitoring: {
      enabled: true,
      endpoint: 'https://monitoring.example.com'
    }
  }
};

function createApiConfig(environment: string): ClientApiOptions {
  const envConfig = environments[environment];
  if (!envConfig) {
    throw new Error(`Unknown environment: ${environment}`);
  }

  return {
    baseUrl: envConfig.api.baseUrl,
    headers: {
      'Authorization': `Bearer ${envConfig.api.token}`,
      'Content-Type': 'application/json',
      'X-Environment': environment
    },
    timeout: envConfig.retry.timeout,
    enableErrorHandling: true,

    retryConfig: {
      maxRetries: envConfig.retry.maxRetries,
      initialDelayMs: 1000,
      maxDelayMs: environment === 'production' ? 60000 : 15000,
      backoffMultiplier: environment === 'production' ? 1.5 : 2,
      enableJitter: true
    },

    errorHandler: envConfig.monitoring.enabled
      ? productionErrorHandler
      : developmentErrorHandler
  };
}

// Usage
const config = createApiConfig(process.env.NODE_ENV || 'development');
const userApi = createPItemApi<User, 'user'>('user', ['users'], config);
```

### Configuration with Secrets Management

```typescript
import { getSecret } from './secrets';

async function createSecureApiConfig(): Promise<ClientApiOptions> {
  const apiToken = await getSecret('API_TOKEN');
  const encryptionKey = await getSecret('ENCRYPTION_KEY');

  return {
    baseUrl: process.env.API_BASE_URL!,
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
      'X-Encryption-Key': encryptionKey
    },
    timeout: 30000,
    enableErrorHandling: true,

    // Transform sensitive data
    transformRequest: (data) => {
      // Encrypt sensitive fields
      if (data.password) {
        data.password = encrypt(data.password, encryptionKey);
      }
      return data;
    },

    transformResponse: (data) => {
      // Decrypt sensitive fields
      if (data.encryptedData) {
        data.decryptedData = decrypt(data.encryptedData, encryptionKey);
        delete data.encryptedData;
      }
      return data;
    }
  };
}
```

### Configuration Validation

```typescript
import Joi from 'joi';

const configSchema = Joi.object({
  baseUrl: Joi.string().uri().required(),
  timeout: Joi.number().min(1000).max(300000).default(30000),
  retryConfig: Joi.object({
    maxRetries: Joi.number().min(0).max(10).required(),
    initialDelayMs: Joi.number().min(100).max(10000).required(),
    maxDelayMs: Joi.number().min(1000).max(300000).required(),
    backoffMultiplier: Joi.number().min(1).max(5).required(),
    enableJitter: Joi.boolean().required()
  }).required()
});

function validateConfig(config: ClientApiOptions): ClientApiOptions {
  const { error, value } = configSchema.validate(config);

  if (error) {
    throw new Error(`Invalid configuration: ${error.message}`);
  }

  return value;
}

// Usage
const config = validateConfig({
  baseUrl: 'https://api.example.com',
  retryConfig: {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    enableJitter: true
  }
});
```

## Testing Configuration

### Mock Configuration for Testing

```typescript
const testConfig: ClientApiOptions = {
  baseUrl: 'http://mock-api.test',
  timeout: 5000,
  enableErrorHandling: false,  // Disable for predictable testing

  retryConfig: {
    maxRetries: 1,  // Minimal retries for faster tests
    initialDelayMs: 10,
    maxDelayMs: 100,
    backoffMultiplier: 1,
    enableJitter: false  // Consistent timing for tests
  },

  errorHandler: (error, context) => {
    // Capture errors for test assertions
    testErrorCapture.capture(error, context);
  }
};
```

### Integration Test Configuration

```typescript
const integrationTestConfig: ClientApiOptions = {
  baseUrl: process.env.TEST_API_URL || 'http://localhost:3001/api',
  headers: {
    'Authorization': `Bearer ${process.env.TEST_API_TOKEN}`,
    'X-Test-Mode': 'true'
  },
  timeout: 10000,
  enableErrorHandling: true,

  retryConfig: {
    maxRetries: 2,
    initialDelayMs: 100,
    maxDelayMs: 1000,
    backoffMultiplier: 2,
    enableJitter: false
  }
};
```

## Configuration Best Practices

### 1. **Environment Variables**

```typescript
// Use environment variables for sensitive data
const config = {
  baseUrl: process.env.API_BASE_URL!,
  headers: {
    'Authorization': `Bearer ${process.env.API_TOKEN!}`,
  },
  timeout: parseInt(process.env.API_TIMEOUT || '30000'),

  retryConfig: {
    maxRetries: parseInt(process.env.API_MAX_RETRIES || '3'),
    initialDelayMs: parseInt(process.env.API_INITIAL_DELAY || '1000')
  }
};
```

### 2. **Configuration Hierarchy**

```typescript
// Base configuration
const baseConfig = {
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'fjell-client-api/1.0'
  },
  timeout: 30000,
  enableErrorHandling: true
};

// Environment-specific overrides
const envConfig = {
  development: {
    ...baseConfig,
    baseUrl: 'http://localhost:3000/api',
    retryConfig: { maxRetries: 2 }
  },

  production: {
    ...baseConfig,
    baseUrl: 'https://api.example.com',
    retryConfig: { maxRetries: 5 }
  }
};
```

### 3. **Type Safety**

```typescript
// Use TypeScript for configuration validation
interface AppConfig {
  api: ClientApiOptions;
  features: {
    enableRetries: boolean;
    enableCaching: boolean;
  };
}

const appConfig: AppConfig = {
  api: {
    baseUrl: process.env.API_BASE_URL!,
    retryConfig: {
      maxRetries: 3,
      initialDelayMs: 1000,
      maxDelayMs: 30000,
      backoffMultiplier: 2,
      enableJitter: true
    }
  },
  features: {
    enableRetries: true,
    enableCaching: false
  }
};
```

## Related Documentation

- [Error Handling](./error-handling/README.md) - Configure error handling behavior
- [Operations](./operations/README.md) - Operation-specific configuration
- [Examples](../examples-README.md) - Configuration examples and patterns

## Next Steps

1. Choose appropriate configuration for your environment
2. Set up error handling and monitoring
3. Configure retry behavior for your use case
4. Test configuration in staging environment
5. Monitor and adjust configuration based on production metrics
